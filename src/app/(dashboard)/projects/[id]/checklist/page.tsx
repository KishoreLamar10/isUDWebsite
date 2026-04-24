'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChecklistSidebar } from '@/components/ChecklistSidebar';
import { ChecklistSectionList } from '@/components/ChecklistSectionList';
import { ResponseStatus } from '@prisma/client';
import { Printer, Save, RotateCcw, ChevronRight } from 'lucide-react';

interface Params {
  id: string;
}

export default function ChecklistPage({ params }: { params: Promise<Params> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [allPhases, setAllPhases] = useState<any[]>([]);
  const [allGoals, setAllGoals] = useState<any[]>([]);
  
  // Local state for edits
  const [responses, setResponses] = useState<Record<string, ResponseStatus>>({});
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  
  // Original state for "Clear"
  const [originalResponses, setOriginalResponses] = useState<Record<string, ResponseStatus>>({});
  const [originalToggles, setOriginalToggles] = useState<Record<string, boolean>>({});

  const [userRole, setUserRole] = useState<string>('VIEWER');
  const [userStatus, setUserStatus] = useState<string>('PENDING');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}/checklist`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      setChapters(data.chapters);
      if (data.chapters.length > 0) setActiveChapterId(data.chapters[0].id);
      setAllPhases(data.allPhases || []);
      setAllGoals(data.allGoals || []);
      setUserRole(data.userRole || 'VIEWER');
      setUserStatus(data.userStatus || 'PENDING');

      const resMap: Record<string, ResponseStatus> = {};
      data.responses.forEach((r: any) => resMap[r.solutionId] = r.status);
      setResponses(resMap);
      setOriginalResponses(resMap);

      const toggleMap: Record<string, boolean> = {};
      data.toggles.forEach((t: any) => toggleMap[t.sectionId] = t.isEnabled);
      setToggles(toggleMap);
      setOriginalToggles(toggleMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (solId: string, status: ResponseStatus) => {
    setResponses((prev) => ({ ...prev, [solId]: status }));
  };

  const handleToggleChange = (section: any, enabled: boolean) => {
    // 1. Update the toggle state (for exclusion logic if still used by backend)
    setToggles((prev) => ({ ...prev, [section.id]: enabled }));

    // 2. Bulk update all solutions in this section
    const newResponses = { ...responses };
    section.solutions.forEach((sol: any) => {
      newResponses[sol.id] = enabled ? 'IMPLEMENTED' as ResponseStatus : 'NOT_IMPLEMENTED' as ResponseStatus;
    });
    setResponses(newResponses);
  };


  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/projects/${id}/responses/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: Object.entries(responses).map(([solutionId, status]) => ({ solutionId, status })),
          toggles: Object.entries(toggles).map(([sectionId, isEnabled]) => ({ sectionId, isEnabled })),
        }),
      });

      if (res.ok) {
        setOriginalResponses({ ...responses });
        setOriginalToggles({ ...toggles });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setResponses({ ...originalResponses });
    setToggles({ ...originalToggles });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading checklist data...</p>
        </div>
      </div>
    );
  }

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  const isReadOnly = userRole === 'VIEWER' || userStatus === 'PENDING';

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Top Header Bar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">My Projects</Link>
          <ChevronRight className="w-4 h-4 opacity-40" />
          <Link href={`/projects/${id}`} className="hover:text-primary transition-colors">Project Overview</Link>
          <ChevronRight className="w-4 h-4 opacity-40" />
          <span className="text-slate-900">{isReadOnly ? 'View Checklist' : 'Edit Checklist'}</span>
          {isReadOnly && (
            <span className="ml-4 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200">
              Read-Only Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 h-10 bg-slate-100 text-slate-600 rounded-md text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 h-10 bg-primary text-white rounded-md text-sm font-extrabold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
              {saving ? 'Saving...' : 'Save Checklist'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden bg-slate-50">
        <ChecklistSidebar 
          chapters={chapters} 
          activeChapterId={activeChapterId} 
          onChapterSelect={setActiveChapterId} 
        />

        <div className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
          {activeChapter && (
            <ChecklistSectionList 
              chapter={activeChapter}
              responses={responses}
              toggles={toggles}
              allPhases={allPhases}
              allGoals={allGoals}
              onStatusChange={handleStatusChange}
              onToggleChange={handleToggleChange}
              readOnly={isReadOnly}
            />
          )}
        </div>
      </div>
    </div>
  );
}
