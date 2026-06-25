'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SidebarProps {
  chapters: any[];
  activeChapterId: string;
  onChapterSelect: (id: string) => void;
}

export const ChecklistSidebar: React.FC<SidebarProps> = ({
  chapters,
  activeChapterId,
  onChapterSelect,
}) => {
  return (
    <div className="w-80 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col pt-4">
      <div className="px-6 py-2 mb-4">
        <h2 className="text-[12px] font-bold text-slate-600 uppercase tracking-widest">Chapters</h2>
      </div>
      <nav className="flex-1 overflow-y-auto pr-px">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onChapterSelect(chapter.id)}
            className={`w-full flex items-center justify-between group py-4 px-6 transition-all duration-200 border-r-4 ${
              activeChapterId === chapter.id
                ? 'bg-slate-50 border-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
                : 'bg-transparent border-transparent hover:bg-slate-50/50 hover:border-slate-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className={`text-[15px] font-bold transition-colors ${
                activeChapterId === chapter.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'
              }`}>
                {chapter.number}
              </span>
              <span className={`text-[15px] font-medium text-left leading-tight transition-colors ${
                activeChapterId === chapter.id ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-slate-900'
              }`}>
                {chapter.title}
              </span>
            </div>
            
            <ChevronRight className={`w-5 h-5 transition-all duration-300 transform ${
              activeChapterId === chapter.id 
                ? 'text-orange-500 translate-x-1 opacity-100' 
                : 'text-slate-300 opacity-0 -translate-x-2'
            }`} />
          </button>
        ))}
      </nav>
    </div>
  );
};
