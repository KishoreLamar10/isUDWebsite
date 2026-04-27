'use client';

import React, { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import Button from './ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; permission: string; role: string }) => Promise<void>;
}

const roles = [
  { value: 'ARCHITECT', label: 'Project Architect/Design Team' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'DEVELOPMENT', label: 'Real Estate Development' },
  { value: 'OWNERSHIP', label: 'Ownership/Management' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'ADVOCATE', label: 'Community Advocate' },
];

export default function AddTeamMemberModal({ isOpen, onClose, onInvite }: ModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('EDITOR');
  const [role, setRole] = useState(roles[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onInvite({ email, permission, role });
      setEmail('');
      setPermission('EDITOR');
      setRole(roles[0].value);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/45 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="px-8 py-8 space-y-7">
          <h2 className="text-xl font-bold text-slate-900">Add Team Member</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm italic">
                {error}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-900">E-mail Address</label>
              <div className="relative">
              <input
                type="email"
                required
                className="w-full h-11 px-4 pr-12 bg-white border border-slate-300 rounded-md text-base text-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                placeholder="E-mail Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
                <UserPlus className="absolute right-4 top-3 text-slate-900" size={22} />
              </div>
            </div>

            {/* Permission Level */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-900">Project Permission Level</label>
              <div className="space-y-3">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-10 h-6 shrink-0">
                    <input
                      type="radio"
                      name="permission"
                      value="EDITOR"
                      checked={permission === 'EDITOR'}
                      onChange={() => setPermission('EDITOR')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full transition-all ${permission === 'EDITOR' ? 'bg-secondary' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                  </div>
                  <span className="text-base text-slate-900">Team Member - Editor</span>
                </label>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-10 h-6 shrink-0">
                    <input
                      type="radio"
                      name="permission"
                      value="VIEWER"
                      checked={permission === 'VIEWER'}
                      onChange={() => setPermission('VIEWER')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full transition-all ${permission === 'VIEWER' ? 'bg-secondary' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                  </div>
                  <span className="text-base text-slate-900">Team Member - Viewer</span>
                </label>
              </div>
            </div>

            {/* Project Role */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-900">Project Role</label>
              <select
                className="w-full h-11 px-4 bg-slate-100 border border-slate-300 rounded-md text-base text-slate-800 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-700">If the request is not successful, please retry.</p>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-md font-bold min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-[#001d3d] text-white px-12 py-3 rounded-md font-bold min-w-[160px] transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Add'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
