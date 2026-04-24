const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration for existing project owners...');
  
  const projects = await prisma.project.findMany({
    include: { user: true }
  });

  console.log(`Found ${projects.length} projects to migrate.`);

  for (const project of projects) {
    // Create an Admin entry for the project owner
    await prisma.teamMember.upsert({
      where: {
        projectId_email: {
          projectId: project.id,
          email: project.user.email
        }
      },
      update: {
        userId: project.userId,
        permission: 'ADMIN',
        role: 'PROJECT_MANAGER',
        status: 'ACTIVE'
      },
      create: {
        projectId: project.id,
        userId: project.userId,
        email: project.user.email,
        permission: 'ADMIN',
        role: 'PROJECT_MANAGER',
        status: 'ACTIVE'
      }
    });
    console.log(`Migrated owner for project: ${project.projectName}`);
  }

  console.log('Migration complete.');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
