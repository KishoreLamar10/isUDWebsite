'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft, Loader2, Shield, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import AddTeamMemberModal from '@/components/AddTeamMemberModal';

interface TeamMember {
  id: string;
  projectId: string;
  email: string;
  permission: 'ADMIN' | 'EDITOR' | 'VIEWER';
  role: string;
  status: 'ACTIVE' | 'PENDING';
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ProjectTeamPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [teamRes, projectRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/team`),
        fetch(`/api/projects/${projectId}`),
      ]);
      const teamData = await teamRes.json();
      const projectData = await projectRes.json();
      
      setTeam(teamData);
      setProjectName(projectData.projectName);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (data: { email: string; permission: string; role: string }) => {
    const res = await fetch(`/api/projects/${projectId}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send invitation');
    }
    
    fetchData(); // Refresh list
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading project team...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push('/')}>My Projects</span>
        <span>&gt;</span>
        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push(`/projects/${projectId}`)}>Project Overview</span>
        <span>&gt;</span>
        <span className="text-primary font-bold">Project Team</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Project Team - <span className="text-primary">{projectName}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="bg-[#002a54] text-white hover:bg-[#001d3d] border-none font-bold px-6 py-3 flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <UserPlus size={18} />
            Add Team Member
          </Button>
          <Button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="bg-[#002a54] text-white hover:bg-[#001d3d] border-none font-bold px-6 py-3 flex items-center gap-2 shadow-sm whitespace-nowrap"
          >
            <ArrowLeft size={18} />
            Project Overview
          </Button>
        </div>
      </div>

      {/* Definitions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-slate-50 p-8 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            Project Manager
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            The project manager is the point of contact with the isUD Team. The project manager is the person managing the isUD certification process, including implementing the UD solutions, submitting documentation, and coordinating and scheduling the on-site audit. The project manager can edit project registration details and add team members. The project manager is included in all communication.
          </p>
        </div>
        <div className="bg-slate-50 p-8 rounded-2xl space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Team Member
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            Team members can include anyone who has a role in helping to implement the project. Team members will not be included in isUD communication unless specifically requested.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-slate-900 min-w-[60px]">• Editor:</span>
              <span className="text-slate-600">Can Edit project profile and solutions, upload documents</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-900 min-w-[60px]">• Viewer:</span>
              <span className="text-slate-600">Can view the project information only</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Name</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Email</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Permissions</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Role</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Status</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-medium text-slate-900">
                      {member.user ? `${member.user.firstName} ${member.user.lastName}` : (member.status === 'PENDING' ? 'Invited User' : 'Unknown')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-600">{member.email}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                      member.permission === 'ADMIN' ? 'bg-primary/10 text-primary' :
                      member.permission === 'EDITOR' ? 'bg-[#F7941D]/10 text-[#F7941D]' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {member.permission}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-medium">{member.role}</td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 font-bold ${member.status === 'ACTIVE' ? 'text-green-600' : 'text-amber-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${member.status === 'ACTIVE' ? 'bg-green-600' : 'bg-amber-500 animate-pulse'}`} />
                      {member.status === 'ACTIVE' ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {/* Actions would go here - e.g. Delete, Change Role */}
                    <span className="text-slate-300 text-xs italic">No actions available</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddTeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
