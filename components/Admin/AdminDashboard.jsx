import Link from 'next/link';
import React, { useRef, useState, useEffect } from 'react';
import { FiLogOut, FiUser, FiUsers, FiUserCheck, FiUserPlus, FiBriefcase, FiCalendar, FiFilter, FiX, FiPhone } from 'react-icons/fi';
import { signOut } from 'next-auth/react';

const AdminDashboard = ({ session, tamu, currentPage, setCurrentPage, totalPages, stats, isLoading, isLoadingStats, fetchData, fetchStats }) => {
  const [filter, setFilter] = useState('semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDetailStats, setShowDetailStats] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  useEffect(() => {
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, [currentPage]);

  useEffect(() => {
    if (filter || startDate || endDate) {
      fetchData(1, filter, startDate, endDate); // Reset ke halaman pertama saat filter berubah
    }
  }, [filter, startDate, endDate]);

  const formatWaktu = (timestamp) => {
    const now = new Date();
    const waktu = new Date(timestamp);
    const selisihDetik = Math.floor((now - waktu) / 1000);
    const selisihMenit = Math.floor(selisihDetik / 60);
    const selisihJam = Math.floor(selisihMenit / 60);
    const selisihHari = Math.floor(selisihJam / 24);

    // Format waktu Indonesia
    const formatWaktuIndo = (date) => {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Format tanggal Indonesia
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
    
    // Hitung sisa waktu dengan mempertahankan jam
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
      sisaHari: sisaMilliseconds > 0 ? sisaHari : -1 // Return -1 if time has passed
    };
  };

  const handleLogout = async () => {
    await signOut({ 
      redirect: true,
      callbackUrl: '/admin/login'
    });
  };

  // Pagination controls
  const Pagination = () => (
    <div className="mt-4 flex justify-center gap-2">
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Previous
      </button>
      
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {i + 1}
        </button>
      )).slice(
        Math.max(0, currentPage - 3),
        Math.min(totalPages, currentPage + 2)
      )}

      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      // Update the header section to be more responsive
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

      // Update the table to be more responsive
      <div className="overflow-x-auto rounded-lg border border-gray-200 -mx-6 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... table header ... */}
            <tbody className="bg-white divide-y divide-gray-200">
              {tamu.length > 0 ? (
                tamu.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                    {/* ... other cells ... */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm">{item.keperluan}</span>
                        {item.keperluan.toLowerCase().includes('jenguk') && item.jenisTamu === 'wali' && (
                          <span className="text-xs text-gray-500">
                            Wali: {item.waliDari || '-'} • Kelas: {item.kelas || '-'}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* ... other cells ... */}
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

      // Update the filter section to be more responsive
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      // Update the pagination to be more responsive
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
    </div>
  );
};

export default AdminDashboard;