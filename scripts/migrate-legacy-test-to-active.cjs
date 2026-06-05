const fs = require('fs');
const { Client } = require('pg');

function parseEnv(path) {
  const output = {};
  const text = fs.readFileSync(path, 'utf8');

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const index = trimmed.indexOf('=');
    if (index < 0) continue;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    output[key] = value;
  }

  return output;
}

function quoteIdent(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

async function getColumns(client, table) {
  const result = await client.query(
    `select column_name
     from information_schema.columns
     where table_schema = 'public' and table_name = $1
     order by ordinal_position`,
    [table]
  );
  return result.rows.map((row) => row.column_name);
}

async function insertRows(client, table, rows, columns, conflict = '', batchSize = 500) {
  if (rows.length === 0) return 0;

  let inserted = 0;
  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const quotedColumns = columns.map(quoteIdent).join(', ');
    const values = [];
    const rowPlaceholders = batch.map((row, rowIndex) => {
      const placeholders = columns.map((column, columnIndex) => {
        values.push(row[column]);
        return `$${rowIndex * columns.length + columnIndex + 1}`;
      });
      return `(${placeholders.join(', ')})`;
    });

    const result = await client.query(
      `insert into ${quoteIdent(table)} (${quotedColumns}) values ${rowPlaceholders.join(', ')} ${conflict}`,
      values
    );
    inserted += result.rowCount || 0;
  }

  return inserted;
}

async function columnIntersection(source, target, excluded = []) {
  const excludedSet = new Set(excluded);
  return source.filter((column) => target.includes(column) && !excludedSet.has(column));
}

