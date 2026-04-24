const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetTestData() {
  console.log('🚮 Starting data cleanup...');

  try {
    // Order matters for relational integrity if Cascade delete isn't fully set
    await prisma.teamMember.deleteMany({});
    console.log('  ✅ TeamMember records cleared');

    await prisma.projectResponse.deleteMany({});
    console.log('  ✅ ProjectResponse records cleared');

    await prisma.sectionToggle.deleteMany({});
    console.log('  ✅ SectionToggle records cleared');

    await prisma.project.deleteMany({});
    console.log('  ✅ All Projects cleared');

    console.log('\n🏗️ Creating fresh test project...');

    const testUserEmail = 'test@example.com';
    const testUser = await prisma.user.findUnique({
      where: { email: testUserEmail }
    });

    if (!testUser) {
      throw new Error(`Test user with email ${testUserEmail} not found. Please create the user first.`);
    }

    const firstFacility = await prisma.facilityUse.findFirst();

    const newProject = await prisma.project.create({
      data: {
        projectName: 'U.D. Testing Portfolio',
        contactName: 'Test User',
        contactEmail: testUserEmail,
        telephone: '555-0199',
        address1: '123 Accessibility Way',
        city: 'Universal City',
        state: 'NY',
        zip: '10001',
        country: 'United States',
        certification: 'Guided Certification',
        userId: testUser.id,
        facilityUses: firstFacility ? { connect: { id: firstFacility.id } } : undefined,
        status: 'ONGOING'
      }
    });

    console.log(`  ✅ Project created: "${newProject.projectName}" (${newProject.id})`);

    // Ensure the owner is also a TeamMember (Admin)
    await prisma.teamMember.create({
      data: {
        projectId: newProject.id,
        userId: testUser.id,
        email: testUserEmail,
        permission: 'ADMIN',
        role: 'PROJECT_MANAGER',
        status: 'ACTIVE'
      }
    });
    console.log(`  ✅ Owner assigned as ADMIN in team members`);

    console.log('\n✨ Database reset successfully!');
  } catch (error) {
    console.error('\n❌ Error during reset:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetTestData();
