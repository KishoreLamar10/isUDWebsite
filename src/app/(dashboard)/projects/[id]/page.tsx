import ProjectOverview from '@/components/ProjectOverview';

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="min-h-[calc(100vh-80px-200px)] bg-slate-50">
      <ProjectOverview id={id} />
    </div>
  );
}
