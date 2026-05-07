const { PrismaClient } = require('@prisma/client');
const fs = require('node:fs');
const path = require('node:path');

const prisma = new PrismaClient();

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function main() {
  const facilityUsesPath = path.join(process.cwd(), 'data/legacy/Facility_Uses.tsv');
  const tsvLines = fs.readFileSync(facilityUsesPath, 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '');
  const thresholdsByCredit = new Map();

  for (let i = 1; i < tsvLines.length; i++) {
    const cols = tsvLines[i].split('\t');
    const credit = cols[1]?.trim();
    if (!credit) continue;

    thresholdsByCredit.set(credit, {
      minPoints1: Number.parseInt(cols[7], 10) || 0,
      minPoints2: Number.parseInt(cols[8], 10) || 0,
      minPoints3: Number.parseInt(cols[9], 10) || 0,
    });
  }

  const headingLines = fs
    .readFileSync(path.join(process.cwd(), 'UD_S_Headings.csv'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  let updated = 0;

  for (let i = 1; i < headingLines.length; i++) {
    const cols = parseCSVLine(headingLines[i]);
    const hLevel = cols[2];
    if (hLevel !== 'H2') continue;

    const creditNumber = cols[1];
    const h1Num = cols[3];
    const h2Num = cols[6];
    const thresholds = thresholdsByCredit.get(creditNumber);
    if (!thresholds) continue;

    const chapter = await prisma.chapter.findUnique({
      where: { number: h1Num },
      select: { id: true },
    });
    if (!chapter) continue;

    await prisma.section.update({
      where: {
        chapterId_number: {
          chapterId: chapter.id,
          number: h2Num,
        },
      },
      data: thresholds,
    });
    updated++;
  }

  console.log(`Synced thresholds for ${updated} H2 sections.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
