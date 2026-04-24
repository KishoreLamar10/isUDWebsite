'use client';

import React, { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { ResponseStatus } from '@prisma/client';

interface SolutionProps {
  solution: any;
  status: ResponseStatus;
  allPhases: any[];
  allGoals: any[];
  onStatusChange: (status: ResponseStatus) => void;
  readOnly?: boolean;
}

export const ChecklistSolutionItem: React.FC<SolutionProps> = ({
  solution,
  status,
  allPhases,
  allGoals,
  onStatusChange,
  readOnly = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleImplemented = () => {
    onStatusChange(status === 'IMPLEMENTED' ? 'NOT_IMPLEMENTED' : 'IMPLEMENTED');
  };

  return (
    <div className="border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-4 py-4 px-2 hover:bg-slate-50 transition-colors group">
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 p-0.5 rounded-full border border-slate-300 text-slate-400 hover:border-primary hover:text-primary transition-colors"
        >
          {expanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        <div className="flex-1 text-[15px] text-slate-700 leading-relaxed pt-0.5">
          {solution.isMandatory && (
            <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 uppercase tracking-wider border border-amber-200">
              Required
            </span>
          )}
          {solution.text}
        </div>

        <div className="flex items-center gap-2 pr-2">
          {/* Status Selector - Single Toggle */}
          <button
            onClick={() => !readOnly && toggleImplemented()}
            disabled={readOnly}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              status === 'IMPLEMENTED' ? 'bg-primary' : 'bg-slate-300'
            } ${readOnly ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <span className={`text-[10px] font-bold absolute ${status === 'IMPLEMENTED' ? 'left-1 text-white' : 'right-1 text-slate-500'}`}>
              {status === 'IMPLEMENTED' ? 'Yes' : 'No'}
            </span>
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                status === 'IMPLEMENTED' ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-slate-50/50 p-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-4xl overflow-x-auto">
            <table className="w-full text-xs text-slate-600 border-collapse shadow-sm rounded-lg overflow-hidden border border-slate-300">
              <thead>
                <tr className="bg-slate-200/70">
                  <th className="py-2.5 px-4 border border-slate-300 font-bold text-slate-700 w-32 text-left bg-slate-200">Phases</th>
                  <td className="py-2.5 px-4 border border-slate-300 bg-white">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {allPhases.map((p) => {
                        const isMatched = solution.phases.some((ph: any) => ph.name === p.name);
                        return (
                          <div key={p.id} className={`flex items-center gap-1.5 ${isMatched ? 'text-orange-500 font-bold' : 'text-slate-400 opacity-40'}`}>
                            {isMatched && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            {p.name}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
                <tr className="bg-slate-200/70">
                  <th className="py-2.5 px-4 border border-slate-300 font-bold text-slate-700 text-left bg-slate-200">Goals of UD</th>
                  <td className="py-2.5 px-4 border border-slate-300 bg-white">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {allGoals.map((g) => {
                        const isMatched = solution.goals.some((go: any) => go.text === g.text);
                        return (
                          <div key={g.id} className={`${isMatched ? 'text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200' : 'text-slate-400 opacity-40'}`}>
                            {g.text}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              </thead>
            </table>
          </div>
          {solution.instruction && (
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Instructions:</p>
              <div className="bg-white p-4 border border-slate-200 rounded-md text-[13px] italic leading-relaxed shadow-sm">
                {solution.instruction}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
