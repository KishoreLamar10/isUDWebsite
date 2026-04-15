import ProjectTable from "@/components/ProjectTable";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-80px-200px)] flex flex-col items-center justify-start bg-slate-50">
      <ProjectTable />
    </div>
  );
}
