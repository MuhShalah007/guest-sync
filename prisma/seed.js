const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding data...');

  // Hapus data yang ada
  await prisma.tamu.deleteMany({});
  
  // Tamu Umum - Individu
  const tamuUmumIndividu = [
    {
      jenisTamu: 'umum',
      nama: 'Budi Santoso',
      noKontak: '081234567890',
      asal: 'Jakarta',
      kelamin: 'L',
      keperluan: 'Kunjungan bisnis',
      jenisKunjungan: 'individu',
      fotoSelfi: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 jam yang lalu
    },
    {
      jenisTamu: 'umum',
      nama: 'Siti Rahayu',
      noKontak: '085678901234',
      asal: 'Bandung',
      kelamin: 'P',
      keperluan: 'Konsultasi',
      jenisKunjungan: 'individu',
      fotoSelfi: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 jam yang lalu
    }
  ];

  // Tamu Umum - Lembaga
  const tamuUmumLembaga = [
    {
      jenisTamu: 'umum',
      nama: 'Rombongan PT Maju Jaya',
      noKontak: '081122334455',
      asal: 'Surabaya',
      kelamin: 'G',
      keperluan: 'Studi banding',
      jenisKunjungan: 'lembaga',
      namaLembaga: 'PT Maju Jaya',
      jumlahOrang: 5,
      jumlahLaki: 3,
      jumlahPerempuan: 2,
      fotoSelfi: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 jam yang lalu
    },
    {
      jenisTamu: 'umum',
      nama: 'Rombongan Sekolah Cerdas',
      noKontak: '087654321098',
      asal: 'Yogyakarta',
      kelamin: 'G',
      keperluan: 'Kunjungan edukatif',
      jenisKunjungan: 'lembaga',
      namaLembaga: 'SMA Cerdas',
      jumlahOrang: 10,
      jumlahLaki: 4,
      jumlahPerempuan: 6,
      fotoSelfi: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      menginap: true,
      tanggalKeluar: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 hari ke depan
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 jam yang lalu
    }
  ];

  // Tamu Wali
  const tamuWali = [
    {
      jenisTamu: 'wali',
      nama: 'Pak Ahmad',
      noKontak: '089876543210',
      asal: 'Semarang',
      kelamin: 'L',
      keperluan: 'Menjenguk anak',
      waliDari: 'Aisyah Putri',
      kelas: '2A',
      fotoSelfi: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 menit yang lalu
    },
    {
      jenisTamu: 'wali',
      nama: 'Ibu Fatimah',
      noKontak: '082233445566',
      asal: 'Solo',
      kelamin: 'P',
      keperluan: 'Konsultasi dengan guru',
      waliDari: 'Muhammad Farhan',
      kelas: '3B',
      fotoSelfi: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      menginap: true,
      tanggalKeluar: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 hari ke depan
      createdAt: new Date(Date.now() - 1000 * 60 * 90) // 90 menit yang lalu
    }
  ];

  // Simpan data dummy
  for (const tamu of tamuUmumIndividu) {
    await prisma.tamu.create({ data: tamu });
  }
  
  for (const tamu of tamuUmumLembaga) {
    await prisma.tamu.create({ data: tamu });
  }
  
  for (const tamu of tamuWali) {
    await prisma.tamu.create({ data: tamu });
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 