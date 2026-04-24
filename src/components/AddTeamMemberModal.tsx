'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Button from './ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; permission: string; role: string }) => Promise<void>;
}

const roles = [
  'Project Architect/Design Team',
  'Consultant',
  'Real Estate Development',
  'Ownership/Management',
  'Human Resources',
  'Community Advocate',
];

export default function AddTeamMemberModal({ isOpen, onClose, onInvite }: ModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('EDITOR');
  const [role, setRole] = useState(roles[0]);
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
      setRole(roles[0]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Add Team Member</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm italic">
                {error}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-3">
              <label className="text-base font-medium text-slate-700">E-mail Address</label>
              <input
                type="email"
                required
                className="w-full h-14 px-5 bg-white border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="E-mail Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Permission Level */}
            <div className="space-y-4">
              <label className="text-base font-medium text-slate-700">Project Permission Level</label>
              <div className="space-y-3">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                    <input
                      type="radio"
                      name="permission"
                      value="EDITOR"
                      checked={permission === 'EDITOR'}
                      onChange={() => setPermission('EDITOR')}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${permission === 'EDITOR' ? 'border-[#F7941D] bg-[#F7941D]' : 'border-slate-300 bg-white group-hover:border-slate-400'}`} />
                  </div>
                  <span className="text-base text-slate-700">Team Member - Editor</span>
                </label>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                    <input
                      type="radio"
                      name="permission"
                      value="VIEWER"
                      checked={permission === 'VIEWER'}
                      onChange={() => setPermission('VIEWER')}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${permission === 'VIEWER' ? 'border-slate-300 bg-slate-300' : 'border-slate-300 bg-white group-hover:border-slate-400'}`} />
                  </div>
                  <span className="text-base text-slate-700">Team Member - Viewer</span>
                </label>
              </div>
            </div>

            {/* Project Role */}
            <div className="space-y-3">
              <label className="text-base font-medium text-slate-700">Project Role</label>
              <select
                className="w-full h-14 px-5 bg-slate-100 border border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <div className="flex justify-end w-full">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#002a54] hover:bg-[#001d3d] text-white px-12 py-4 rounded-xl font-bold min-w-[140px] shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Add'}
                </Button>
              </div>
              <p className="text-sm text-slate-500 italic">If the request is not successful, please retry.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