async function main() {
  const sourceUrl = parseEnv('.env.legacy-test').DATABASE_URL;
  const targetUrl = parseEnv('.env').DATABASE_URL;

  if (!sourceUrl || !targetUrl) {
    throw new Error('Both .env.legacy-test and .env must contain DATABASE_URL.');
  }

  const source = new Client({ connectionString: sourceUrl });
  const target = new Client({ connectionString: targetUrl });
  await source.connect();
  await target.connect();

  const stats = {
    usersInserted: 0,
    usersMappedByEmail: 0,
    projectsInserted: 0,
    projectNumberReassigned: 0,
    teamMembersInserted: 0,
    projectFacilityLinksInserted: 0,
    responsesInserted: 0,
    responsesSkippedMissingSolution: 0,
    sectionTogglesInserted: 0,
    sectionTogglesSkippedMissingSection: 0,
  };

  try {
    const [sourceUserColumns, targetUserColumns] = await Promise.all([
      getColumns(source, 'User'),
      getColumns(target, 'User'),
    ]);
    const [sourceProjectColumns, targetProjectColumns] = await Promise.all([
      getColumns(source, 'Project'),
      getColumns(target, 'Project'),
    ]);
    const [sourceTeamColumns, targetTeamColumns] = await Promise.all([
      getColumns(source, 'TeamMember'),
      getColumns(target, 'TeamMember'),
    ]);
    const [sourceResponseColumns, targetResponseColumns] = await Promise.all([
      getColumns(source, 'ProjectResponse'),
      getColumns(target, 'ProjectResponse'),
    ]);
    const [sourceToggleColumns, targetToggleColumns] = await Promise.all([
      getColumns(source, 'SectionToggle'),
      getColumns(target, 'SectionToggle'),
    ]);

    const userColumns = await columnIntersection(sourceUserColumns, targetUserColumns);
    const projectColumns = await columnIntersection(sourceProjectColumns, targetProjectColumns);
    const teamColumns = await columnIntersection(sourceTeamColumns, targetTeamColumns);
    const responseColumns = await columnIntersection(sourceResponseColumns, targetResponseColumns);
    const toggleColumns = await columnIntersection(sourceToggleColumns, targetToggleColumns);

    const targetUsers = await target.query('select id, lower(email) as email from "User"');
    const targetUserIds = new Set(targetUsers.rows.map((row) => row.id));
    const targetUserIdByEmail = new Map(targetUsers.rows.map((row) => [row.email, row.id]));
    const userIdMap = new Map();

    await target.query('begin');

    const sourceUsers = await source.query('select * from "User" order by "createdAt" asc');
    const usersToInsert = [];
    for (const user of sourceUsers.rows) {
      const email = String(user.email || '').toLowerCase();
      if (targetUserIds.has(user.id)) {
        userIdMap.set(user.id, user.id);
        continue;
      }

      const existingId = targetUserIdByEmail.get(email);
      if (existingId) {
        userIdMap.set(user.id, existingId);
        stats.usersMappedByEmail++;
        continue;
      }

      usersToInsert.push(user);
      userIdMap.set(user.id, user.id);
      targetUserIds.add(user.id);
      targetUserIdByEmail.set(email, user.id);
    }
    stats.usersInserted = await insertRows(target, 'User', usersToInsert, userColumns, 'on conflict do nothing');

    const targetProjectIds = new Set((await target.query('select id from "Project"')).rows.map((row) => row.id));
    const targetProjectNumbers = new Set(
      (await target.query('select "projectNumber" from "Project"')).rows.map((row) => Number(row.projectNumber))
    );
    let nextProjectNumber = Math.max(0, ...targetProjectNumbers) + 1;

    function availableProjectNumber(preferred) {
      const numeric = Number(preferred);
      if (Number.isFinite(numeric) && !targetProjectNumbers.has(numeric)) {
        targetProjectNumbers.add(numeric);
        return numeric;
      }

      while (targetProjectNumbers.has(nextProjectNumber)) nextProjectNumber++;
      const assigned = nextProjectNumber;
      targetProjectNumbers.add(assigned);
      nextProjectNumber++;
      stats.projectNumberReassigned++;
      return assigned;
    }

    const sourceProjects = await source.query('select * from "Project" order by "projectNumber" asc');
    const projectsToInsert = [];
    for (const project of sourceProjects.rows) {
      if (targetProjectIds.has(project.id)) continue;

      const mappedUserId = userIdMap.get(project.userId);
      if (!mappedUserId) {
        throw new Error(`Missing mapped user for project ${project.id}`);
      }

      const row = {
        ...project,
        userId: mappedUserId,
        projectNumber: availableProjectNumber(project.projectNumber),
      };

      projectsToInsert.push(row);
      targetProjectIds.add(project.id);
    }
    stats.projectsInserted = await insertRows(target, 'Project', projectsToInsert, projectColumns, 'on conflict do nothing', 100);

    const targetFacilityByName = new Map(
      (await target.query('select id, name from "FacilityUse"')).rows.map((row) => [row.name, row.id])
    );
    const sourceFacilityById = new Map(
      (await source.query('select id, name from "FacilityUse"')).rows.map((row) => [row.id, row.name])
    );

    const sourceFacilityLinks = await source.query('select "A", "B" from "_FacilityUseToProject"');
    const facilityLinkRows = [];
    for (const link of sourceFacilityLinks.rows) {
      if (!targetProjectIds.has(link.B)) continue;
      const facilityName = sourceFacilityById.get(link.A);
      const targetFacilityId = targetFacilityByName.get(facilityName);
      if (!targetFacilityId) continue;

      facilityLinkRows.push({ A: targetFacilityId, B: link.B });
    }
    stats.projectFacilityLinksInserted = await insertRows(
      target,
      '_FacilityUseToProject',
      facilityLinkRows,
      ['A', 'B'],
      'on conflict do nothing',
      500
    );

    const sourceTeamMembers = await source.query('select * from "TeamMember" order by "createdAt" asc');
    const teamMembersToInsert = [];
    for (const member of sourceTeamMembers.rows) {
      if (!targetProjectIds.has(member.projectId)) continue;
      const row = {
        ...member,
        userId: member.userId ? userIdMap.get(member.userId) || null : null,
      };

      teamMembersToInsert.push(row);
    }
    stats.teamMembersInserted = await insertRows(target, 'TeamMember', teamMembersToInsert, teamColumns, 'on conflict do nothing');

    const targetSolutionByStandard = new Map(
      (await target.query('select id, "standardNumber" from "Solution"')).rows.map((row) => [row.standardNumber, row.id])
    );
    const sourceResponses = await source.query(`
      select pr.*, s."standardNumber"
      from "ProjectResponse" pr
      join "Solution" s on s.id = pr."solutionId"
      order by pr."projectId", s."standardNumber"
    `);
    const responsesToInsert = [];

    for (const response of sourceResponses.rows) {
      if (!targetProjectIds.has(response.projectId)) continue;
      const targetSolutionId = targetSolutionByStandard.get(response.standardNumber);
      if (!targetSolutionId) {
        stats.responsesSkippedMissingSolution++;
        continue;
      }

      const row = { ...response, solutionId: targetSolutionId };
      delete row.standardNumber;
      responsesToInsert.push(row);
    }
    stats.responsesInserted = await insertRows(target, 'ProjectResponse', responsesToInsert, responseColumns, 'on conflict do nothing', 500);

    const targetSectionByNumber = new Map(
      (await target.query(`
        select sec.id, ch.number || '.' || sec.number as key
        from "Section" sec
        join "Chapter" ch on ch.id = sec."chapterId"
      `)).rows.map((row) => [row.key, row.id])
    );
    const sourceToggles = await source.query(`
      select st.*, ch.number || '.' || sec.number as key
      from "SectionToggle" st
      join "Section" sec on sec.id = st."sectionId"
      join "Chapter" ch on ch.id = sec."chapterId"
      order by st."projectId", key
    `);
    const togglesToInsert = [];

    for (const toggle of sourceToggles.rows) {
      if (!targetProjectIds.has(toggle.projectId)) continue;
      const targetSectionId = targetSectionByNumber.get(toggle.key);
      if (!targetSectionId) {
        stats.sectionTogglesSkippedMissingSection++;
        continue;
      }

      const row = { ...toggle, sectionId: targetSectionId };
      delete row.key;
      togglesToInsert.push(row);
    }
    stats.sectionTogglesInserted = await insertRows(target, 'SectionToggle', togglesToInsert, toggleColumns, 'on conflict do nothing', 500);

    await target.query(`
      select setval(
        pg_get_serial_sequence('"Project"', 'projectNumber'),
        greatest((select coalesce(max("projectNumber"), 1) from "Project"), 1),
        true
      )
    `);

    await target.query('commit');
  } catch (error) {
    await target.query('rollback').catch(() => {});
    throw error;
  } finally {
    await source.end();
    await target.end();
  }

  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
