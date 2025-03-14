import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Query untuk tamu hari ini
      const tamuHariIni = await prisma.tamu.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      // Query untuk tamu yang masih menginap (dari hari sebelumnya)
      const tamuMenginap = await prisma.tamu.findMany({
        where: {
          AND: [
            { menginap: true },
            { tanggalKeluar: { gte: today } },
            { createdAt: { lt: today } } // Hanya ambil yang check-in sebelum hari ini
          ]
        }
      });

      let stats = {
        hariIni: {
          total: tamuHariIni.length,
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
        keperluan: {},
        bulanIni: {
          total: 0,
          totalOrang: 0,
          wali: { L: 0, P: 0, total: 0 },
          umum: {
            individu: { L: 0, P: 0, total: 0 },
            lembaga: { L: 0, P: 0, total: 0, jumlahOrang: 0 }
          }
        }
      };

      // Hitung statistik tamu hari ini
      tamuHariIni.forEach(tamu => {
        const jumlahOrang = tamu.jenisKunjungan === 'lembaga' ? (tamu.jumlahOrang || 1) : 1;
        stats.hariIni.totalOrang += jumlahOrang;

        if (tamu.jenisTamu === 'wali') {
          stats.hariIni.wali.total++;
          if (tamu.kelamin === 'L') stats.hariIni.wali.L++;
          else if (tamu.kelamin === 'P') stats.hariIni.wali.P++;

          // Jika menginap
          if (tamu.menginap) {
            stats.hariIni.menginap.total++;
            stats.hariIni.menginap.totalOrang += jumlahOrang;
            stats.hariIni.menginap.wali.total++;
            if (tamu.kelamin === 'L') stats.hariIni.menginap.wali.L++;
            else if (tamu.kelamin === 'P') stats.hariIni.menginap.wali.P++;
          }
        } else if (tamu.jenisTamu === 'umum') {
          if (tamu.jenisKunjungan === 'lembaga') {
            stats.hariIni.umum.lembaga.total++;
            stats.hariIni.umum.lembaga.jumlahOrang += jumlahOrang;
            if (tamu.jumlahLaki) stats.hariIni.umum.lembaga.L += parseInt(tamu.jumlahLaki);
            if (tamu.jumlahPerempuan) stats.hariIni.umum.lembaga.P += parseInt(tamu.jumlahPerempuan);

            // Jika menginap
            if (tamu.menginap) {
              stats.hariIni.menginap.total++;
              stats.hariIni.menginap.totalOrang += jumlahOrang;
              stats.hariIni.menginap.umum.lembaga.total++;
              stats.hariIni.menginap.umum.lembaga.jumlahOrang += jumlahOrang;
              if (tamu.jumlahLaki) stats.hariIni.menginap.umum.lembaga.L += parseInt(tamu.jumlahLaki);
              if (tamu.jumlahPerempuan) stats.hariIni.menginap.umum.lembaga.P += parseInt(tamu.jumlahPerempuan);
            }
          } else {
            stats.hariIni.umum.individu.total++;
            if (tamu.kelamin === 'L') stats.hariIni.umum.individu.L++;
            else if (tamu.kelamin === 'P') stats.hariIni.umum.individu.P++;

            // Jika menginap
            if (tamu.menginap) {
              stats.hariIni.menginap.total++;
              stats.hariIni.menginap.totalOrang++;
              stats.hariIni.menginap.umum.individu.total++;
              if (tamu.kelamin === 'L') stats.hariIni.menginap.umum.individu.L++;
              else if (tamu.kelamin === 'P') stats.hariIni.menginap.umum.individu.P++;
            }
          }
        }
        
        if (!stats.keperluan[tamu.keperluan]) {
          stats.keperluan[tamu.keperluan] = { jumlah: 0, jumlahOrang: 0 };
        }
        stats.keperluan[tamu.keperluan].jumlah++;
        stats.keperluan[tamu.keperluan].jumlahOrang += jumlahOrang;
      });

      // Tambahkan statistik tamu yang masih menginap dari hari sebelumnya
      tamuMenginap.forEach(tamu => {
        const jumlahOrang = tamu.jenisKunjungan === 'lembaga' ? (tamu.jumlahOrang || 1) : 1;
        stats.hariIni.total++;
        stats.hariIni.totalOrang += jumlahOrang;
        stats.hariIni.menginap.total++;
        stats.hariIni.menginap.totalOrang += jumlahOrang;

        if (tamu.jenisTamu === 'wali') {
          stats.hariIni.wali.total++;
          stats.hariIni.menginap.wali.total++;
          if (tamu.kelamin === 'L') {
            stats.hariIni.wali.L++;
            stats.hariIni.menginap.wali.L++;
          } else if (tamu.kelamin === 'P') {
            stats.hariIni.wali.P++;
            stats.hariIni.menginap.wali.P++;
          }
        } else if (tamu.jenisTamu === 'umum') {
          if (tamu.jenisKunjungan === 'lembaga') {
            stats.hariIni.umum.lembaga.total++;
            stats.hariIni.umum.lembaga.jumlahOrang += jumlahOrang;
            stats.hariIni.menginap.umum.lembaga.total++;
            stats.hariIni.menginap.umum.lembaga.jumlahOrang += jumlahOrang;
            
            if (tamu.jumlahLaki) {
              const laki = parseInt(tamu.jumlahLaki);
              stats.hariIni.umum.lembaga.L += laki;
              stats.hariIni.menginap.umum.lembaga.L += laki;
            }
            if (tamu.jumlahPerempuan) {
              const perempuan = parseInt(tamu.jumlahPerempuan);
              stats.hariIni.umum.lembaga.P += perempuan;
              stats.hariIni.menginap.umum.lembaga.P += perempuan;
            }
          } else {
            stats.hariIni.umum.individu.total++;
            stats.hariIni.menginap.umum.individu.total++;
            if (tamu.kelamin === 'L') {
              stats.hariIni.umum.individu.L++;
              stats.hariIni.menginap.umum.individu.L++;
            } else if (tamu.kelamin === 'P') {
              stats.hariIni.umum.individu.P++;
              stats.hariIni.menginap.umum.individu.P++;
            }
          }
        }
      });
      
      stats.keperluan = Object.entries(stats.keperluan).map(([keperluan, data]) => ({
        keperluan,
        jumlah: data.jumlah,
        jumlahOrang: data.jumlahOrang
      }));

      // Tambahkan query untuk statistik bulan ini
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const tamuBulanIni = await prisma.tamu.findMany({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      });

      // Hitung statistik bulanan
      const statsBulanIni = {
        total: tamuBulanIni.length,
        totalOrang: 0,
        wali: { L: 0, P: 0, total: 0 },
        umum: {
          individu: { L: 0, P: 0, total: 0 },
          lembaga: { L: 0, P: 0, total: 0, jumlahOrang: 0 }
        }
      };

      tamuBulanIni.forEach(tamu => {
        const jumlahOrang = tamu.jenisKunjungan === 'lembaga' ? (tamu.jumlahOrang || 1) : 1;
        statsBulanIni.totalOrang += jumlahOrang;

        if (tamu.jenisTamu === 'wali') {
          statsBulanIni.wali.total++;
          if (tamu.kelamin === 'L') statsBulanIni.wali.L++;
          else if (tamu.kelamin === 'P') statsBulanIni.wali.P++;
        } else if (tamu.jenisTamu === 'umum') {
          if (tamu.jenisKunjungan === 'lembaga') {
            statsBulanIni.umum.lembaga.total++;
            statsBulanIni.umum.lembaga.jumlahOrang += jumlahOrang;
            if (tamu.jumlahLaki) statsBulanIni.umum.lembaga.L += parseInt(tamu.jumlahLaki);
            if (tamu.jumlahPerempuan) statsBulanIni.umum.lembaga.P += parseInt(tamu.jumlahPerempuan);
          } else {
            statsBulanIni.umum.individu.total++;
            if (tamu.kelamin === 'L') statsBulanIni.umum.individu.L++;
            else if (tamu.kelamin === 'P') statsBulanIni.umum.individu.P++;
          }
        }
      });

      // Update stats object
      stats.bulanIni = statsBulanIni;

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 