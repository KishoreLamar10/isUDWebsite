const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const args = new Set(process.argv.slice(2));
const sourceArg = process.argv.find((arg) => arg.startsWith("--source="));
const sourcePath = sourceArg ? sourceArg.slice("--source=".length) : "thisisud_live.sql.zip";
const shouldApply = args.has("--apply");
const activeOnly = args.has("--active-only");

const roleLabels = {
  "1": "Project Architect/Design Team",
  "2": "Consultant",
  "3": "Real Estate Development",
  "4": "Ownership/Management",
  "5": "Human Resources",
  "6": "Community Advocate",
};

const defaultReason = "Just browsing / Interested in Universal Design";

function getSqlText(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Legacy SQL export not found: ${filePath}`);
  }

  if (filePath.endsWith(".zip")) {
    return execFileSync("tar", ["-xOf", filePath], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
  }

  return fs.readFileSync(filePath, "utf8");
}

function parseCreateTables(sql) {
  const tableMap = new Map();
  const createRe = /CREATE TABLE `([^`]+)` \((.*?)\) ENGINE=/gs;
  for (const match of sql.matchAll(createRe)) {
    const columns = [];
    for (const line of match[2].split(/\r?\n/)) {
      const columnMatch = line.match(/^\s*`([^`]+)`\s+/);
      if (columnMatch) columns.push(columnMatch[1]);
    }
    tableMap.set(match[1], columns);
  }
  return tableMap;
}

function* findInsertStatements(sql, table) {
  const needle = `INSERT INTO \`${table}\``;
  let position = 0;

  while (position < sql.length) {
    const start = sql.indexOf(needle, position);
    if (start === -1) return;

    let inString = false;
    let escaped = false;

    for (let i = start; i < sql.length; i++) {
      const char = sql[i];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === "'") {
          if (sql[i + 1] === "'") {
            i++;
          } else {
            inString = false;
          }
        }
      } else if (char === "'") {
        inString = true;
      } else if (char === ";") {
        yield sql.slice(start, i + 1);
        position = i + 1;
        break;
      }
    }
  }
}

function splitTuples(values) {
  const rows = [];
  let inString = false;
  let escaped = false;
  let depth = 0;
  let start = null;

  for (let i = 0; i < values.length; i++) {
    const char = values[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "'") {
        if (values[i + 1] === "'") {
          i++;
        } else {
          inString = false;
        }
      }
      continue;
    }

    if (char === "'") {
      inString = true;
    } else if (char === "(") {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (char === ")") {
      depth--;
      if (depth === 0 && start !== null) {
        rows.push(values.slice(start, i));
        start = null;
      }
    }
  }

  return rows;
}

function parseSqlRow(row) {
  const values = [];
  let current = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (inString) {
      if (escaped) {
        current += char;
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "'") {
        if (row[i + 1] === "'") {
          current += "'";
          i++;
        } else {
          inString = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'") {
      inString = true;
    } else if (char === ",") {
      values.push(normalizeSqlValue(current));
      current = "";
    } else {
      current += char;
    }
  }

  values.push(normalizeSqlValue(current));
  return values;
}

function normalizeSqlValue(value) {
  const trimmed = value.trim();
  if (trimmed.toUpperCase() === "NULL") return null;
  return trimmed;
}

function readRows(sql, tableColumns, table) {
  const rows = [];
  const defaultColumns = tableColumns.get(table);
  if (!defaultColumns) return rows;

  for (const statement of findInsertStatements(sql, table)) {
    const columnsMatch = statement.match(new RegExp(`INSERT INTO \`${table}\`\\s*\\((.*?)\\)\\s*VALUES\\s*`, "s"));
    const columns = columnsMatch
      ? columnsMatch[1].replace(/\r?\n/g, " ").split(",").map((column) => column.trim().replaceAll("`", ""))
      : defaultColumns;
    const values = columnsMatch
      ? statement.slice(columnsMatch[0].length).replace(/;$/, "")
      : statement.split(/\bVALUES\b/i)[1].replace(/;$/, "");

    for (const tuple of splitTuples(values)) {
      const parsed = parseSqlRow(tuple);
      rows.push(Object.fromEntries(columns.map((column, index) => [column, parsed[index] ?? null])));
    }
  }

  return rows;
}

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const cleaned = String(value).trim();
  return cleaned || fallback;
}

function normalizeEmail(email) {
  return cleanString(email).toLowerCase();
}

function legacyPlaceholderEmail(legacyUserId) {
  const safeId = cleanString(legacyUserId, crypto.randomUUID())
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .slice(0, 80);
  return `${safeId}@legacy.thisisud.local`;
}

function parseDate(value) {
  if (!value || value === "0000-00-00" || value.startsWith("0000-00-00")) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function splitList(value) {
  return cleanString(value)
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitNumberList(value) {
  return cleanString(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value));
}

function sumNumbers(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

function getLegacyScoreSnapshot(legacyProject) {
  const chapterApplicable = splitNumberList(legacyProject.h1_credits_applicable);
  const chapterEarned = splitNumberList(legacyProject.h1_credits_earned);
  const applicableCredits = Number(legacyProject.applicable_credits);
  const earnedCredits = sumNumbers(chapterEarned);
  const bonusCredits = Number(legacyProject.bonus_credits);
  const awardPercentage = Number(legacyProject.award_percentage);

  return {
    legacyApplicableCredits: Number.isFinite(applicableCredits) ? applicableCredits : sumNumbers(chapterApplicable),
    legacyEarnedCredits: earnedCredits,
    legacyBonusCredits: Number.isFinite(bonusCredits) ? bonusCredits : 0,
    legacyAwardPercentage: Number.isFinite(awardPercentage) ? awardPercentage : null,
    legacyChapterApplicable: chapterApplicable.length > 0 ? chapterApplicable.join(",") : null,
    legacyChapterEarned: chapterEarned.length > 0 ? chapterEarned.join(",") : null,
  };
}

function mapProjectStatus(status) {
  if (status === "1") return "COMPLETED";
  if (status === "4") return "INACTIVE";
  return "ONGOING";
}

function mapPermission(permissionId) {
  if (permissionId === "1") return "ADMIN";
  if (permissionId === "2") return "EDITOR";
  return "VIEWER";
}

function mapProjectRole(roleId) {
  const roles = {
    "1": "PROJECT_MANAGER",
    "2": "ARCHITECT",
    "3": "CONSULTANT",
    "4": "DEVELOPMENT",
    "5": "OWNERSHIP",
    "6": "ADVOCATE",
  };
  return roles[roleId] || "ARCHITECT";
}

function legacyColumnToStandardNumber(column) {
  return column.replace(/^s_/, "").replaceAll("_", ".");
}

function naturalCompareNumber(a, b) {
  const aParts = String(a.number).split(".").map((part) => Number(part));
  const bParts = String(b.number).split(".").map((part) => Number(part));
  const length = Math.max(aParts.length, bParts.length);

  for (let index = 0; index < length; index++) {
    const aValue = aParts[index] ?? -1;
    const bValue = bParts[index] ?? -1;
    if (aValue !== bValue) return aValue - bValue;
  }

  return String(a.number).localeCompare(String(b.number));
}

function buildSectionTogglesFromMask(legacyProject, chapters) {
  const chapterMasks = cleanString(legacyProject.header_mask).split(";");
  const projectId = legacyProject._id || legacyProject.project_id;
  const toggles = [];

  chapters.forEach((chapter, chapterIndex) => {
    const sectionMasks = (chapterMasks[chapterIndex] || "").split(",");

    chapter.sections.forEach((section, sectionIndex) => {
      const mask = sectionMasks[sectionIndex];
      if (mask === undefined || mask === "") return;

      toggles.push({
        projectId,
        sectionId: section.id,
        isEnabled: mask.includes("1"),
      });
    });
  });

  return toggles;
}

function calculateScore(chapters, responses) {
  const implemented = new Set(responses.map((response) => response.solutionId));
  let totalScore = 0;
  let totalBonus = 0;

  for (const chapter of chapters) {
    let chapterEarned = 0;
    let chapterAvailable = 0;

    for (const section of chapter.sections) {
      chapterAvailable += section.totalCredits;
      const implementedCount = section.solutions.filter((solution) => implemented.has(solution.id)).length;
      let sectionCredits = 0;
      let thresholdReached = 0;

      if (section.minPoints3 > 0 && implementedCount >= section.minPoints3) {
        sectionCredits = section.totalCredits;
        thresholdReached = section.minPoints3;
      } else if (section.minPoints2 > 0 && implementedCount >= section.minPoints2) {
        sectionCredits = section.totalCredits;
        thresholdReached = section.minPoints2;
      } else if (section.minPoints1 > 0 && implementedCount >= section.minPoints1) {
        sectionCredits = Math.max(1, Math.floor(section.totalCredits / 2));
        thresholdReached = section.minPoints1;
      } else if (section.minPoints1 === 0 && section.minPoints2 === 0) {
        const rawScore = section.solutions.reduce((sum, solution) => {
          return sum + (implemented.has(solution.id) ? solution.points : 0);
        }, 0);
        sectionCredits = Math.min(rawScore, section.totalCredits);
        thresholdReached = Math.round(sectionCredits);
      }

      if (sectionCredits > 0) {
        totalBonus += Math.max(0, Math.floor((implementedCount - thresholdReached) / 5));
      }

      chapterEarned += sectionCredits;
    }

    totalScore += Math.min(chapterEarned, chapterAvailable);
  }

  return { totalScore, totalBonus: Math.min(totalBonus, 10) };
}

async function main() {
  console.log(`Legacy import mode: ${shouldApply ? "APPLY" : "DRY RUN"}`);
  console.log(`Source: ${sourcePath}`);

  const sql = getSqlText(sourcePath);
  const tableColumns = parseCreateTables(sql);

  const users = readRows(sql, tableColumns, "Users_temp").filter((user) => normalizeEmail(user.email_id));
  const projects = readRows(sql, tableColumns, "UD_P_Info").filter((project) => !activeOnly || project.isud_status !== "4");
  const checklistRows = readRows(sql, tableColumns, "UD_P_Projects");
  const teamRows = readRows(sql, tableColumns, "project_team");
  const securityQuestions = new Map(
    readRows(sql, tableColumns, "SecurityQuestions").map((row) => [row.sl_no, cleanString(row.question)])
  );
  const signupReasons = new Map(
    readRows(sql, tableColumns, "signup_reasons").map((row) => [row.reason_id, cleanString(row.name)])
  );

  const legacyUsersById = new Map(users.map((user) => [user._id, user]));
  const legacyProjectsById = new Map(projects.map((project) => [project._id, project]));
  const checklistByProjectId = new Map(checklistRows.map((row) => [row.project_id, row]));

  const existingUsers = await prisma.user.findMany({ select: { id: true, email: true } });
  const existingUserByEmail = new Map(existingUsers.map((user) => [user.email.toLowerCase(), user]));
  const existingProjects = await prisma.project.findMany({ select: { id: true } });
  const existingProjectIds = new Set(existingProjects.map((project) => project.id));
  const facilityUses = await prisma.facilityUse.findMany({ select: { name: true } });
  const facilityUseNames = new Set(facilityUses.map((facilityUse) => facilityUse.name));
  const solutions = await prisma.solution.findMany({ select: { id: true, standardNumber: true } });
  const solutionByStandardNumber = new Map(solutions.map((solution) => [solution.standardNumber, solution]));
  const chapters = await prisma.chapter.findMany({
    include: {
      sections: {
        include: {
          solutions: {
            select: { id: true, points: true },
          },
        },
      },
    },
  });
  const sortedChapters = chapters
    .map((chapter) => ({
      ...chapter,
      sections: [...chapter.sections].sort(naturalCompareNumber),
    }))
    .sort(naturalCompareNumber);

  const selectedResponsesByProject = new Map();
  const unmappedStandards = new Set();

  for (const [projectId, row] of checklistByProjectId.entries()) {
    if (!legacyProjectsById.has(projectId)) continue;

    const responses = [];
    for (const [column, value] of Object.entries(row)) {
      if (!column.startsWith("s_") || value !== "1") continue;

      const standardNumber = legacyColumnToStandardNumber(column);
      const solution = solutionByStandardNumber.get(standardNumber);
      if (!solution) {
        unmappedStandards.add(standardNumber);
        continue;
      }

      responses.push({
        projectId,
        solutionId: solution.id,
        status: "IMPLEMENTED",
      });
    }
    selectedResponsesByProject.set(projectId, responses);
  }

  const importableTeamRows = teamRows.filter((row) => {
    return legacyProjectsById.has(row.project_id) && legacyUsersById.has(row.user_id);
  });
  const missingProjectOwnerIds = [...new Set(projects
    .map((project) => project.creating_user_id)
    .filter((ownerId) => ownerId && !legacyUsersById.has(ownerId)))];

  const projectScores = new Map();
  for (const project of projects) {
    const responses = selectedResponsesByProject.get(project._id) || [];
    projectScores.set(project._id, calculateScore(sortedChapters, responses));
  }
  const sectionToggleCount = projects.reduce((count, project) => {
    const checklistRow = checklistByProjectId.get(project._id);
    return count + (checklistRow ? buildSectionTogglesFromMask(checklistRow, sortedChapters).length : 0);
  }, 0);

  console.log("\nPlanned import:");
  console.log(`  Users: ${users.length}`);
  console.log(`  Projects: ${projects.length}${activeOnly ? " excluding inactive" : " including inactive"}`);
  console.log(`  Team memberships: ${importableTeamRows.length}`);
  console.log(`  Missing project owners requiring placeholders: ${missingProjectOwnerIds.length}`);
  console.log(`  Implemented checklist responses: ${[...selectedResponsesByProject.values()].reduce((sum, rows) => sum + rows.length, 0)}`);
  console.log(`  Section applicability toggles: ${sectionToggleCount}`);
  console.log(`  Existing users matched by email: ${users.filter((user) => existingUserByEmail.has(normalizeEmail(user.email_id))).length}`);
  console.log(`  Existing projects matched by legacy id: ${projects.filter((project) => existingProjectIds.has(project._id)).length}`);
  console.log(`  Unmapped selected legacy standards: ${unmappedStandards.size}`);

  if (unmappedStandards.size > 0) {
    console.log(`  First unmapped standards: ${[...unmappedStandards].slice(0, 20).join(", ")}`);
  }

  if (!shouldApply) {
    console.log("\nDry run complete. Re-run with --apply to write to the configured DATABASE_URL.");
    return;
  }

  const hashedTemporaryPassword = await bcrypt.hash(`legacy-import-${crypto.randomUUID()}`, 10);
  const legacyUserIdToNewUserId = new Map();

  for (const legacyUser of users) {
    const email = normalizeEmail(legacyUser.email_id);
    const existingUser = existingUserByEmail.get(email);
    const securityQuestion = securityQuestions.get(legacyUser.securityquestion_id) || "What was the name of your first pet?";
    const securityAnswer = cleanString(legacyUser.securityquestion_ans, `legacy-${legacyUser._id}`);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), 10);
    const reason = signupReasons.get(legacyUser.signupreason_id) || defaultReason;

    if (existingUser) {
      legacyUserIdToNewUserId.set(legacyUser._id, existingUser.id);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: cleanString(legacyUser.first_name, "Legacy"),
          lastName: cleanString(legacyUser.last_name, "User"),
          telephone: cleanString(legacyUser.phone, "Not provided"),
          jobTitle: cleanString(legacyUser.job_title, null),
          company: cleanString(legacyUser.organization_id, null),
          professionRole: roleLabels[legacyUser.signuprole_id] || roleLabels["1"],
          reason,
          securityQuestion,
          hashedSecurityAnswer,
          systemRole: legacyUser.authtype_id === "1" ? "ADMIN" : "USER",
        },
      });
      continue;
    }

    const createdUser = await prisma.user.create({
      data: {
        id: legacyUser._id,
        firstName: cleanString(legacyUser.first_name, "Legacy"),
        lastName: cleanString(legacyUser.last_name, "User"),
        email,
        telephone: cleanString(legacyUser.phone, "Not provided"),
        jobTitle: cleanString(legacyUser.job_title, null),
        company: cleanString(legacyUser.organization_id, null),
        professionRole: roleLabels[legacyUser.signuprole_id] || roleLabels["1"],
        reason,
        hashedPassword: hashedTemporaryPassword,
        securityQuestion,
        hashedSecurityAnswer,
        systemRole: legacyUser.authtype_id === "1" ? "ADMIN" : "USER",
        createdAt: parseDate(legacyUser.ts_created) || new Date(),
      },
    });
    legacyUserIdToNewUserId.set(legacyUser._id, createdUser.id);
  }

  for (const missingOwnerId of missingProjectOwnerIds) {
    const email = legacyPlaceholderEmail(missingOwnerId);
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      legacyUserIdToNewUserId.set(missingOwnerId, existingUser.id);
      continue;
    }

    const createdUser = await prisma.user.create({
      data: {
        id: missingOwnerId,
        firstName: "Legacy",
        lastName: "Owner",
        email,
        telephone: "Not provided",
        professionRole: roleLabels["1"],
        reason: defaultReason,
        hashedPassword: hashedTemporaryPassword,
        securityQuestion: "What was the name of your first pet?",
        hashedSecurityAnswer: await bcrypt.hash(`legacy-${missingOwnerId}`.toLowerCase(), 10),
        systemRole: "USER",
      },
    });
    legacyUserIdToNewUserId.set(missingOwnerId, createdUser.id);
  }

  for (const legacyProject of projects) {
    const ownerId = legacyUserIdToNewUserId.get(legacyProject.creating_user_id);
    if (!ownerId) {
      console.warn(`Skipping project ${legacyProject._id}: owner ${legacyProject.creating_user_id} was not imported.`);
      continue;
    }

    const facilityNames = splitList(legacyProject.building_type).filter((name) => facilityUseNames.has(name));
    const checklistRow = checklistByProjectId.get(legacyProject._id);
    const legacyScores = checklistRow
      ? getLegacyScoreSnapshot(checklistRow)
      : {
          legacyApplicableCredits: null,
          legacyEarnedCredits: null,
          legacyBonusCredits: null,
          legacyAwardPercentage: null,
          legacyChapterApplicable: null,
          legacyChapterEarned: null,
        };
    const score = legacyScores.legacyEarnedCredits ?? projectScores.get(legacyProject._id)?.totalScore ?? 0;

    await prisma.project.upsert({
      where: { id: legacyProject._id },
      update: {
        projectName: cleanString(legacyProject.project_title, "Untitled legacy project"),
        contactName: cleanString(legacyProject.project_contact_person, "Not provided"),
        contactEmail: normalizeEmail(legacyProject.project_contact_email) || normalizeEmail(legacyUsersById.get(legacyProject.creating_user_id)?.email_id),
        telephone: cleanString(legacyProject.project_contact_telephone, "Not provided"),
        firmName: cleanString(legacyProject.project_architect, null),
        ownerName: cleanString(legacyProject.project_owner, null),
        address1: cleanString(legacyProject.project_address_line_1, null),
        address2: cleanString(legacyProject.project_address_line_2, null),
        city: cleanString(legacyProject.project_city, null),
        state: cleanString(legacyProject.project_state, null),
        zip: cleanString(legacyProject.project_zipcode, null),
        country: cleanString(legacyProject.project_country, "United States"),
        buildingArea: cleanString(legacyProject.habitable_floor_area, null),
        siteArea: cleanString(legacyProject.site_area, null),
        certification: cleanString(legacyProject.certification_type, "Guided Certification"),
        services: splitList(legacyProject.service_type),
        status: mapProjectStatus(legacyProject.isud_status),
        score,
        ...legacyScores,
        userId: ownerId,
        facilityUses: { set: facilityNames.map((name) => ({ name })) },
      },
      create: {
        id: legacyProject._id,
        projectName: cleanString(legacyProject.project_title, "Untitled legacy project"),
        contactName: cleanString(legacyProject.project_contact_person, "Not provided"),
        contactEmail: normalizeEmail(legacyProject.project_contact_email) || normalizeEmail(legacyUsersById.get(legacyProject.creating_user_id)?.email_id),
        telephone: cleanString(legacyProject.project_contact_telephone, "Not provided"),
        firmName: cleanString(legacyProject.project_architect, null),
        ownerName: cleanString(legacyProject.project_owner, null),
        address1: cleanString(legacyProject.project_address_line_1, null),
        address2: cleanString(legacyProject.project_address_line_2, null),
        city: cleanString(legacyProject.project_city, null),
        state: cleanString(legacyProject.project_state, null),
        zip: cleanString(legacyProject.project_zipcode, null),
        country: cleanString(legacyProject.project_country, "United States"),
        buildingArea: cleanString(legacyProject.habitable_floor_area, null),
        siteArea: cleanString(legacyProject.site_area, null),
        certification: cleanString(legacyProject.certification_type, "Guided Certification"),
        services: splitList(legacyProject.service_type),
        status: mapProjectStatus(legacyProject.isud_status),
        score,
        ...legacyScores,
        userId: ownerId,
        createdAt: parseDate(legacyProject.project_isud_creation_date) || new Date(),
        facilityUses: { connect: facilityNames.map((name) => ({ name })) },
      },
    });
  }

  for (const membership of importableTeamRows) {
    const userId = legacyUserIdToNewUserId.get(membership.user_id);
    if (!userId) continue;

    const email = normalizeEmail(legacyUsersById.get(membership.user_id)?.email_id);
    if (!email) continue;

    await prisma.teamMember.upsert({
      where: {
        projectId_email: {
          projectId: membership.project_id,
          email,
        },
      },
      update: {
        userId,
        permission: mapPermission(membership.project_permission_id),
        role: mapProjectRole(membership.project_role_id),
        status: membership.status === "1" ? "ACTIVE" : "PENDING",
      },
      create: {
        projectId: membership.project_id,
        userId,
        email,
        permission: mapPermission(membership.project_permission_id),
        role: mapProjectRole(membership.project_role_id),
        status: membership.status === "1" ? "ACTIVE" : "PENDING",
      },
    });
  }

  for (const [projectId, responses] of selectedResponsesByProject.entries()) {
    await prisma.projectResponse.deleteMany({ where: { projectId } });
    if (responses.length > 0) {
      await prisma.projectResponse.createMany({
        data: responses,
        skipDuplicates: true,
      });
    }
  }

  for (const legacyProject of projects) {
    const checklistRow = checklistByProjectId.get(legacyProject._id);
    const toggles = checklistRow ? buildSectionTogglesFromMask(checklistRow, sortedChapters) : [];
    await prisma.sectionToggle.deleteMany({ where: { projectId: legacyProject._id } });
    if (toggles.length > 0) {
      await prisma.sectionToggle.createMany({
        data: toggles,
        skipDuplicates: true,
      });
    }
  }

  console.log("\nLegacy import complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
