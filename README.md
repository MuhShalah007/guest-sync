# GuestSync

GuestSync adalah aplikasi buku tamu digital yang memungkinkan pengelolaan data tamu secara efisien dengan dukungan untuk dua jenis tamu: Tamu Umum dan Tamu Wali.

## Fitur Utama

- ✅ Pilihan jenis tamu (Umum/Wali)
- 📝 Form dinamis sesuai jenis tamu
- 📱 Responsive design (mobile-friendly)
- 💾 Penyimpanan data dengan SQLite
- ✨ Interface modern dengan Tailwind CSS
- 🔄 Opsi menginap dengan tanggal keluar
- 👥 Pencatatan jumlah tamu dan statistik

## Persyaratan Sistem

- Node.js (versi 14 atau lebih baru)
- NPM atau Yarn
- SQLite

## Instalasi

1. Clone repository:
```bash
git clone https://github.com/MuhShalah007/guest-sync.git
cd guest-sync
```

2. Install dependencies:
```bash
npm install
```

3. Setup database:
```bash
npm run prisma:migrate
```

4. Tambahkan data dummy (opsional):
```bash
npm run seed
```

5. Jalankan aplikasi:
```bash
npm run dev
```

## Penggunaan

1. Buka aplikasi di browser (http://localhost:3000)
2. Pilih jenis tamu (Umum/Wali)
3. Isi formulir sesuai jenis tamu
4. Klik tombol "Simpan" untuk menyimpan data
5. Akses dashboard admin di http://localhost:3000/admin (username: admin, password: admin123)

## Perintah Berguna

- `npm run dev`: Menjalankan aplikasi dalam mode development
- `npm run build`: Build aplikasi untuk production
- `npm start`: Menjalankan aplikasi dalam mode production
- `npm run prisma:studio`: Membuka Prisma Studio untuk melihat database
- `npm run prisma:seed`: Menambahkan data dummy ke database
- `npm run prisma:reset`: Reset database dan tambahkan data dummy

## Struktur Database

Tabel `Tamu`:
- id (Primary Key)
- jenisTamu (umum/wali)
- nama
- noKontak
- asal
- kelamin (L/P/G)
- keperluan
- fotoSelfi
- createdAt
- waliDari (untuk tamu wali)
- kelas (untuk tamu wali)
- jenisKunjungan (untuk tamu umum)
- namaLembaga (untuk tamu lembaga)
- jumlahOrang (untuk tamu lembaga)
- jumlahLaki (untuk tamu lembaga)
- jumlahPerempuan (untuk tamu lembaga)
- menginap (boolean)
- tanggalKeluar (jika menginap)

## Teknologi yang Digunakan

- Next.js
- React.js
- Tailwind CSS
- Framer Motion
- Prisma
- SQLite
- React Webcam

## Pengembangan

Untuk menambahkan fitur atau melakukan perbaikan:

1. Fork repository
2. Buat branch baru
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

## Lisensi

MIT License