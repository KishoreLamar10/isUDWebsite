import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import AdminProjectApprovalsClient from '@/components/AdminProjectApprovalsClient';
import { authOptions } from '@/lib/auth';

export default async function ProjectApprovalsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if ((session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminProjectApprovalsClient />;
}
