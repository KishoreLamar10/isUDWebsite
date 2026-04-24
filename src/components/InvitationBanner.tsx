'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, X, ArrowRight, Loader2 } from 'lucide-react';

interface Invitation {
  id: string;
  projectId: string;
  project: {
    projectName: string;
  };
}

export default function InvitationBanner() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/user/invitations');
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (projectId: string) => {
    setProcessingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}/team`, {
        method: 'PATCH',
      });
      if (res.ok) {
        // Success - remove from local state and refresh
        setInvitations(prev => prev.filter(inv => inv.projectId !== projectId));
        router.refresh();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || invitations.length === 0) return null;

  return (
    <div className="bg-[#002a54] text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-white/10 shadow-lg animate-in slide-in-from-top duration-500 sticky top-0 z-[60]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bell size={20} className="text-[#F7941D]" />
          </div>
          <p className="text-sm font-medium">
            You have been invited to join <span className="font-bold text-[#F7941D]">{invitations[0].project.projectName}</span>
            {invitations.length > 1 && ` and ${invitations.length - 1} other project(s)`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAccept(invitations[0].projectId)}
            disabled={!!processingId}
            className="flex items-center gap-1.5 bg-[#F7941D] hover:bg-[#e68a1b] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-50"
          >
            {processingId === invitations[0].projectId ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Accept Invitation
          </button>
          
          <button
            onClick={() => router.push(`/projects/${invitations[0].projectId}/team`)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all"
          >
            View Team
            <ArrowRight size={14} />
          </button>
          
          <button 
            onClick={() => setInvitations([])} // Temporary hide
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
