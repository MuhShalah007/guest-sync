import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { FiLoader, FiUser, FiUsers, FiLogOut, FiBriefcase, FiCalendar, FiUserPlus } from 'react-icons/fi';
import { AiOutlineUser, AiOutlineBook, AiOutlineEnvironment, AiOutlinePhone, AiOutlineMan, AiOutlineWoman } from "react-icons/ai";
import DatePicker from 'react-datepicker';
const GuestForm = ({ jenisTamu, formData, setFormData, onSubmit, onCancel, isLoading }) => {
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  const [jumlahLaki, setJumlahLaki] = useState(0);
  const [jumlahPerempuan, setJumlahPerempuan] = useState(0);
  const [validasiJumlah, setValidasiJumlah] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleDateChange = useCallback((date) => {
    setFormData(prev => ({
      ...prev,
      tanggalKeluar: date
    }));
  }, [setFormData]);

  const handleCapture = useCallback(() => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Gagal mengambil foto');
      }
      setFormData(prev => ({
        ...prev,
        fotoSelfi: imageSrc
      }));
      setShowCamera(false);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-6"
    >
      <motion.form 
        onSubmit={onSubmit} 
        className="w-full space-y-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2 
          className="text-2xl font-bold text-center mb-6 text-indigo-700"
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
              Jenis Kelamin <span className="text-red-500">*</span>
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
              Nama <span className="text-red-500">*</span>
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
              No. Kontak <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <AiOutlinePhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="noKontak"
                value={formData.noKontak}
                onChange={handleChange}
                className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Nomor telepon/WA"
                required
              />
            </div>
          </div>

          {/* Asal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asal <span className="text-red-500">*</span>
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
                  Wali Dari <span className="text-red-500">*</span>
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
                  Kelas <span className="text-red-500">*</span>
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
                  Jenis Kunjungan <span className="text-red-500">*</span>
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
                      Nama Lembaga <span className="text-red-500">*</span>
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
                      Jumlah Orang <span className="text-red-500">*</span>
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
                        Rincian Jumlah Berdasarkan Jenis Kelamin <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiBriefcase className="h-4 w-4 mr-2 text-indigo-500" />
              Keperluan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="keperluan"
              value={formData.keperluan}
              onChange={handleChange}
              className="w-full outline-none p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              rows="3"
              placeholder="Tuliskan keperluan kunjungan Anda..."
              required
            ></textarea>
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
                <FiCalendar className="h-4 w-4 mr-2 text-indigo-500" />
                Menginap
              </label>
            </div>
            
            {formData.menginap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2 text-indigo-500" />
                  Tanggal Keluar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <DatePicker
                    selected={formData.tanggalKeluar ? new Date(formData.tanggalKeluar) : null}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full outline-none pl-10 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholderText="Pilih tanggal keluar"
                    required
                    calendarClassName="shadow-lg rounded-lg border border-gray-200"
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
              <FiUser className="h-4 w-4 mr-2 text-indigo-500" />
              Foto Selfi
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
                    <img
                      src={formData.fotoSelfi}
                      alt="Foto Selfi"
                      className="w-full max-h-64 object-contain rounded-lg shadow-md"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowCamera(true)}
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
            disabled={isLoading || (formData.jenisKunjungan === 'lembaga' && !validasiJumlah)}
            className={`${
              isLoading || (formData.jenisKunjungan === 'lembaga' && !validasiJumlah)
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
  );
};

export default GuestForm;
