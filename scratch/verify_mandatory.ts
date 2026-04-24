import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const mandatoryCount = await prisma.solution.count({
    where: { isMandatory: true }
  });
  console.log('Total Mandatory Solutions:', mandatoryCount);

  const sectionsWithMandatory = await prisma.section.findMany({
    where: {
      solutions: {
        some: { isMandatory: true }
      }
    },
    select: {
      number: true,
      _count: {
        select: {
          solutions: {
            where: { isMandatory: true }
          }
        }
      }
    }
  });

  console.log('\nSections with mandatory solutions:');
  sectionsWithMandatory.forEach(s => {
    console.log(`Section ${s.number}: ${s._count.solutions} mandatory solution(s)`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
