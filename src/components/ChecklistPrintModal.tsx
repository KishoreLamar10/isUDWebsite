'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import { ResponseStatus } from '@prisma/client';

interface Chapter {
  id: string;
  number: number;
  title: string;
  sections: any[];
}

interface Props {
  chapters: Chapter[];
  responses: Record<string, ResponseStatus>;
  toggles: Record<string, boolean>;
  onClose: () => void;
}

export default function ChecklistPrintModal({ chapters, responses, toggles, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(chapters.map((c) => c.id)));

  const allChecked = selected.size === chapters.length;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(chapters.map((c) => c.id)));
  };

  const handlePrint = () => {
    const printRoot = document.getElementById('checklist-print-root');
    if (!printRoot) return;

    const selectedChapters = chapters.filter((c) => selected.has(c.id));

    printRoot.innerHTML = `
      <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e2e8f0;display:flex;align-items:center;gap:16px;">
        <img src="/logo.png" style="height:36px;width:auto;" alt="isUD - Innovative solutions for Universal Design" />
        <span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;">Innovative Solutions for Universal Design</span>
      </div>
      ${selectedChapters.map((chapter, i) => `
        <div class="${i > 0 ? 'print-page-break' : ''}">
          <div style="margin-bottom:20px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">
            <span style="font-size:22px;font-weight:700;color:#1e293b;">${chapter.number}&nbsp;&nbsp;${chapter.title}</span>
          </div>
          ${chapter.sections.map((section: any) => {
            const isSectionEnabled = toggles[section.id] !== false;
            const sectionLabel = `${chapter.number}.${section.number}`;
            return `
              <div style="margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <strong style="font-size:15px;color:#003366;">${sectionLabel} ${section.title}</strong>
                  <span style="font-size:11px;color:#64748b;font-weight:600;">${isSectionEnabled ? 'Included' : 'Excluded'}</span>
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:12px;">
                  <thead>
                    <tr style="background:#f8fafc;">
                      <th style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;color:#64748b;font-weight:700;">Solution</th>
                      <th style="width:90px;text-align:center;padding:6px 8px;border:1px solid #e2e8f0;color:#64748b;font-weight:700;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${section.solutions.map((sol: any) => {
                      const status = responses[sol.id] || 'NOT_IMPLEMENTED';
                      const statusLabel: Record<string, string> = {
                        IMPLEMENTED: 'Yes',
                        NOT_IMPLEMENTED: 'No',
                        PARTIAL: 'Partial',
                        NOT_APPLICABLE: 'N/A',
                      };
                      const statusColor: Record<string, string> = {
                        IMPLEMENTED: '#16a34a',
                        NOT_IMPLEMENTED: '#dc2626',
                        PARTIAL: '#d97706',
                        NOT_APPLICABLE: '#64748b',
                      };
                      return `
                        <tr>
                          <td style="padding:6px 8px;border:1px solid #e2e8f0;line-height:1.4;">${sol.text || sol.description || ''}</td>
                          <td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;color:${statusColor[status] || '#64748b'};">${statusLabel[status] || status}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}
        </div>
      `).join('')}
    `;

    onClose();
    setTimeout(() => window.print(), 100);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900">Print Checklist</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter list */}
        <div className="px-6 py-4 space-y-1 max-h-72 overflow-y-auto">
          <label className="flex items-center gap-3 py-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-slate-300 text-primary accent-primary"
            />
            <span className="text-sm font-bold text-slate-700">All Chapters</span>
          </label>
          <div className="h-px bg-slate-100 my-1" />
          {chapters.map((chapter) => (
            <label key={chapter.id} className="flex items-center gap-3 py-2 cursor-pointer group hover:bg-slate-50 rounded px-1">
              <input
                type="checkbox"
                checked={selected.has(chapter.id)}
                onChange={() => toggle(chapter.id)}
                className="w-4 h-4 rounded border-slate-300 accent-primary"
              />
              <span className="text-sm text-slate-700 group-hover:text-primary transition-colors">
                <span className="font-semibold mr-2">{chapter.number}</span>{chapter.title}
              </span>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-primary rounded-md hover:bg-[#002855] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            Print {selected.size > 0 ? `(${selected.size} chapter${selected.size > 1 ? 's' : ''})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
