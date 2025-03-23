const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.tamu.deleteMany({});
  await prisma.eventPanitia.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        name: 'Administrator',
        role: 'ADMIN'
      }
    }),
    prisma.user.create({
      data: {
        username: 'humas1',
        password: await bcrypt.hash('humas123', 10),
        name: 'Humas Utama',
        role: 'HUMAS'
      }
    }),
    ...Array(5).fill(null).map((_, i) => 
      prisma.user.create({
        data: {
          username: `panitia${i + 1}`,
          password: bcrypt.hashSync('panitia123', 10),
          name: `Panitia ${i + 1}`,
          role: 'PANITIA'
        }
      })
    )
  ]);

  // Create Events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: 'Open House 2024',
        description: 'Acara tahunan open house pesantren',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-01-21'),
        isActive: true
      }
    }),
    prisma.event.create({
      data: {
        name: 'Wisuda Santri 2024',
        description: 'Wisuda santri angkatan 2024',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-15'),
        isActive: true
      }
    }),
    prisma.event.create({
      data: {
        name: 'Haflah Akhirussanah',
        description: 'Perayaan akhir tahun ajaran',
        startDate: new Date('2024-03-10'),
        endDate: new Date('2024-03-12'),
        isActive: true
      }
    })
  ]);

  // Assign Panitia to Events
  const eventPanitia = await Promise.all(
    events.flatMap(event => 
      users
        .filter(user => user.role === 'PANITIA')
        .slice(0, 3) // Assign 3 random panitia to each event
        .map(user =>
          prisma.eventPanitia.create({
            data: {
              eventId: event.id,
              userId: user.id
            }
          })
        )
    )
  );

  // Create Tamu
  const tamu = await Promise.all([
    // Tamu Umum - Individual
    prisma.tamu.create({
      data: {
        jenisTamu: 'umum',
        nama: 'Ahmad Fauzi',
        noKontak: '081234567890',
        asal: 'Surabaya',
        kelamin: 'L',
        jenisKeperluan: 'UMUM',
        keperluan: 'Silaturahmi dengan pengasuh',
        fotoSelfi: '/uploads/dummy1.jpg',
        jenisKunjungan: 'individu'
      }
    }),
    // Tamu Umum - Group
    prisma.tamu.create({
      data: {
        jenisTamu: 'umum',
        nama: 'Rombongan Study Banding',
        noKontak: '087654321098',
        asal: 'Pesantren Al-Hikam',
        kelamin: 'G',
        jenisKeperluan: 'UMUM',
        keperluan: 'Study banding sistem pendidikan',
        fotoSelfi: '/uploads/dummy2.jpg',
        jenisKunjungan: 'lembaga',
        namaLembaga: 'Pesantren Al-Hikam',
        jumlahOrang: 15,
        jumlahLaki: 8,
        jumlahPerempuan: 7
      }
    }),
    // Tamu Wali
    prisma.tamu.create({
      data: {
        jenisTamu: 'wali',
        nama: 'Ibu Aminah',
        noKontak: '085678901234',
        asal: 'Malang',
        kelamin: 'P',
        jenisKeperluan: 'UMUM',
        keperluan: 'Menjenguk anak',
        fotoSelfi: '/uploads/dummy3.jpg',
        waliDari: 'Ahmad Zaini',
        kelas: '2 Aliyah'
      }
    }),
    // Tamu Event
    prisma.tamu.create({
      data: {
        jenisTamu: 'umum',
        nama: 'Keluarga Besar Santri',
        noKontak: '089012345678',
        asal: 'Sidoarjo',
        kelamin: 'G',
        jenisKeperluan: 'EVENT',
        eventId: events[0].id,
        keperluan: 'Menghadiri Open House',
        fotoSelfi: '/uploads/dummy4.jpg',
        jenisKunjungan: 'lembaga',
        namaLembaga: 'Keluarga Santri Baru',
        jumlahOrang: 4,
        jumlahLaki: 2,
        jumlahPerempuan: 2
      }
    })
  ]);

  console.log('Seeding completed successfully!');
  console.log(`Created ${users.length} users`);
  console.log(`Created ${events.length} events`);
  console.log(`Created ${eventPanitia.length} event assignments`);
  console.log(`Created ${tamu.length} tamu records`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });