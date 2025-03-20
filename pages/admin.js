import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import AdminDashboard from '../components/Admin/AdminDashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasFetched = useRef(false);

  const [tamu, setTamu] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    hariIni: {
      total: 0,
      totalOrang: 0,
      wali: { L: 0, P: 0, total: 0 },
      umum: { 
        individu: { L: 0, P: 0, total: 0 },
        lembaga: { L: 0, P: 0, total: 0, jumlahOrang: 0 }
      },
      menginap: {
        total: 0,
        totalOrang: 0,
        wali: { L: 0, P: 0, total: 0 },
        umum: {
          individu: { L: 0, P: 0, total: 0 },
          lembaga: { L: 0, P: 0, total: 0, jumlahOrang: 0 }
        }
      }
    },
    bulanIni: {
      total: 0,
      totalOrang: 0,
      wali: { L: 0, P: 0, total: 0 },
      umum: {
        individu: { L: 0, P: 0, total: 0 },
        lembaga: { L: 0, P: 0, total: 0, jumlahOrang: 0 }
      }
    },
    keperluan: [],
    total: {
      kunjungan: 0,
      jumlahOrang: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const fetchData = (page = 1, filter = 'semua', startDate = null, endDate = null) => {
    setIsLoading(true);
    let url = `/api/tamu?page=${page}&limit=20`;
    
    if (filter !== 'semua') {
      url += `&jenisTamu=${filter}`;
    }
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setTamu(data.data);
        setTotalPages(data.pagination.totalPages);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const fetchStats = () => {
    setIsLoadingStats(true);
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setIsLoadingStats(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoadingStats(false);
      });
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && !hasFetched.current) {
      fetchStats();
      fetchData(currentPage);
      hasFetched.current = true;
    }
  }, [status, currentPage, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard</h2>
          <p className="text-gray-500">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;
  return (
    <AdminDashboard
      session={session}
      tamu={tamu}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalPages={totalPages}
      stats={stats}
      isLoading={isLoading}
      isLoadingStats={isLoadingStats}
      fetchData={fetchData}
      fetchStats={fetchStats}
    />
  );
}