'use client';

import { Check, Info, X } from 'lucide-react';

export type PreliminaryStatus = {
  failedSections: string[];
  missingMandatorySections: string[];
  activeSectionsCount: number;
  scorePercentage: number;
  isThresholdMet: boolean;
  isQualifying: boolean;
  isMandatoryMet: boolean;
};

type PreliminaryChecklistInfoProps = {
  status: PreliminaryStatus;
  totalEarned: number;
  bonus: number;
};

function StatusRow({
  passed,
  title,
  children,
}: {
  passed: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white ${
          passed ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'
        }`}
      >
        {passed ? <Check className="h-4 w-4 stroke-[4]" /> : <X className="h-4 w-4 stroke-[4]" />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <div className="mt-1 text-xs leading-5 text-slate-600">{children}</div>
      </div>
    </div>
  );
}

function SectionList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  const previewItems = items.slice(0, 12);
  const hiddenCount = items.length - previewItems.length;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {previewItems.map((item) => (
        <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
          {item}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}

export function PreliminaryChecklistInfo({
  status,
  totalEarned,
  bonus,
}: PreliminaryChecklistInfoProps) {
  const roundedScore = Math.round(status.scorePercentage);

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        aria-label="Show preliminary certification checklist"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:border-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
      >
        <Info className="h-4 w-4" />
      </button>

      <div className="pointer-events-none absolute right-0 top-full z-50 mt-3 hidden w-[min(460px,calc(100vw-2rem))] rounded-md border border-slate-200 bg-white p-5 text-left shadow-xl group-hover:block group-focus-within:block">
        <div className="absolute -top-2 right-3 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />
        <div className="relative space-y-3.5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Preliminary Checklist</p>
            <p className="mt-1 text-sm text-slate-600">
              Current projected score: <span className="font-bold text-primary">{roundedScore}%</span>
              {' '}from <span className="font-bold">{totalEarned}</span> earned credits and{' '}
              <span className="font-bold">{bonus}</span> bonus credits.
            </p>
          </div>

          <StatusRow passed={status.isQualifying} title="Available Sections">
            {status.isQualifying
              ? 'Enough sections are enabled for self-assessment.'
              : 'Enable at least one applicable section to qualify for self-assessment.'}
          </StatusRow>

          <StatusRow passed={status.isThresholdMet} title="Earned Credit">
            {status.isThresholdMet
              ? 'The projected score meets the 78% minimum threshold.'
              : 'The projected score is below the 78% minimum threshold.'}
            {!status.isThresholdMet && status.failedSections.length > 0 && (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Sections needing credit: {status.failedSections.length}
              </p>
            )}
            {!status.isThresholdMet && <SectionList items={status.failedSections} />}
          </StatusRow>

          <StatusRow passed={status.isMandatoryMet} title="Required Solutions">
            {status.isMandatoryMet
              ? 'All required solutions in enabled sections are selected.'
              : 'Some required solutions still need to be selected.'}
            {!status.isMandatoryMet && status.missingMandatorySections.length > 0 && (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Required groups remaining: {status.missingMandatorySections.length}
              </p>
            )}
            {!status.isMandatoryMet && <SectionList items={status.missingMandatorySections} />}
          </StatusRow>
        </div>
      </div>
    </div>
  );
}
