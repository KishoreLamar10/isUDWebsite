import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import AdminEditSolutionsClient from '@/components/AdminEditSolutionsClient';
import { authOptions } from '@/lib/auth';

export default async function EditSolutionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if ((session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminEditSolutionsClient />;
}
