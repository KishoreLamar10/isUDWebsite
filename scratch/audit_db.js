const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("--- Database Content Audit ---");
  const chapters = await prisma.chapter.findMany({
    include: {
      sections: {
        include: {
          _count: {
            select: { solutions: true }
          }
        }
      }
    },
    orderBy: { number: "asc" }
  });

  chapters.forEach(c => {
    const totalSolutions = c.sections.reduce((acc, s) => acc + s._count.solutions, 0);
    console.log(`Chapter ${c.number}: ${c.title}`);
    console.log(`  - Sections: ${c.sections.length}`);
    console.log(`  - Total Solutions: ${totalSolutions}`);
    
    if (c.sections.length === 0) {
      console.log("  ⚠️ WARNING: No sections found for this chapter!");
    } else {
      c.sections.forEach(s => {
        if (s._count.solutions === 0) {
          console.log(`    ⚠️ Section ${s.number} (${s.title}): No solutions!`);
        }
      });
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
