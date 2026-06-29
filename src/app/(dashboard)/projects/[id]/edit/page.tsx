import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProjectProfileForm, { ProjectProfileFormData } from '@/components/ProjectProfileForm';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/register');
  }

  const { id } = await params;
  const userId = (session.user as any).id;
  const systemRole = (session.user as any).role;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...(systemRole === 'ADMIN'
        ? {}
        : {
            OR: [
              { userId },
              {
                teamMembers: {
                  some: {
                    userId,
                    status: 'ACTIVE',
                  },
                },
              },
            ],
          }),
    },
    include: {
      facilityUses: {
        where: { archivedAt: null },
      },
      teamMembers: {
        where: { userId },
      },
    },
  });

  if (!project) {
    redirect('/');
  }

  const membership = project.teamMembers[0];
  const canEdit =
    systemRole === 'ADMIN' ||
    project.userId === userId ||
    (membership?.status === 'ACTIVE' && ['ADMIN', 'EDITOR'].includes(membership.permission));

  if (!canEdit) {
    redirect(`/projects/${id}`);
  }

  const initialData: ProjectProfileFormData = {
    contactName: project.contactName,
    contactEmail: project.contactEmail,
    telephone: project.telephone,
    firmName: project.firmName || '',
    ownerName: project.ownerName || '',
    projectName: project.projectName,
    address1: project.address1 || '',
    address2: project.address2 || '',
    city: project.city || '',
    state: project.state || '',
    zip: project.zip || '',
    country: project.country || 'United States',
    buildingArea: project.buildingArea || '',
    siteArea: project.siteArea || '',
    certification: project.certification || 'Guided Certification',
    services: project.services || [],
    facilityUses: project.facilityUses.map((facility) => facility.name),
  };

  const breadcrumbItems = [
    { label: 'My Projects', href: '/' },
    { label: project.projectName, href: `/projects/${id}` },
    { label: 'Edit Profile' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="bg-white border border-slate-200 rounded-sm px-6 py-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-primary tracking-tight">Edit Project Profile</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden p-6 sm:p-8">
        <ProjectProfileForm mode="edit" projectId={id} initialData={initialData} />
      </div>
    </div>
  );
}
