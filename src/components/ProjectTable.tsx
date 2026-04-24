'use client';

import Link from 'next/link';
import { Search, Plus, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from './ui/Button';

const tableHeaders = ['ID', 'Name', 'Owner', 'Status', 'Score'];

export default function ProjectTable() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const isEmpty = projects.length === 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title Bar */}
      <div className="bg-white border border-slate-200 rounded-sm px-6 py-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-primary tracking-tight">My Projects</h1>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/projects/new">
            <Button variant="primary" className="gap-2 px-5 bg-[#002a54] hover:bg-[#001d3d]">
              <Plus size={18} />
              Add Project
            </Button>
          </Link>
          
          <Link href="/solutions">
            <Button variant="primary" className="gap-2 px-5 bg-secondary hover:bg-secondary-dark text-primary border-none shadow-sm">
              <Search size={18} />
              Browse Solutions
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-muted uppercase tracking-wider">Sort By</label>
            <select className="bg-white border border-slate-200 rounded-sm px-4 py-2 text-sm font-medium text-primary focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none">
              <option>Date created</option>
              <option>Name</option>
              <option>Score</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-muted uppercase tracking-wider">Filter By</label>
            <select className="bg-white border border-slate-200 rounded-sm px-4 py-2 text-sm font-medium text-primary focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none">
              <option>All</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>In-Review</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="grid grid-cols-5 border-b border-slate-100 bg-slate-50/50">
          {tableHeaders.map((header) => (
            <div key={header} className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-widest text-center">
              {header}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading Projects...</p>
          </div>
        ) : isEmpty ? (
          <div className="py-24 flex flex-col items-center text-center space-y-12">
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-slate-800">
                Thank you for creating an isUD account.
              </h2>
              <p className="text-lg text-[#F7941D] font-bold tracking-tight italic">
                The path to certification is easy!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button variant="primary" className="gap-3">
                <Search size={20} className="opacity-70" />
                Browse Solutions
              </Button>
              <Link href="/projects/new">
                <Button variant="primary" className="gap-3">
                  <Plus size={22} className="opacity-70" />
                  Start a Project
                </Button>
              </Link>
            </div>


            <Link href="/guide">
               <Button variant="primary" className="gap-3 bg-[#002a54]">
                 <Info size={18} className="opacity-70" />
                 Learn how it works!
               </Button>
            </Link>

          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 text-center">
                      {project.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-center">
                      <Link href={`/projects/${project.id}`} className="text-slate-800 hover:text-secondary transition-colors underline-offset-2 hover:underline">
                        {project.projectName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center">
                      {project.ownerName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                        project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        project.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                        project.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 text-center">
                      {project.score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
