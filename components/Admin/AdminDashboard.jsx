import React, { useState, useEffect, useCallback } from 'react';
import { FiLogOut, FiUser, FiUsers, FiUserCheck, FiUserPlus, FiBriefcase, FiCalendar, FiFilter, FiX, FiPhone } from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

const AdminDashboard = () => {
  const router = useRouter();
  const [tamu, setTamu] = useState([]);
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
  const [filter, setFilter] = useState('semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailStats, setShowDetailStats] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tamu?jenisTamu=${filter}&startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data');
      }
      const data = await response.json();
      setTamu(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Gagal mengambil statistik');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [filter, startDate, endDate, fetchData, fetchStats]);

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
    const tahun = date.getFullYear().toString().slice(-2);
    
    // Hitung sisa hari
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sisaHari = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    return {
      tanggalFormatted: `${hari} ${bulan} ${tahun}`,
      sisaHari: sisaHari
    };
  };

  const handleLogout = async () => {
    await signOut({ 
      redirect: false 
    });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <FiUsers className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 flex items-center gap-2"
        >
          <FiLogOut /> Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.hariIni.total === 0 ? (
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
                    (Lk: {stats.hariIni.menginap.wali.L}, Pr: {stats.hariIni.menginap.wali.P})
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
                    (Lk: {stats.hariIni.menginap.umum.individu.L}, Pr: {stats.hariIni.menginap.umum.individu.P})
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
                  <p className="text-xs opacity-75">Lk: {stats.hariIni.umum.lembaga.L}, Pr: {stats.hariIni.umum.lembaga.P}</p>
                </div>
                <p className="text-3xl font-bold">{stats.hariIni.umum.lembaga.total}</p>
              </div>
              {stats.hariIni.menginap.umum.lembaga.total > 0 && (
                <div className="mt-2 text-sm bg-yellow-700 px-2 py-1 rounded">
                  Termasuk {stats.hariIni.menginap.umum.lembaga.total} lembaga menginap
                  <div className="text-xs opacity-90">
                    ({stats.hariIni.menginap.umum.lembaga.jumlahOrang} orang)
                    <div className="text-xs">
                      Lk: {stats.hariIni.menginap.umum.lembaga.L}, Pr: {stats.hariIni.menginap.umum.lembaga.P}
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
          {stats.bulanIni.total === 0 ? (
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
                        Lk: {stats.bulanIni.umum.lembaga.L}, 
                        Pr: {stats.bulanIni.umum.lembaga.P}
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
        {stats.keperluan.length === 0 ? (
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
              {stats.keperluan.map(({ keperluan, jumlah, jumlahOrang }) => (
                <div key={keperluan} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition duration-200">
                  <span className="text-gray-700">{keperluan}</span>
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
        
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Jenis Tamu</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="semua">Semua</option>
              <option value="wali">Wali</option>
              <option value="umum">Umum</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
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
          <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                            className="h-10 w-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(item.fotoSelfi)}
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
                            href={`https://wa.me/${item.noKontak.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1 mt-1"
                          >
                            <FiPhone className="h-3 w-3" /> {item.noKontak}
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
                          ? `Lk:${item.jumlahLaki || '?'}, Pr:${item.jumlahPerempuan || '?'}`
                          : item.kelamin === 'L' 
                            ? 'Laki-laki' 
                            : 'Perempuan'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span>{item.keperluan}</span>
                          {item.keperluan.toLowerCase().includes('jenguk') && item.jenisTamu === 'wali' && (
                            <span className="text-xs text-gray-500 mt-1">
                              Wali dari: {item.waliDari || '-'}<br/>
                              Kelas: {item.kelas || '-'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.jenisKunjungan === 'lembaga' ? item.jumlahOrang : 1}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.menginap ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {(() => {
                              const { tanggalFormatted, sisaHari } = formatTanggalMenginap(item.tanggalKeluar);
                              return sisaHari > 0 
                                ? `Ya (s/d ${tanggalFormatted} • ${sisaHari} hari lagi)`
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      Tidak ada data tamu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity"
              onClick={() => setSelectedImage(null)}
            >
              <FiX className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Foto Selfi"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;