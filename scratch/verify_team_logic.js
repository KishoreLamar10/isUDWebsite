const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTeamLogic() {
  console.log('--- Project Team Logic Verification ---');

  // 1. Find a project
  const project = await prisma.project.findFirst();
  if (!project) {
    console.error('No project found to test with.');
    return;
  }
  console.log(`Using Project: ${project.projectName} (${project.id})`);

  // 2. Create a dummy user
  const dummyEmail = `test-collaborator-${Date.now()}@example.com`;
  const dummyUser = await prisma.user.create({
    data: {
      email: dummyEmail,
      name: 'Test Collaborator',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test',
    }
  });
  console.log(`Created dummy user: ${dummyUser.email}`);

  // 3. Create a PENDING invitation (Viewer role)
  const invitation = await prisma.teamMember.create({
    data: {
      projectId: project.id,
      userId: dummyUser.id,
      email: dummyEmail,
      role: 'MEMBER',
      permission: 'VIEWER',
      status: 'PENDING'
    }
  });
  console.log(`Created PENDING invitation for role VIEWER`);

  // 4. Verify Invitation Fetching
  const pendingInvitations = await prisma.teamMember.findMany({
    where: { email: dummyEmail, status: 'PENDING' },
    include: { project: true }
  });
  console.log(`Found ${pendingInvitations.length} pending invitations for ${dummyEmail}`);
  if (pendingInvitations.length > 0) {
    console.log(`- Project Title: ${pendingInvitations[0].project.projectName}`);
  }

  // 5. Simulate Acceptance
  await prisma.teamMember.update({
    where: { id: invitation.id },
    data: { status: 'ACTIVE' }
  });
  console.log(`Simulated Invitation Acceptance`);

  // 6. Verify Active status
  const member = await prisma.teamMember.findUnique({
    where: { id: invitation.id }
  });
  console.log(`Current Status: ${member.status} (Expected: ACTIVE)`);

  // 7. Cleanup
  await prisma.teamMember.delete({ where: { id: invitation.id } });
  await prisma.user.delete({ where: { id: dummyUser.id } });
  console.log('--- Verification Complete & Cleaned Up ---');
}

verifyTeamLogic()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
