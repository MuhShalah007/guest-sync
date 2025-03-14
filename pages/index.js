import React, { useState } from 'react';
import GuestForm from '../components/GuestForm';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiUsers, FiUserCheck, FiLogIn } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const [jenisTamu, setJenisTamu] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    noKontak: '',
    asal: '',
    kelamin: '',
    keperluan: '',
    fotoSelfi: '',
    waliDari: '',
    kelas: '',
    jenisKunjungan: '',
    namaLembaga: '',
    jumlahOrang: '',
    jumlahLaki: '',
    jumlahPerempuan: '',
    menginap: false,
    tanggalKeluar: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!formData.nama || !formData.noKontak || !formData.keperluan) {
        alert('Mohon lengkapi data wajib!');
        setIsLoading(false);
        return;
      }

      if (jenisTamu === 'wali' && (!formData.waliDari || !formData.kelas)) {
        alert('Mohon lengkapi data wali!');
        setIsLoading(false);
        return;
      }

      if (jenisTamu === 'umum' && !formData.jenisKunjungan) {
        alert('Mohon pilih jenis kunjungan!');
        setIsLoading(false);
        return;
      }

      if (formData.jenisKunjungan === 'lembaga' && (!formData.namaLembaga || !formData.jumlahOrang)) {
        alert('Mohon lengkapi data lembaga!');
        setIsLoading(false);
        return;
      }

      const dataToSave = {
        jenisTamu,
        nama: formData.nama,
        noKontak: formData.noKontak,
        asal: formData.asal,
        keperluan: formData.keperluan,
        fotoSelfi: formData.fotoSelfi,
        kelamin: formData.kelamin || 'L',
        menginap: formData.menginap || false
      };
      
      if (formData.menginap && formData.tanggalKeluar) {
        dataToSave.tanggalKeluar = new Date(formData.tanggalKeluar);
      }

      if (jenisTamu === 'wali') {
        dataToSave.waliDari = formData.waliDari;
        dataToSave.kelas = formData.kelas;
      }

      if (jenisTamu === 'umum') {
        dataToSave.jenisKunjungan = formData.jenisKunjungan;
        
        if (formData.jenisKunjungan === 'lembaga') {
          dataToSave.namaLembaga = formData.namaLembaga;
          dataToSave.jumlahOrang = parseInt(formData.jumlahOrang) || 1;
          dataToSave.kelamin = 'G';
          dataToSave.jumlahLaki = parseInt(formData.jumlahLaki) || 0;
          dataToSave.jumlahPerempuan = parseInt(formData.jumlahPerempuan) || 0;
        }
      }

      const response = await fetch('/api/tamu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });
      
      if (!response.ok) {
        throw new Error('Gagal menyimpan data');
      }
      
      const result = await response.json();
      console.log('Data berhasil disimpan:', result);
      alert('Data berhasil disimpan!');

      setFormData({
        nama: '',
        noKontak: '',
        asal: '',
        kelamin: '',
        keperluan: '',
        fotoSelfi: '',
        waliDari: '',
        kelas: '',
        jenisKunjungan: '',
        namaLembaga: '',
        jumlahOrang: '',
        jumlahLaki: '',
        jumlahPerempuan: '',
        menginap: false,
        tanggalKeluar: ''
      });
      setJenisTamu('');

    } catch (error) {
      console.error('Error saat menyimpan data:', error);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="text-right mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-md text-blue-600 hover:bg-blue-50 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiLogIn className="mr-2" />
            Admin Login
          </motion.button>
        </motion.div>

        <motion.h1 
          className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 leading-normal"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Ahlan Wa Sahlan, <br/> di Pondok Pesantren Islam <br/> Darusy Syahadah
        </motion.h1>
        
        {!jenisTamu ? (
          <motion.div 
            className="max-w-md mx-auto space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl text-center mb-6 text-gray-700">
              Saya adalah:
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <motion.button
                onClick={() => setJenisTamu('umum')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUsers className="text-3xl mb-3" />
                <span className="font-medium">Tamu Umum</span>
                <span className="text-sm mt-2 text-blue-100">
                  Pengunjung perorangan atau rombongan
                </span>
              </motion.button>
              <motion.button
                onClick={() => setJenisTamu('wali')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUserCheck className="text-3xl mb-3" />
                <span className="font-medium">Tamu Wali</span>
                <span className="text-sm mt-2 text-green-100">
                  Wali santri/siswa yang berkunjung
                </span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GuestForm
              jenisTamu={jenisTamu}
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => {
                setJenisTamu(''); 
                setFormData({
                  nama: '',
                  noKontak: '',
                  asal: '',
                  kelamin: '',
                  keperluan: '',
                  fotoSelfi: '',
                  waliDari: '',
                  kelas: '',
                  jenisKunjungan: '',
                  namaLembaga: '',
                  jumlahOrang: '',
                  jumlahLaki: '',
                  jumlahPerempuan: '',
                  menginap: false,
                  tanggalKeluar: ''
                });
              }}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
} 