'use client';

import React, { useState } from 'react';
import { Check, Edit3, Minus, Plus, X } from 'lucide-react';
import Link from 'next/link';
import type { PreliminaryStatus } from './PreliminaryChecklistInfo';

interface PreliminaryProgressProps {
  projectId: string;
  status: PreliminaryStatus;
  totalEarned: number;
  bonus: number;
}

function ResultIcon({ passed }: { passed: boolean }) {
  return (
    <div
      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] bg-white ${
        passed ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'
      }`}
    >
      {passed ? <Check className="h-7 w-7 stroke-[4]" /> : <X className="h-7 w-7 stroke-[4]" />}
    </div>
  );
}

function BulletColumns({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 pl-12 text-[14px] leading-[1.35] text-slate-900 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <li key={item} className="list-disc whitespace-nowrap pl-1">
          {item}
        </li>
      ))}
    </ul>
  );
}

export const PreliminaryProgress: React.FC<PreliminaryProgressProps> = ({
  projectId,
  status,
  totalEarned,
  bonus,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const roundedScore = Math.round(status.scorePercentage);
  const finalScoreText = `${roundedScore}%`;
  const earnedCreditText = status.isThresholdMet
    ? `Based on the solutions selected, you earned ${totalEarned} credits and ${bonus} bonus credits. Your projected final score is ${finalScoreText}.`
    : `Based on the solutions selected, you earned ${totalEarned} credits and ${bonus} bonus credits. Your projected final score is ${finalScoreText}.This is insufficient to qualify for self-assessment. This project requires a minimum score of 78%. The sections listed below did not earn any credit. Please review these sections and implement additional solutions.`;

  return (
    <section className="overflow-hidden rounded-sm border border-slate-200 bg-white text-slate-900 shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="flex w-full items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 text-left transition-colors hover:bg-slate-100"
      >
        <h2 className="text-[18px] font-bold leading-none text-primary">
          Preliminary Certification Progress
        </h2>
        <span className="mr-1 text-primary">
          {isExpanded ? <Minus className="h-5 w-5 stroke-[4]" /> : <Plus className="h-5 w-5 stroke-[4]" />}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-8 px-8 pb-8 pt-6">
          <div className="flex gap-4">
            <ResultIcon passed={status.isQualifying} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[20px] font-bold leading-tight text-slate-900">Available Sections:</h3>
              <p className="mt-2 text-[15px] leading-[1.45] text-slate-700">
                {status.isQualifying
                  ? 'You selected enough sections to qualify for self-assessment.'
                  : 'You have not selected enough sections to qualify for self-assessment.'}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <ResultIcon passed={status.isThresholdMet} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[20px] font-bold leading-tight text-slate-900">Earned Credit:</h3>
              <p className="mt-2 max-w-[680px] text-[15px] leading-[1.7] text-slate-700">
                {earnedCreditText}
              </p>
              {!status.isThresholdMet && <BulletColumns items={status.failedSections} />}
              <Link
                href={`/projects/${projectId}/checklist`}
                className="mt-4 inline-flex items-center gap-2 text-[15px] font-bold text-primary hover:text-secondary hover:underline"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded border border-primary bg-white">
                  <Edit3 className="h-3.5 w-3.5" />
                </span>
                Edit Solutions
              </Link>
            </div>
          </div>

          <div className="flex gap-4">
            <ResultIcon passed={status.isMandatoryMet} />
            <div className="min-w-0 flex-1">
              <h3 className="text-[20px] font-bold leading-tight text-slate-900">Required Solutions:</h3>
              <p className="mt-2 max-w-[680px] text-[15px] leading-[1.55] text-slate-700">
                {status.isMandatoryMet
                  ? 'You have selected all required solutions.'
                  : 'You have not selected all required solutions. Please review the following sections to ensure all required solutions are implemented.'}
              </p>
              {!status.isMandatoryMet && <BulletColumns items={status.missingMandatorySections} />}
              <Link
                href={`/projects/${projectId}/checklist`}
                className="mt-4 inline-flex items-center gap-2 text-[15px] font-bold text-primary hover:text-secondary hover:underline"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded border border-primary bg-white">
                  <Edit3 className="h-3.5 w-3.5" />
                </span>
                Edit Solutions
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
