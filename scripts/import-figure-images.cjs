const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const figuresDir = path.join(process.cwd(), 'public', 'figures');

function getFigureKeyFromFileName(fileName) {
  const match = fileName.match(/^(Fig_[^.]+)(?:\.[a-f0-9]{8})?\.png$/i);
  if (!match) return null;

  return `${match[1].replace(/\s+/g, '_')}.png`;
}

function getFigureKeyFromDbNumber(number) {
  if (!number) return null;
  const baseName = path.basename(number.trim());
  const match = baseName.match(/^(Fig_[^.]+)\.png$/i);
  if (!match) return null;

  return `${match[1].replace(/\s+/g, '_')}.png`;
}

async function main() {
  if (!fs.existsSync(figuresDir)) {
    throw new Error(`Figure image directory does not exist: ${figuresDir}`);
  }

  const imageFiles = fs
    .readdirSync(figuresDir)
    .filter((fileName) => fileName.toLowerCase().endsWith('.png'));
  const imageByFigureKey = new Map();

  for (const fileName of imageFiles) {
    const key = getFigureKeyFromFileName(fileName);
    if (key) imageByFigureKey.set(key.toLowerCase(), fileName);
  }

  const figures = await prisma.figure.findMany({
    select: {
      id: true,
      number: true,
    },
  });

  let matched = 0;
  let missing = 0;
  const missingNumbers = new Set();

  for (const figure of figures) {
    const key = getFigureKeyFromDbNumber(figure.number || '');
    const imageFileName = key ? imageByFigureKey.get(key.toLowerCase()) : null;

    if (!imageFileName) {
      missing += 1;
      if (figure.number) missingNumbers.add(figure.number);
      continue;
    }

    await prisma.figure.update({
      where: { id: figure.id },
      data: {
        url: `/figures/${imageFileName}`,
      },
    });
    matched += 1;
  }

  console.log(
    JSON.stringify(
      {
        images: imageFiles.length,
        figures: figures.length,
        matched,
        missing,
        firstMissing: [...missingNumbers].slice(0, 20),
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
