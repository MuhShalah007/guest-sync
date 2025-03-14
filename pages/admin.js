import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import AdminDashboard from '../components/Admin/AdminDashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <AdminDashboard />;
} 