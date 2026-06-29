import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProjectProfileForm from '@/components/ProjectProfileForm';

export default function NewProjectPage() {
  const breadcrumbItems = [
    { label: 'My Projects', href: '/' },
    { label: 'Project Profile' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="bg-white border border-slate-200 rounded-sm px-6 py-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-primary tracking-tight">Project Profile</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden p-6 sm:p-8">
        <ProjectProfileForm />
      </div>
    </div>
  );
}
