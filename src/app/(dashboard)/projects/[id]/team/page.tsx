'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Trash2, UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import AddTeamMemberModal from '@/components/AddTeamMemberModal';

const roleLabels: Record<string, string> = {
  PROJECT_MANAGER: 'Project Manager',
  ARCHITECT: 'Project Architect/Design Team',
  CONSULTANT: 'Consultant',
  DEVELOPMENT: 'Real Estate Development',
  OWNERSHIP: 'Ownership/Management',
  HR: 'Human Resources',
  ADVOCATE: 'Community Advocate',
};

const permissionLabels: Record<string, string> = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

const permissionOptions = [
  { value: 'EDITOR', label: 'Editor' },
  { value: 'VIEWER', label: 'Viewer' },
];

const roleOptions = [
  { value: 'ARCHITECT', label: 'Project Architect/Design Team' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'DEVELOPMENT', label: 'Real Estate Development' },
  { value: 'OWNERSHIP', label: 'Ownership/Management' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'ADVOCATE', label: 'Community Advocate' },
];

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

interface ProjectData {
  id: string;
  projectName: string;
  contactName: string;
  contactEmail: string;
  userRole: string;
  userStatus: string;
}

export default function ProjectTeamPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

      setTeam(Array.isArray(teamData) ? teamData : []);
      setProject(projectData);
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

    fetchData();
  };

  const handleMemberUpdate = async (
    memberId: string,
    data: Partial<Pick<TeamMember, 'permission' | 'role'>>
  ) => {
    setActionLoadingId(memberId);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/team`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, ...data }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update team member');
      }

      await fetchData();
    } catch (error: any) {
      setActionError(error.message || 'Failed to update team member');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveMember = async (memberId: string, status: TeamMember['status']) => {
    const label = status === 'PENDING' ? 'cancel this invitation' : 'remove this team member';
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;

    setActionLoadingId(memberId);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/team?memberId=${memberId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to remove team member');
      }

      await fetchData();
    } catch (error: any) {
      setActionError(error.message || 'Failed to remove team member');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading project team...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="font-bold text-red-600">Unable to load project team.</p>
      </div>
    );
  }

  const canEdit = project.userRole === 'ADMIN' || project.userRole === 'EDITOR';
  const rows = [
    {
      id: 'project-manager',
      name: project.contactName,
      email: project.contactEmail,
      permission: 'Admin',
      role: 'Project Manager',
      status: 'Active',
      isManager: true,
      permissionValue: 'ADMIN',
      roleValue: 'PROJECT_MANAGER',
      statusValue: 'ACTIVE' as const,
    },
    ...team.map((member) => ({
      id: member.id,
      name: member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Invited User',
      email: member.email,
      permission: permissionLabels[member.permission] || member.permission,
      role: roleLabels[member.role] || member.role,
      status: member.status === 'ACTIVE' ? 'Active' : 'Pending',
      permissionValue: member.permission,
      roleValue: member.role,
      statusValue: member.status,
      isManager: false,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <nav className="text-sm font-medium flex items-center gap-2">
        <button className="text-primary hover:underline" onClick={() => router.push('/')}>My Projects</button>
        <span className="text-slate-500">&gt;</span>
        <button className="text-primary hover:underline" onClick={() => router.push(`/projects/${projectId}`)}>Project Overview</button>
        <span className="text-slate-500">&gt;</span>
        <span className="text-slate-500 font-bold">Project Team</span>
      </nav>

      <section className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-xl font-bold text-primary tracking-tight">
            Project Team - {project.projectName}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            {canEdit && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="h-10 rounded-md bg-primary px-4 text-white hover:bg-[#001d3d] font-bold flex items-center gap-2"
              >
                <UserPlus size={18} />
                Add Team Member
              </Button>
            )}
            <Button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="h-10 rounded-md bg-primary px-4 text-white hover:bg-[#001d3d] font-bold flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Project Overview
            </Button>
          </div>
        </div>

        <div className="px-6 py-6">
          {actionError && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {actionError}
            </div>
          )}

          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">
              Project Team - {project.projectName}
            </h2>

            <p className="text-sm leading-relaxed text-slate-700">
              <span className="font-bold">Project Manager:</span>{' '}
              The project manager is the point of contact with the isUD Team. The project manager is the person managing the isUD certification process, including implementing the UD solutions, submitting documentation, and coordinating and scheduling the on-site audit. The project manager can edit project registration details and add team members. The project manager is included in all communication.
            </p>

            <div className="text-sm leading-relaxed text-slate-700">
              <p>
                <span className="font-bold">Team Member:</span>{' '}
                Team members can include anyone who has a role in helping to implement the project. Team members will not be included in isUD communication unless specifically requested.
              </p>
              <ul className="mt-1 list-disc pl-8 leading-relaxed">
                <li><span className="font-medium">Editor:</span> Can Edit project profile and solutions, upload documents</li>
                <li><span className="font-medium">Viewer:</span> Can view the project information only</li>
              </ul>
            </div>
          </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="px-6 py-3 text-center text-sm font-bold text-slate-900">Name</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-slate-900">Email</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-slate-900">Permissions</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-slate-900">Role</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-slate-900">Status</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-300">
                  <td className="px-6 py-5 text-center text-sm text-slate-800">{row.name}</td>
                  <td className="px-6 py-5 text-center text-sm text-slate-800">{row.email}</td>
                  <td className="px-6 py-5 text-center text-sm text-slate-800">
                    {canEdit && !row.isManager ? (
                      <select
                        aria-label={`Permission for ${row.email}`}
                        value={row.permissionValue}
                        disabled={actionLoadingId === row.id}
                        onChange={(event) => handleMemberUpdate(row.id, { permission: event.target.value as TeamMember['permission'] })}
                        className="h-9 w-full min-w-[120px] rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        {permissionOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      row.permission
                    )}
                  </td>
                  <td className="px-6 py-5 text-center text-sm text-slate-800">
                    {canEdit && !row.isManager ? (
                      <select
                        aria-label={`Role for ${row.email}`}
                        value={row.roleValue}
                        disabled={actionLoadingId === row.id}
                        onChange={(event) => handleMemberUpdate(row.id, { role: event.target.value })}
                        className="h-9 w-full min-w-[220px] rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      row.role
                    )}
                  </td>
                  <td className="px-6 py-5 text-center text-sm text-slate-800">{row.status}</td>
                  <td className="px-6 py-5 text-center text-sm text-slate-500">
                    {canEdit && !row.isManager ? (
                      <button
                        type="button"
                        disabled={actionLoadingId === row.id}
                        onClick={() => handleRemoveMember(row.id, row.statusValue)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoadingId === row.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        {row.statusValue === 'PENDING' ? 'Cancel' : 'Remove'}
                      </button>
                    ) : (
                      ''
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </section>

      <AddTeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
