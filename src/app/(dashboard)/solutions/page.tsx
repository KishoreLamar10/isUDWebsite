'use client';

import { useState } from 'react';
import { Printer, ChevronRight, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SubSection {
  id: string;
  title: string;
}

interface Chapter {
  id: number;
  title: string;
  credits: number;
  subSections: SubSection[];
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: 'Design Process',
    credits: 4,
    subSections: [
      { id: '1.1', title: 'Project Development Team' },
      { id: '1.2', title: 'Universal Design Education' },
    ],
  },
  {
    id: 2,
    title: 'Space Clearances',
    credits: 7,
    subSections: [
      { id: '2.1', title: 'General Space Clearances' },
      { id: '2.2', title: 'Doors and Entrances' },
    ],
  },
  {
    id: 3,
    title: 'Circulation',
    credits: 15,
    subSections: [
      { id: '3.1', title: 'Horizontal Circulation' },
      { id: '3.2', title: 'Vertical Circulation' },
    ],
  },
  {
    id: 4,
    title: 'Environmental Quality',
    credits: 7,
    subSections: [
      { id: '4.1', title: 'Lighting' },
      { id: '4.2', title: 'Acoustics' },
    ],
  },
  {
    id: 5,
    title: 'Site',
    credits: 15,
    subSections: [
      { id: '5.1', title: 'Parking and Drop-off' },
      { id: '5.2', title: 'Exterior Ramps' },
    ],
  },
  {
    id: 6,
    title: 'Rooms and Spaces',
    credits: 30,
    subSections: [
      { id: '6.1', title: 'Restrooms' },
      { id: '6.2', title: 'Bathing' },
    ],
  },
  {
    id: 7,
    title: 'Furnishings and Equipment',
    credits: 12,
    subSections: [
      { id: '7.1', title: 'Kitchens' },
      { id: '7.2', title: 'Workstations' },
    ],
  },
  {
    id: 8,
    title: 'Services',
    credits: 6,
    subSections: [
      { id: '8.1', title: 'Information Systems' },
      { id: '8.2', title: 'Service Counters' },
    ],
  },
  {
    id: 9,
    title: 'Shared and Support Spaces',
    credits: 10,
    subSections: [
      { id: '9.1', title: 'Shared Spaces' },
      { id: '9.2', title: 'Support Spaces' },
    ],
  },
];

export default function BrowseSolutionsPage() {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const activeChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  const breadcrumbItems = [
    { label: 'My Projects', href: '/' },
    { label: 'Browse Solutions' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="bg-white border-b border-slate-200 shadow-sm overflow-hidden rounded-sm">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Browse Solutions</h1>
          <button className="flex items-center gap-2 bg-[#002a54] text-white px-4 py-1.5 rounded-sm text-sm font-bold hover:bg-[#003d7a] transition-colors">
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
          {/* Chapter Sidebar */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200 py-6">
            <div className="space-y-0">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapterId(chapter.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-8 py-4 text-left transition-all group border-b border-white hover:bg-slate-50",
                    activeChapterId === chapter.id ? "bg-slate-50" : "bg-white"
                  )}
                >
                  <div className="flex gap-4">
                    <span className={cn(
                      "text-xl font-bold transition-colors shrink-0 w-4",
                      activeChapterId === chapter.id ? "text-secondary" : "text-primary"
                    )}>
                      {chapter.id}
                    </span>
                    <div className="space-y-0.5">
                      <div className={cn(
                        "text-[15px] font-bold tracking-tight transition-colors",
                        activeChapterId === chapter.id ? "text-[#002a54]" : "text-slate-600 group-hover:text-[#002a54]"
                      )}>
                        {chapter.title}
                      </div>
                      <div className={cn(
                        "text-[13px] transition-colors",
                        activeChapterId === chapter.id ? "text-secondary font-bold" : "text-slate-500 font-medium"
                      )}>
                        {chapter.credits} Credits
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "transition-all duration-300",
                    activeChapterId === chapter.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:opacity-40"
                  )}>
                    {activeChapterId === chapter.id ? (
                      <ArrowRight className="text-secondary" size={24} strokeWidth={3} />
                    ) : (
                      <ChevronRight className="text-slate-300" size={24} strokeWidth={2} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subsections Content */}
          <div className="md:col-span-7 lg:col-span-8 p-10 bg-white">
            <div className="max-w-xl space-y-6">
              {activeChapter.subSections.map((sub) => (
                <button
                  key={sub.id}
                  className="w-full flex items-center justify-between group p-2 -m-2 rounded-sm hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex gap-4 items-center">
                    <span className="text-[17px] font-bold text-primary shrink-0 min-w-8">
                      {sub.id}
                    </span>
                    <span className="text-[17px] font-bold text-[#002a54] group-hover:text-secondary transition-colors">
                      {sub.title}
                    </span>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-secondary transition-colors" size={20} strokeWidth={3} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
