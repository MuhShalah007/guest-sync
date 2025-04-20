import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import { FiX, FiUserCheck, FiLoader, FiUser, FiUsers, FiLogOut, FiBriefcase, FiCalendar, FiUserPlus } from 'react-icons/fi';
import { AiOutlineUser, AiOutlineBook, AiOutlineEnvironment, AiOutlineMan, AiOutlineWoman } from "react-icons/ai";
import DatePicker from 'react-datepicker';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function Home() {
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [jenisTamu, setJenisTamu] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
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
  const [successData, setSuccessData] = useState(formData);
  const onCancel = () => {
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
      eventId: null,
      tanggalKeluar: ''
    })
  };

  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?active=true', {
          signal: abortController.signal
        });
        const data = await response.json();
        const eventsArray = Array.isArray(data) ? data : [];
        
        setEvents(eventsArray.filter(event => {
          const eventDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);
          const today = new Date();
          const tomorrow = eventDate.setDate(today.getDate() + 1);
          return tomorrow >= today || endDate >= today;
        }));
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching events:', error);
        }
      }
    };

    fetchEvents();

    return () => {
      abortController.abort();
    };
  }, []);
      
  // Render success card with Framer Motion
  const SuccessCard = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="relative">
          <motion.button
            onClick={() => {
              setShowSuccessCard(false);
              setJenisTamu('');
            }}
            className="absolute -left-2 -top-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.3
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-500/30"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.img
                src={successData.fotoSelfi}
                alt="Foto Tamu"
                className="w-full h-full object-cover relative z-10"
                initial={{ scale: 1.2, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.4
                }}
                whileHover={{ scale: 1.1 }}
              />
            </motion.div>
            
            <motion.h3 
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Ahlan wa Sahlan wa Marhaban, {successData.nama}! Semoga Allah Subhanahu wa Ta'ala Memberkahi Kunjungan Anda
            </motion.h3>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-green-800 mb-3">Silakan tunjukkan halaman ini ke petugas/satpam untuk membuktikan bahwa Anda sudah mengisi formulir dengan lengkap:</p>
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 bg-white p-3 rounded-lg shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <motion.img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DS${String(successData.id).padStart(6, '0')}`}
                alt="QR Code"
                className="w-32 h-32"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.7,
                  type: "spring",
                  stiffness: 200
                }}
              />
              <motion.p 
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Kode Unik: {`DS${String(successData.id).padStart(6, '0')}`}
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );

  const onSubmit = async (e) => {
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
        noKontak: formData.noKontak.replace(/^0/, '62').replace(/^\+?620/, '62'),
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan data');
      }
      
      const result = await response.json();
      console.log('Data berhasil disimpan:', result);
      
      setSuccessData(result);
      setShowSuccessCard(true);

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
  const [showCamera, setShowCamera] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });  
  const [imageSize, setImageSize] = useState(0);
  const webcamRef = useRef(null);
  const [jumlahLaki, setJumlahLaki] = useState(0);
  const [jumlahPerempuan, setJumlahPerempuan] = useState(0);
  const [validasiJumlah, setValidasiJumlah] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('keperluan');

  useEffect(() => {
    document.body.style.backgroundColor = '#f7f9fc';
    
    setFormData(prev => ({
      ...prev,
      jenisKunjungan: 'individu'
    }));
    
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [setFormData]);

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([uintArray], { type: 'image/jpeg' });
  };

  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2);
  };

  const handleDateChange = useCallback((date) => {
    setFormData(prev => ({
      ...prev,
      tanggalKeluar: date
    }));
  }, [setFormData]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
  }
  const handleReloadWebcam = async(e) => {
    setShowCamera(true);
    const fileName = formData.fotoSelfi.split('/').pop();
    const response = await fetch(`/api/upload/delete?filename=${fileName}`, {method: 'DELETE'});

    const result = await response.json();
    
    if (result.ok) {
      console.log('File uploaded successfully:', result.result);
    } else {
      console.error('Upload failed:', result.result);
    }
  }

  const handleCapture = useCallback(async () => {
    try {
      let imageSrc = webcamRef.current.getScreenshot({
        width: 720,
        height: 1280,
        quality: 0.8
      });
      if (!imageSrc) {
        throw new Error('Gagal mengambil foto');
      }
      const file = dataURItoBlob(imageSrc);
      setImageSize(file.size);
      setFormData(prev => ({
        ...prev,
        fotoSelfi: imageSrc
      }));
      setShowCamera(false);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.ok) {
        setFormData(prev => ({
          ...prev,
          fotoSelfi: result.result
        }));
      } else {
        console.error('Upload failed:', result.result);
      }
    } catch (error) {
      alert('Gagal mengambil foto. Pastikan kamera sudah diizinkan.');
      console.error('Error capturing photo:', error);
    }
}, [setFormData, webcamRef]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'jumlahOrang' && value === '1' && formData.kelamin) {
      if (formData.kelamin === 'L') {
        setJumlahLaki(1);
        setJumlahPerempuan(0);
        setFormData(prev => ({
          ...prev,
          jumlahLaki: 1,
          jumlahPerempuan: 0
        }));
      } else {
        setJumlahLaki(0);
        setJumlahPerempuan(1);
        setFormData(prev => ({
          ...prev,
          jumlahLaki: 0,
          jumlahPerempuan: 1
        }));
      }
      setValidasiJumlah(true);
      return;
    }

    if (name === 'nama' && !value.includes(' ') && formData.kelamin) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    if (name === 'jumlahOrang' && formData.jenisKunjungan === 'lembaga') {
      const total = parseInt(value) || 0;
      if (total < (jumlahLaki + jumlahPerempuan)) {
        setJumlahLaki(Math.floor(total / 2));
        setJumlahPerempuan(Math.ceil(total / 2));
      }
      validateJumlahOrang(jumlahLaki, jumlahPerempuan, total);
    }
  }, [formData, jumlahLaki, jumlahPerempuan, setFormData]);

  const handleJenisKunjungan = useCallback((jenis) => {
    setFormData(prev => ({
      ...prev,
      jenisKunjungan: jenis,
      namaLembaga: '',
      jumlahOrang: ''
    }));
    if (jenis === 'individu') {
      setJumlahLaki(0);
      setJumlahPerempuan(0);
    }
  }, [setFormData]);

  const handleJumlahKelamin = (jenis, value) => {
    const jumlah = parseInt(value) || 0;
    const totalOrang = parseInt(formData.jumlahOrang) || 0;
    
    if (jenis === 'L') {
      setJumlahLaki(jumlah);
      setFormData({
        ...formData,
        jumlahLaki: jumlah
      });
      validateJumlahOrang(jumlah, jumlahPerempuan, totalOrang);
    } else {
      setJumlahPerempuan(jumlah);
      setFormData({
        ...formData,
        jumlahPerempuan: jumlah
      });
      validateJumlahOrang(jumlahLaki, jumlah, totalOrang);
    }
  };

  const validateJumlahOrang = (laki, perempuan, total) => {
    const jumlahTotal = laki + perempuan;
    setValidasiJumlah(jumlahTotal === total);
  };

  const getSuggestedTitle = () => {
    if (!formData.nama || formData.nama.includes(' ')) return [];
    
    if (formData.kelamin === 'L') {
      return ['Bapak', 'Pak', 'Sdr.', 'Mas'];
    } else if (formData.kelamin === 'P') {
      return ['Ibu', 'Bu', 'Sdri.', 'Ny.', 'Mbk'];
    }
    return [];
  };

  const applyNameSuggestion = (prefix) => {
    setFormData({
      ...formData,
      nama: `${prefix} ${formData.nama}`
    });
    setShowSuggestions(false);
  };

  return (
  <>
  {showSuccessCard && <SuccessCard />}
  <style jsx>{`
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes dash {
      to {
        stroke-dashoffset: -30;
      }
    }
    .animate-spin-slow {
      animation: spin-slow 8s linear infinite;
    }
    .animate-dash {
      animation: dash 1.5s linear infinite;
      `}</style>
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">

        <motion.h1 
          className="text-2xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 leading-normal py-2"
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
            {/* GuestForm */}            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md mx-auto px-4 sm:px-6"
            >
              <motion.form 
                onSubmit={onSubmit} 
                className="w-full space-y-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h2 
                  className="text-2xl font-bold text-center mb-4 sm:mb-6 text-indigo-700"
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {jenisTamu === 'wali' ? 'Form Tamu Wali' : 'Form Tamu Umum'}
                </motion.h2>
                <div className="space-y-4">
                  {/* Jenis Kelamin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex space-x-4">
                      <motion.div 
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          formData.kelamin === 'L' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700' 
                            : 'bg-white border-gray-300 hover:bg-gray-50'
                        } transition-all duration-200`}>
                          <input
                            type="radio"
                            name="kelamin"
                            value="L"
                            checked={formData.kelamin === 'L'}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <AiOutlineMan className="h-5 w-5 mr-2 text-blue-500" />
                          <span>Laki-laki</span>
                        </label>
                      </motion.div>
                      
                      <motion.div 
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                          formData.kelamin === 'P' 
                            ? 'bg-pink-50 border-pink-500 text-pink-700' 
                            : 'bg-white border-gray-300 hover:bg-gray-50'
                        } transition-all duration-200`}>
                          <input
                            type="radio"
                            name="kelamin"
                            value="P"
                            checked={formData.kelamin === 'P'}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <AiOutlineWoman className="h-5 w-5 mr-2 text-pink-500" />
                          <span>Perempuan</span>
                        </label>
                      </motion.div>
                    </div>
                  </div>
                  {/* Nama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    
                    {showSuggestions && getSuggestedTitle().length > 0 && (
                      <motion.div 
                        className="mt-2 flex flex-wrap gap-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-xs text-gray-500">Tambahkan:</span>
                        {getSuggestedTitle().map((title, index) => (
                          <motion.button
                            key={index}
                            type="button"
                            onClick={() => applyNameSuggestion(title)}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {title}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                  {/* No. Kontak */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Kontak <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <PhoneInput
                        name="noKontak"
                        country={'id'}
                        value={formData.noKontak}
                        onChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            noKontak: value
                          }))
                        }}
                        inputClass="w-full outline-none p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        containerClass="phone-input"
                        buttonClass="border-0 bg-transparent hover:bg-gray-100 transition-all duration-200"
                        dropdownClass="bg-white border border-gray-200 rounded-lg shadow-lg"
                        searchClass="p-2 border-b border-gray-200"
                        placeholder="Nomor telepon/WA"
                        required
                      />
                    </div>
                  </div>

                  {/* Asal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asal <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <AiOutlineEnvironment className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="asal"
                        value={formData.asal}
                        onChange={handleChange}
                        className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Kota/Instansi asal"
                        required
                      />
                    </div>
                  </div>

                  {/* Fields khusus untuk Tamu Wali */}
                  {jenisTamu === 'wali' && (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Wali Dari <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <AiOutlineBook className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="waliDari"
                            value={formData.waliDari}
                            onChange={handleChange}
                            className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Nama santri/siswa"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kelas <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <AiOutlineBook className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="kelas"
                            value={formData.kelas}
                            onChange={handleChange}
                            className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Kelas/tingkat"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Fields khusus untuk Tamu Umum */}
                  {jenisTamu === 'umum' && (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jenis Kunjungan <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            type="button"
                            onClick={() => handleJenisKunjungan('individu')}
                            className={`flex items-center justify-center p-3 rounded-lg border ${
                              formData.jenisKunjungan === 'individu' || !formData.jenisKunjungan
                                ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            } transition-all duration-200`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiUser className="h-5 w-5 mr-2" />
                            Individu
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => handleJenisKunjungan('lembaga')}
                            className={`flex items-center justify-center p-3 rounded-lg border ${
                              formData.jenisKunjungan === 'lembaga'
                                ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            } transition-all duration-200`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiUsers className="h-5 w-5 mr-2" />
                            Lembaga
                          </motion.button>
                        </div>
                      </div>

                      {formData.jenisKunjungan === 'lembaga' && (
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama Lembaga <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FiBriefcase className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="namaLembaga"
                                value={formData.namaLembaga}
                                onChange={handleChange}
                                className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Nama Lembaga/Instansi"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Jumlah Orang <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                {parseInt(formData.jumlahOrang) > 1 ? (
                                  <FiUsers  className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <AiOutlineUser className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <input
                                type="number"
                                name="jumlahOrang"
                                value={formData.jumlahOrang}
                                onChange={handleChange}
                                min="1"
                                className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Jumlah orang"
                                required
                              />
                            </div>
                          </div>
                          
                          {formData.jumlahOrang && parseInt(formData.jumlahOrang) > 1 && (
                            <motion.div 
                              className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <label className="block text-sm font-medium text-gray-700">
                                Rincian Jumlah Berdasarkan Jenis Kelamin <span className="text-red-500 ml-1">*</span>
                              </label>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1 flex items-center">
                                    <AiOutlineMan className="h-4 w-4 mr-1 text-blue-500" />
                                    Laki-laki
                                  </label>
                                  <input
                                    type="number"
                                    value={jumlahLaki}
                                    onChange={(e) => handleJumlahKelamin('L', e.target.value)}
                                    min="0"
                                    max={formData.jumlahOrang}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1 flex items-center">
                                    <AiOutlineWoman className="h-4 w-4 mr-1 text-pink-500" />
                                    Perempuan
                                  </label>
                                  <input
                                    type="number"
                                    value={jumlahPerempuan}
                                    onChange={(e) => handleJumlahKelamin('P', e.target.value)}
                                    min="0"
                                    max={formData.jumlahOrang}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  />
                                </div>
                              </div>
                          
                              {!validasiJumlah && (
                                <p className="text-red-500 text-sm">
                                  Total jumlah laki-laki dan perempuan harus sama dengan jumlah orang ({formData.jumlahOrang})
                                </p>
                              )}
                          
                              <div className="text-sm text-gray-600">
                                Total: {jumlahLaki + jumlahPerempuan} dari {formData.jumlahOrang} orang
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                  {/* Keperluan */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative flex space-x-1 before:absolute before:bottom-0 before:w-full before:h-[1px] before:bg-gray-200">
                      <button
                        type="button"
                        onClick={() => setActiveTab('keperluan')}
                        className={`
                          relative py-2 px-6
                          before:absolute before:left-0 before:right-0 before:top-0 before:bottom-0
                          before:skew-x-[20deg] before:border before:border-gray-200
                          before:transition-colors before:duration-200
                          ${activeTab === 'keperluan' 
                            ? 'text-blue-600 before:bg-white before:border-b-0'
                            : 'text-gray-500 hover:text-gray-700 before:bg-gray-50'
                          }
                        `}
                      >
                        <span className="relative z-10">Keperluan Umum</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('acara')}
                        className={`
                          relative py-2 px-6
                          before:absolute before:left-0 before:right-0 before:top-0 before:bottom-0
                          before:skew-x-[20deg] before:border before:border-gray-200
                          before:transition-colors before:duration-200
                          ${activeTab === 'acara'
                            ? 'text-blue-600 before:bg-white before:border-b-0'
                            : 'text-gray-500 hover:text-gray-700 before:bg-gray-50'
                          }
                        `}
                      >
                        <span className="relative z-10">Acara</span>
                      </button>
                    </div>
                    <div className="p-4 border border-t-0 rounded-b-lg bg-white">
                      {activeTab === 'keperluan' ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Keperluan <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="keperluan"
                            value={formData.keperluan}
                            onChange={handleChange}
                            className="w-full outline-none p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            placeholder="Tuliskan keperluan kunjungan Anda..."
                            required={!formData.eventId}
                          ></textarea>
                        </div>
                      ) : events.length > 0 ? (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Pilih Acara <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {events.map((event) => (
                              <label
                                key={event.id}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                                  formData.eventId === event.id.toString()
                                    ? 'bg-blue-50 border-blue-500'
                                    : 'hover:bg-gray-50'
                                }`}
                              > 
                                <input
                                  type="radio"
                                  name="eventId"
                                  value={event.id}
                                  checked={formData.eventId === event.id.toString()}
                                  onChange={(e) => {
                                    const selectedEvent = events.find(ev => ev.id.toString() === e.target.value);
                                    if (selectedEvent) {
                                      setFormData(prev => ({
                                        ...prev,
                                        eventId: e.target.value,
                                        jenisKeperluan: 'EVENT',
                                        keperluan: `Menghadiri acara: ${selectedEvent.name}`
                                      }));
                                    }
                                  }}
                                  className="hidden"
                                />
                                <div className="ml-2">
                                  <div className="font-medium">{event.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(event.startDate).toLocaleDateString('id-ID', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                    {event.endDate && (' - ' + new Date(event.endDate).toLocaleDateString('id-ID', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    }))}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Tidak ada acara yang tersedia
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Opsi Menginap */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div 
                      className="flex items-center mb-2 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                      onClick={() => setFormData({...formData, menginap: !formData.menginap})}
                    >
                      <input
                        type="checkbox"
                        id="menginap"
                        name="menginap"
                        checked={formData.menginap} 
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <label 
                        htmlFor="menginap" 
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium text-gray-700 flex items-center"
                      >
                        Menginap
                      </label>
                    </div>
                    
                    {formData.menginap && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          Tanggal & Waktu Keluar <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                          <DatePicker
                            selected={formData.tanggalKeluar ? new Date(formData.tanggalKeluar) : null}
                            onChange={handleDateChange}
                            minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            dateFormat="dd/MM/yyyy HH:mm"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            timeCaption="Waktu"
                            className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholderText="Pilih tanggal dan waktu keluar"
                            required={formData.menginap}
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Foto Selfi */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      Foto Selfi <span className="text-red-500 ml-1">*</span>
                    </label>
                    {showCamera ? (
                      <motion.div 
                        className="space-y-2"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            width: 1920,
                            height: 1080,
                            facingMode: "user",
                            aspectRatio: 16/9,
                            frameRate: { ideal: 30 }
                          }}
                          imageSmoothing={true}
                          screenshotQuality={1}
                          className="w-full rounded-lg shadow-md"
                        />
                        <div className="flex space-x-2">
                          <motion.button
                            type="button"
                            onClick={handleCapture}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiUser className="h-4 w-4" />
                            <span>Ambil Foto</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => setShowCamera(false)}
                            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Batal
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="space-y-2"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {formData.fotoSelfi ? (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">
                              <p>Ukuran gambar: {imageDimensions.width} x {imageDimensions.height} {formatFileSize(imageSize)} MB</p>
                            </div>
                            <img
                              src={formData.fotoSelfi}
                              alt="Foto Selfi"
                              className="w-full max-h-64 object-contain rounded-lg shadow-md"
                        onLoad={handleImageLoad}
                            />
                            <motion.button
                              type="button"
                              onClick={handleReloadWebcam}
                              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <FiUser className="h-4 w-4" />
                              <span>Ambil Ulang</span>
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            type="button"
                            onClick={() => setShowCamera(true)}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiUser className="h-4 w-4" />
                            <span>Buka Kamera</span>
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || (formData.jenisKunjungan === 'lembaga' && !validasiJumlah) || !formData.fotoSelfi}
                    className={`${
                      isLoading || (formData.jenisKunjungan === 'lembaga' && !validasiJumlah) || !formData.fotoSelfi
                        ? 'bg-gray-400'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2 transition-all duration-200`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="animate-spin h-5 w-5" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="h-5 w-5" />
                        <span>Simpan</span>
                      </>
                    )}
                  </motion.button>

                  <motion.div 
                    className="text-center mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      type="button"
                      onClick={onCancel}
                      className="text-blue-500 hover:text-blue-700 hover:underline text-sm flex items-center justify-center mx-auto space-x-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiLogOut className="h-4 w-4" />
                      <span>Kembali</span>
                    </motion.button>
                  </motion.div>
              </motion.form>
            </motion.div>  
          </motion.div>
        )}
      </div>
    </div>
    <Footer />
  </>
  );
}
