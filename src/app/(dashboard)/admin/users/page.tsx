import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import AdminUsersClient from '@/components/AdminUsersClient';
import { authOptions } from '@/lib/auth';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if ((session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminUsersClient />;
}
