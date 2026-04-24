'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PreliminaryProgressProps {
  projectId: string;
  status: {
    failedSections: string[];
    missingMandatorySections: string[];
    activeSectionsCount: number;
    scorePercentage: number;
    isThresholdMet: boolean;
    isQualifying: boolean;
    isMandatoryMet: boolean;
  };
  totalEarned: number;
  bonus: number;
}

export const PreliminaryProgress: React.FC<PreliminaryProgressProps> = ({
  projectId,
  status,
  totalEarned,
  bonus,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pillars = [
    {
      id: 'sections',
      title: 'Available Sections',
      description: status.isQualifying 
        ? 'You selected enough sections to qualify for self-assessment.' 
        : 'Select at least one section to begin self-assessment.',
      isMet: status.isQualifying,
      details: null,
    },
    {
      id: 'credits',
      title: 'Earned Credit',
      description: `Your project requires a minimum score of 80% to be eligible for certification. You earned ${totalEarned} credits and ${bonus} bonus credits.`,
      isMet: status.isThresholdMet,
      details: status.failedSections.length > 0 ? {
        title: 'Sections without credit:',
        items: status.failedSections,
      } : null,
    },
    {
      id: 'mandatory',
      title: 'Required Solutions',
      description: status.isMandatoryMet 
        ? 'All required solutions for this project have been satisfied.' 
        : 'One or more required solutions have not been implemented.',
      isMet: status.isMandatoryMet,
      details: status.missingMandatorySections.length > 0 ? {
        title: 'Sections with missing required solutions:',
        items: status.missingMandatorySections,
      } : null,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">
            Preliminary Certification Progress
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {pillars.map((p) => (
              <div 
                key={p.id}
                className={`w-3 h-3 rounded-full border-2 border-white ${p.isMet ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
            ))}
          </div>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="shrink-0 mt-1">
                  {pillar.isMet ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{pillar.title}</h4>
                    <Link 
                      href={`/projects/${projectId}/checklist`}
                      className="text-[11px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1 hover:underline"
                    >
                      Edit solutions <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-[14px] text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>

              {/* Detail Lists */}
              {pillar.details && (
                <div className="ml-10 bg-slate-50 border border-slate-100 rounded-sm p-4">
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    {pillar.details.title}
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {pillar.details.items.map((item) => (
                      <div 
                        key={item}
                        className="bg-white border border-slate-200 rounded py-1 px-2 text-center text-xs font-mono font-bold text-slate-700 shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Progress Summary Footer */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global Score</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-primary font-mono">
                  {Math.round(status.scorePercentage)}%
                </div>
                <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-1000 ${status.isThresholdMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, status.scorePercentage)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${
                status.isThresholdMet && status.isMandatoryMet && status.isQualifying
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {status.isThresholdMet && status.isMandatoryMet && status.isQualifying 
                  ? 'Ready for Review' 
                  : 'In Progress'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
