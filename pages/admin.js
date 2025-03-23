import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useRef, useState, useEffect } from 'react';
import { FiLogOut, FiTrash2, FiUser, FiUsers, FiUserCheck, FiUserPlus, FiBriefcase, FiCalendar, FiFilter, FiX, FiPhone } from 'react-icons/fi';
import { signOut } from 'next-auth/react';

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
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this visitor?')) return;
    
    try {
      const res = await fetch(`/api/tamu/${id}/delete`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchData(currentPage, filter, startDate, endDate, selectedEvent);
        fetchStats();
      } else {
        const error = await res.json();
        alert(error.description || 'Failed to delete visitor');
      }
    } catch (error) {
      console.error('Error deleting visitor:', error);
      alert('Error deleting visitor');
    }
};
  const fetchData = (page = 1, filter = 'semua', startDate = null, endDate = null, eventId = null) => {
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
    if (eventId) {
      url += `&eventId=${eventId}`;
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
        if(!data.hariIni){
          throw Error(data);
        }
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
  const [filter, setFilter] = useState('semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDetailStats, setShowDetailStats] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [events, setEvents] = useState([]);
  const [panitiaEvents, setPanitiaEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  useEffect(() => {
    const fetchPanitiaEvents = async () => {
      if (session?.user?.role === 'PANITIA') {
        try {
          const res = await fetch('/api/events/panitia');
          const data = await res.json();
          setPanitiaEvents(data);
          if (data.length > 0) {
            setSelectedEvent(data[0].id.toString());
            fetchData(1, filter, startDate, endDate, data[0].id);
          }
        } catch (error) {
          console.error('Error fetching panitia events:', error);
        }
      }
    };
  
    if (session?.user?.role === 'PANITIA') {
      fetchPanitiaEvents();
    }
  }, [session]);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let timeoutId;
    
    const debouncedRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchStats();
      }, 300000);
    };

    debouncedRefresh();
    return () => clearTimeout(timeoutId);
  }, [fetchStats]);
  useEffect(() => {
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, [currentPage]);

  useEffect(() => {
    if (filter || startDate || endDate) {
      fetchData(1, filter, startDate, endDate);
    }
  }, [filter, startDate, endDate]);

  const formatWaktu = (timestamp) => {
    const now = new Date();
    const waktu = new Date(timestamp);
    const selisihDetik = Math.floor((now - waktu) / 1000);
    const selisihMenit = Math.floor(selisihDetik / 60);
    const selisihJam = Math.floor(selisihMenit / 60);
    const selisihHari = Math.floor(selisihJam / 24);

    const formatWaktuIndo = (date) => {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatTanggalIndo = (date) => {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    if (selisihDetik < 30) {
      return 'Baru saja';
    } else if (selisihMenit < 1) {
      return `${selisihDetik} detik yang lalu`;
    } else if (selisihMenit < 60) {
      return `${selisihMenit} menit yang lalu`;
    } else if (selisihHari < 1) {
      if (waktu.getDate() === now.getDate()) {
        return `Hari ini ${formatWaktuIndo(waktu)}`;
      }
      return `Kemarin ${formatWaktuIndo(waktu)}`;
    } else if (selisihHari === 1) {
      return `Kemarin ${formatWaktuIndo(waktu)}`;
    } else if (selisihHari < 7) {
      return `${selisihHari} hari yang lalu`;
    } else {
      return `${formatTanggalIndo(waktu)} ${formatWaktuIndo(waktu)}`;
    }
  };

  const formatTanggalMenginap = (tanggal) => {
    const date = new Date(tanggal);
    const bulan = date.toLocaleString('id-ID', { month: 'short' });
    const hari = date.getDate().toString().padStart(2, '0');
    const tahun = date.getFullYear().toString();
    const jam = date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }).replace(/\./g, ':').toUpperCase();
    
    const now = new Date();
    const checkoutDate = new Date(date);
    const sisaMilliseconds = checkoutDate - now;
    const sisaHari = Math.floor(sisaMilliseconds / (1000 * 60 * 60 * 24));
    const isToday = now.getDate() === checkoutDate.getDate() && 
                    now.getMonth() === checkoutDate.getMonth() && 
                    now.getFullYear() === checkoutDate.getFullYear();
    
    return {
      tanggalFormatted: isToday
        ? `Hari ini, ${jam}`
        : `${hari} ${bulan} ${tahun}, ${jam}`,
      sisaHari: sisaMilliseconds > 0 ? sisaHari : -1
    };
  };

  const handleLogout = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/admin/login'
    });
  };
  
  const Pagination = () => (
    <div className="mt-4 flex flex-wrap justify-center gap-2 px-4">
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 min-w-[80px]"
      >
        Previous
      </button>
      
      <div className="flex flex-wrap justify-center gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded min-w-[40px] ${
              currentPage === i + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {i + 1}
          </button>
        )).slice(
          Math.max(0, currentPage - 2),
          Math.min(totalPages, currentPage + 1)
        )}
      </div>

      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 min-w-[80px]"
      >
        Next
      </button>
    </div>
  );

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-lg shadow-md gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <FiUsers className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>
          <span className="text-gray-600 md:border-l-2 md:pl-4">
            Welcome, {session?.user?.name || 'Administrator'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {session?.user?.role === 'ADMIN' && (
            <Link href="/admin/users" className="flex-1 md:flex-none bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center gap-2">
              <FiUser /> <span>Users</span>
            </Link>
          )}
          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'HUMAS') && (
            <Link href="/admin/events" className="flex-1 md:flex-none bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 flex items-center justify-center gap-2">
              <FiCalendar /> <span>Events</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex-1 md:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 flex items-center justify-center gap-2"
          >
            <FiLogOut /> <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoadingStats ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                  <div className="h-4 w-32 bg-gray-300 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 w-16 bg-gray-300 rounded"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow-lg text-white">
              <div className="flex items-center gap-3 mb-2">
                <FiUsers className="text-2xl" />
                <h3 className="font-bold text-lg">Total Kunjungan Hari Ini</h3>
              </div>
              <p className="text-3xl font-bold">{stats.hariIni.total}</p>
              <p className="text-sm opacity-90">Total Orang: {stats.hariIni.totalOrang}</p>
              {stats.hariIni.menginap.total > 0 && (
                <p className="text-sm mt-2 bg-blue-700 px-2 py-1 rounded">
                  Termasuk {stats.hariIni.menginap.total} tamu menginap 
                  ({stats.hariIni.menginap.totalOrang} orang)
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg shadow-lg text-white">
              <div className="flex items-center gap-3 mb-2">
                <FiUserCheck className="text-2xl" />
                <h3 className="font-bold text-lg">Tamu Wali</h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm opacity-90">Laki-laki: {stats.hariIni.wali.L}</p>
                  <p className="text-sm opacity-90">Perempuan: {stats.hariIni.wali.P}</p>
                </div>
                <p className="text-3xl font-bold">{stats.hariIni.wali.total}</p>
              </div>
              {stats.hariIni.menginap.wali.total > 0 && (
                <div className="mt-2 text-sm bg-green-700 px-2 py-1 rounded">
                  Termasuk {stats.hariIni.menginap.wali.total} tamu menginap
                  <div className="text-xs opacity-90">
                    {[ stats.hariIni.menginap.wali.L && `Lk:${stats.hariIni.menginap.wali.L}`, stats.hariIni.menginap.wali.P && `Pr:${stats.hariIni.menginap.wali.P}` ] .filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg shadow-lg text-white">
              <div className="flex items-center gap-3 mb-2">
                <FiUserPlus className="text-2xl" />
                <h3 className="font-bold text-lg">Tamu Umum (Individu)</h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm opacity-90">Laki-laki: {stats.hariIni.umum.individu.L}</p>
                  <p className="text-sm opacity-90">Perempuan: {stats.hariIni.umum.individu.P}</p>
                </div>
                <p className="text-3xl font-bold">{stats.hariIni.umum.individu.total}</p>
              </div>
              {stats.hariIni.menginap.umum.individu.total > 0 && (
                <div className="mt-2 text-sm bg-purple-700 px-2 py-1 rounded">
                  Termasuk {stats.hariIni.menginap.umum.individu.total} tamu menginap
                  <div className="text-xs opacity-90">
                    {[ stats.hariIni.menginap.umum.individu.L && `Lk:${stats.hariIni.menginap.umum.individu.L}`, stats.hariIni.menginap.umum.individu.P && `Pr:${stats.hariIni.menginap.umum.individu.P}` ] .filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg shadow-lg text-white">
              <div className="flex items-center gap-3 mb-2">
                <FiBriefcase className="text-2xl" />
                <h3 className="font-bold text-lg">Tamu Lembaga</h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm opacity-90">Kunjungan: {stats.hariIni.umum.lembaga.total}</p>
                  <p className="text-sm opacity-90">Jumlah: {stats.hariIni.umum.lembaga.jumlahOrang}</p>
                  <p className="text-xs opacity-75">
                    {[ stats.hariIni.umum.lembaga.L && `Lk:${stats.hariIni.umum.lembaga.L}`, stats.hariIni.umum.lembaga.P && `Pr:${stats.hariIni.umum.lembaga.P}` ] .filter(Boolean).join(', ')}
                  </p>
                </div>
                <p className="text-3xl font-bold">{stats.hariIni.umum.lembaga.total}</p>
              </div>
              {stats.hariIni.menginap.umum.lembaga.total > 0 && (
                <div className="mt-2 text-sm bg-yellow-700 px-2 py-1 rounded">
                  Termasuk {stats.hariIni.menginap.umum.lembaga.total} lembaga menginap
                  <div className="text-xs opacity-90">
                    ({stats.hariIni.menginap.umum.lembaga.jumlahOrang} orang)
                    <div className="text-xs">
                      {[ stats.hariIni.menginap.umum.lembaga.L && `Lk:${stats.hariIni.menginap.umum.lembaga.L}`, stats.hariIni.menginap.umum.lembaga.P && `Pr:${stats.hariIni.menginap.umum.lembaga.P}` ] .filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>          
          </>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          {isLoadingStats ? (
            <div className="animate-pulse bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                  <div className="h-4 w-32 bg-gray-300 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="h-8 w-16 bg-gray-300 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 rounded-lg shadow-lg text-white">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <FiUsers className="text-2xl" />
                    <h3 className="font-bold text-lg">Total Bulan Ini</h3>
                  </div>
                  <button
                    onClick={() => setShowDetailStats(!showDetailStats)}
                    className="text-white hover:text-indigo-200 transition-colors"
                  >
                    {showDetailStats ? 'Sembunyikan Detail' : 'Lihat Detail'}
                  </button>
                </div>
                <p className="text-3xl font-bold">{stats.bulanIni.total}</p>
                <p className="text-sm opacity-90">Total Orang: {stats.bulanIni.totalOrang}</p>
              </div>

              {/* Detail Statistik */}
              {showDetailStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Tamu Wali */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <FiUserCheck className="text-xl" />
                      <h4 className="font-bold">Tamu Wali</h4>
                    </div>
                    <p className="text-2xl font-bold">{stats.bulanIni.wali.total}</p>
                    <div className="text-sm opacity-90">
                      <p>Laki-laki: {stats.bulanIni.wali.L}</p>
                      <p>Perempuan: {stats.bulanIni.wali.P}</p>
                    </div>
                  </div>

                  {/* Tamu Umum Individu */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <FiUserPlus className="text-xl" />
                      <h4 className="font-bold">Tamu Umum (Individu)</h4>
                    </div>
                    <p className="text-2xl font-bold">{stats.bulanIni.umum.individu.total}</p>
                    <div className="text-sm opacity-90">
                      <p>Laki-laki: {stats.bulanIni.umum.individu.L}</p>
                      <p>Perempuan: {stats.bulanIni.umum.individu.P}</p>
                    </div>
                  </div>

                  {/* Tamu Lembaga */}
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <FiBriefcase className="text-xl" />
                      <h4 className="font-bold">Tamu Lembaga</h4>
                    </div>
                    <p className="text-2xl font-bold">{stats.bulanIni.umum.lembaga.total}</p>
                    <div className="text-sm opacity-90">
                      <p>Jumlah Orang: {stats.bulanIni.umum.lembaga.jumlahOrang}</p>
                      <p className="text-xs">
                        {[ stats.bulanIni.umum.lembaga.L && `Lk:${stats.bulanIni.umum.lembaga.L}`, stats.bulanIni.umum.lembaga.P && `Pr:${stats.bulanIni.umum.lembaga.P}` ] .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-6 backdrop-blur-lg bg-opacity-90">
        { isLoadingStats ? (
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
              <div className="h-4 w-48 bg-gray-300 rounded"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3">
                <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <FiFilter className="text-xl text-blue-600" />
              <h3 className="font-bold text-lg text-gray-800">Keperluan Tamu Hari Ini</h3>
            </div>
            <div className="space-y-3">
              {stats.keperluan.map(({ keperluan, jumlah, jumlahOrang, eventName, eventId }) => (
                <div key={keperluan} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition duration-200">
                  <div className="flex flex-col">
                    <span className="text-gray-700">{keperluan}</span>
                    {eventName && (
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                        Event: {eventName}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-600">{jumlah} kunjungan</span>
                    {jumlahOrang > jumlah && (
                      <span className="text-sm text-gray-500 block">
                        ({jumlahOrang} orang)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg backdrop-blur-lg bg-opacity-90">
        <div className="flex items-center gap-3 mb-4">
          <FiCalendar className="text-xl text-blue-600" />
          <h3 className="font-bold text-lg text-gray-800">Daftar Tamu</h3>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Jenis Tamu</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="semua">Semua</option>
              <option value="lembaga">Lembaga</option>
              <option value="wali">Wali</option>
              <option value="umum">Umum</option>
            </select>
          </div>

          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'HUMAS') ? (
            events.length > 0 && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Event</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => {
                    setSelectedEvent(e.target.value);
                    fetchData(1, filter, startDate, endDate, e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
            )
          ) : (
            panitiaEvents.length > 0 && (
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Anda</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => {
                    setSelectedEvent(e.target.value);
                    fetchData(1, filter, startDate, endDate, e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {panitiaEvents.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>
            )
          )}

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg flex items-center space-x-4 p-4">
                  <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 -mx-6 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelamin</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keperluan</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menginap</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                    {session.user?.role === 'ADMIN' && (
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tamu.length > 0 ? (
                      tamu.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.fotoSelfi ? (
                            <img
                              src={item.fotoSelfi}
                              alt="Foto Selfi"
                              className="h-10 w-10 max-w-none rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={async () => {
                                if (item.fotoSelfi) {
                                  setIsLoadingPhoto(true);
                                  try {
                                      setSelectedPhoto(item.fotoSelfi);
                                  } catch (error) {
                                    console.error('Error:', error);
                                  } finally {
                                    setIsLoadingPhoto(false);
                                  }
                                }
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://www.gravatar.com/avatar/?d=mp";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.nama}</span>
                            <a
                              href={`https://wa.me/${item.noKontak.replace(/^0/, '62').replace(/^\+?620/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1 mt-1"
                            >
                              <FiPhone className="h-3 w-3" /> {item.noKontak.replace(/^0/, '+62').replace(/^\+?620?/, '+62')}
                            </a>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.jenisTamu === 'wali' 
                              ? 'bg-green-100 text-green-800'
                              : item.jenisKunjungan === 'lembaga'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.jenisTamu === 'wali' 
                              ? 'Wali' 
                              : item.jenisKunjungan === 'lembaga' 
                                ? 'Lembaga' 
                                : 'Umum'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.kelamin === 'G' 
                            ? [ item.jumlahLaki && `Lk:${item.jumlahLaki}`, item.jumlahPerempuan && `Pr:${item.jumlahPerempuan}` ] .filter(Boolean).join(', ')
                            : item.kelamin === 'L' 
                              ? 'Laki-laki' 
                              : 'Perempuan'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm">{item.keperluan}</span>
                            { item.jenisTamu === 'wali' && (
                              <span className="text-xs text-gray-500">
                                Wali: {item.waliDari || '-'} • Kelas: {item.kelas || '-'}
                              </span>
                            )}
                            {item.eventId && (
                              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                                Event: {item.event?.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.jenisKunjungan === 'lembaga' ? item.jumlahOrang : 1}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {item.menginap ? (
                            <span
                              className={`
                                px-2 py-1 rounded-full text-xs font-medium
                                ${(() => {
                                  const { sisaHari } = formatTanggalMenginap(item.tanggalKeluar);
                                  if (sisaHari > 0) {
                                    return 'bg-purple-100 text-purple-800';
                                  } else if (sisaHari === 0) {
                                    return 'bg-purple-100 text-purple-800';
                                  } else {
                                    return 'bg-red-100 text-red-800';
                                  }
                                })()}
                              `}
                            >                              
                              {(() => {
                                  const { tanggalFormatted, sisaHari } = formatTanggalMenginap(item.tanggalKeluar);
                                  return sisaHari > 0 
                                    ? `Ya (s/d ${tanggalFormatted} • ${sisaHari} hari lagi)` 
                                    : sisaHari === 0
                                      ? `Ya (s/d ${tanggalFormatted})`
                                      : `Ya (s/d ${tanggalFormatted} • sudah lewat)`;
                              })()}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Tidak
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                          {formatWaktu(item.createdAt)}
                        </td>
                        
                        {session.user?.role === 'ADMIN' && (
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-gray-500">
                        Tidak ada data tamu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Pagination />

      {/* Image Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity"
              onClick={() => setSelectedPhoto(null)}
            >
              <FiX className="h-6 w-6" />
            </button>
            {isLoadingPhoto ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            ) : (
              <img
                src={selectedPhoto}
                className="w-full h-full object-contain"
                alt="Foto Selfi"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.gravatar.com/avatar/?d=mp&s=360";
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}