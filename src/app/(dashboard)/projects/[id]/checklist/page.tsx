'use client';

import React, { useEffect, useState, use, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChecklistSidebar } from '@/components/ChecklistSidebar';
import { ChecklistSectionList } from '@/components/ChecklistSectionList';
import { ResponseStatus } from '@prisma/client';
import { Printer, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface Params {
  id: string;
}

export default function ChecklistPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [allPhases, setAllPhases] = useState<any[]>([]);
  const [allGoals, setAllGoals] = useState<any[]>([]);
  
  // Local state for edits
  const [responses, setResponses] = useState<Record<string, ResponseStatus>>({});
  const responsesRef = useRef<Record<string, ResponseStatus>>({});
  const togglesRef = useRef<Record<string, boolean>>({});
  const dirtyResponsesRef = useRef<Record<string, ResponseStatus>>({});
  const dirtyTogglesRef = useRef<Record<string, boolean>>({});
  const saveRequestRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlightRef = useRef(false);
  const savePendingRef = useRef(false);
  
  const [userRole, setUserRole] = useState<string>('VIEWER');
  const [userStatus, setUserStatus] = useState<string>('PENDING');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await fetch(`/api/projects/${id}/checklist`);
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Unable to load checklist.');
        return;
      }

      setChapters(data.chapters);
      if (data.chapters.length > 0) setActiveChapterId(data.chapters[0].id);
      setAllPhases(data.allPhases || []);
      setAllGoals(data.allGoals || []);
      setUserRole(data.userRole || 'VIEWER');
      setUserStatus(data.userStatus || 'PENDING');

      const resMap: Record<string, ResponseStatus> = {};
      data.responses.forEach((r: any) => resMap[r.solutionId] = r.status);
      setResponses(resMap);
      responsesRef.current = resMap;

      const toggleMap: Record<string, boolean> = {};
      data.toggles.forEach((t: any) => toggleMap[t.sectionId] = t.isEnabled);
      togglesRef.current = toggleMap;

    } catch {
      setErrorMessage('Unable to load checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveLatestChecklist = useCallback(async () => {
    if (saveInFlightRef.current) {
      savePendingRef.current = true;
      return;
    }

    const requestId = saveRequestRef.current + 1;
    saveRequestRef.current = requestId;
    saveInFlightRef.current = true;
    savePendingRef.current = false;

    const responseChanges = { ...dirtyResponsesRef.current };
    const toggleChanges = { ...dirtyTogglesRef.current };
    dirtyResponsesRef.current = {};
    dirtyTogglesRef.current = {};

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      setSaving(true);
      setSaveError(false);

      const res = await fetch(`/api/projects/${id}/responses/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          responses: Object.entries(responseChanges).map(([solutionId, status]) => ({ solutionId, status })),
          toggles: Object.entries(toggleChanges).map(([sectionId, isEnabled]) => ({ sectionId, isEnabled })),
        }),
      });

      if (!res.ok) {
        dirtyResponsesRef.current = { ...responseChanges, ...dirtyResponsesRef.current };
        dirtyTogglesRef.current = { ...toggleChanges, ...dirtyTogglesRef.current };
        if (requestId === saveRequestRef.current) setSaveError(true);
        return;
      }

      if (requestId === saveRequestRef.current) setHasSaved(true);
    } catch {
      dirtyResponsesRef.current = { ...responseChanges, ...dirtyResponsesRef.current };
      dirtyTogglesRef.current = { ...toggleChanges, ...dirtyTogglesRef.current };
      if (requestId === saveRequestRef.current) setSaveError(true);
    } finally {
      clearTimeout(timeout);
      saveInFlightRef.current = false;

      if (savePendingRef.current) {
        saveLatestChecklist();
        return;
      }

      if (requestId === saveRequestRef.current) setSaving(false);
    }
  }, [id]);

  const hasPendingSave = useCallback(() => {
    return (
      saving ||
      saveInFlightRef.current ||
      Boolean(saveTimerRef.current) ||
      Object.keys(dirtyResponsesRef.current).length > 0 ||
      Object.keys(dirtyTogglesRef.current).length > 0
    );
  }, [saving]);

  const confirmNavigation = useCallback(() => {
    if (!hasPendingSave()) return true;
    return window.confirm('Checklist changes are still saving. Leave this page anyway?');
  }, [hasPendingSave]);

  const scheduleAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    setSaving(true);
    setSaveError(false);
    saveTimerRef.current = setTimeout(() => {
      saveLatestChecklist();
    }, 500);
  }, [saveLatestChecklist]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasPendingSave()) return;

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingSave]);

  const handleStatusChange = (solId: string, status: ResponseStatus) => {
    const nextResponses = { ...responsesRef.current, [solId]: status };
    responsesRef.current = nextResponses;
    dirtyResponsesRef.current = { ...dirtyResponsesRef.current, [solId]: status };
    setResponses(nextResponses);
    scheduleAutoSave();
  };

  const handleToggleChange = (section: any, enabled: boolean) => {
    // 1. Update the toggle state (for exclusion logic if still used by backend)
    const nextToggles = { ...togglesRef.current, [section.id]: enabled };
    togglesRef.current = nextToggles;
    dirtyTogglesRef.current = { ...dirtyTogglesRef.current, [section.id]: enabled };

    // 2. Bulk update all solutions in this section
    const newResponses = { ...responsesRef.current };
    section.solutions.forEach((sol: any) => {
      newResponses[sol.id] = enabled ? 'IMPLEMENTED' as ResponseStatus : 'NOT_IMPLEMENTED' as ResponseStatus;
      dirtyResponsesRef.current[sol.id] = newResponses[sol.id];
    });
    responsesRef.current = newResponses;
    setResponses(newResponses);
    scheduleAutoSave();
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

  if (errorMessage) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-sm border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Checklist unavailable</p>
          <h1 className="mt-3 text-2xl font-bold text-primary">We could not open this project checklist.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{errorMessage}</p>
          <div className="mt-6 flex gap-3">
            <Link href={`/projects/${id}`} className="rounded-sm bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#00264d]">
              Project Overview
            </Link>
            <Link href="/" className="rounded-sm border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-primary transition-colors hover:border-secondary">
              My Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Top Header Bar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
          <Link href="/" onClick={(event) => !confirmNavigation() && event.preventDefault()} className="hover:text-primary transition-colors">My Projects</Link>
          <ChevronRight className="w-4 h-4 opacity-40" />
          <Link href={`/projects/${id}`} onClick={(event) => !confirmNavigation() && event.preventDefault()} className="hover:text-primary transition-colors">Project Overview</Link>
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
            <div className={`flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold ${
              saveError
                ? 'bg-red-50 text-red-700 border border-red-100'
                : saving
                  ? 'bg-slate-100 text-slate-600'
                  : hasSaved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-slate-50 text-slate-500 border border-slate-100'
            }`}>
              {saveError ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className={`h-4 w-4 ${saving ? 'animate-pulse' : ''}`} />
              )}
              {saveError ? 'Save failed' : saving ? 'Saving...' : hasSaved ? 'Saved' : 'Auto-save on'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden bg-slate-50">
          <ChecklistSidebar 
          chapters={chapters} 
          activeChapterId={activeChapterId} 
          onChapterSelect={(chapterId) => {
            if (confirmNavigation()) setActiveChapterId(chapterId);
          }} 
        />

        <div className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
          {activeChapter && (
            <ChecklistSectionList 
              chapter={activeChapter}
              responses={responses}
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
