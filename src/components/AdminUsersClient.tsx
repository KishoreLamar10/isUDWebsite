'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Mail, Search, Send } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  systemRole: string;
  lastLoginAt: string | null;
  projectCount: number;
  membershipCount: number;
};

function formatLastLogin(value: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load users');
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load users');
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.systemRole.toLowerCase().includes(term)
    );
  }, [query, users]);

  async function sendSetupEmail(user: AdminUser) {
    setSendingId(user.id);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send setup email');
      setMessage(`Password setup email sent to ${user.email}.`);
    } catch (err: any) {
      setError(err.message || 'Unable to send setup email');
    } finally {
      setSendingId('');
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'My Projects', href: '/' }, { label: 'Admin Dashboard' }, { label: 'Users' }]} />

      <div className="flex flex-col gap-4 border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Admin Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-primary">Users</h1>
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users"
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/25 sm:w-80"
          />
        </label>
      </div>

      {(message || error) && (
        <div className={`border px-4 py-3 text-sm font-semibold ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-72 items-center justify-center text-sm font-bold text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading users
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Projects</th>
                  <th className="px-4 py-3">Teams</th>
                  <th className="px-4 py-3">Last Signed In</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{user.name || 'Unnamed user'}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{user.systemRole}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{user.projectCount}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{user.membershipCount}</td>
                    <td className={`px-4 py-3 font-semibold ${user.lastLoginAt ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                      {formatLastLogin(user.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => sendSetupEmail(user)}
                        disabled={Boolean(sendingId)}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-bold text-white hover:bg-[#001d3d] disabled:bg-slate-300"
                      >
                        {sendingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send setup email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
