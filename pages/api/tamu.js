import { PrismaClient } from '@prisma/client';
import { isAuthenticated, isPublicRoute } from '../../middleware/auth';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}

export default async function handler(req, res) {
  // Cek apakah ini adalah public route
  const isPublic = await isPublicRoute(req);
  
  // Jika bukan public route, cek autentikasi
  if (!isPublic) {
    const isAuth = await isAuthenticated(req);
    if (!isAuth) {
      return res.status(401).json({ ok: false, error_code: 401, description:'Unauthorized' });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Validasi ukuran foto
      if (data.fotoSelfi) {
        const base64Length = data.fotoSelfi.length;
        const sizeInMb = (base64Length * (3/4)) / (1024*1024);
        
        if (sizeInMb > 4) {
          return res.status(413).json({ 
            error: 'Ukuran foto terlalu besar. Maksimal 4MB' 
          });
        }
      }
      
      if (!data.kelamin) {        
        if (data.jenisKunjungan === 'lembaga') {
          data.kelamin = 'G'; 
        } else {          
          data.kelamin = 'L';
        }
      }
      
      if (data.jenisKunjungan === 'lembaga' && data.jumlahLaki !== undefined && data.jumlahPerempuan !== undefined) {
        data.jumlahLaki = parseInt(data.jumlahLaki) || 0;
        data.jumlahPerempuan = parseInt(data.jumlahPerempuan) || 0;
      }
      
      const savedTamu = await prisma.tamu.create({
        data
      });
      res.status(200).json(savedTamu);
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { 
        jenisTamu, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 20 // Batasi 20 data per halaman
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      let whereClause = {};
      if (jenisTamu && jenisTamu !== 'semua') {
        if (jenisTamu === 'lembaga') {
          whereClause.jenisTamu = 'umum';
          whereClause.jenisKunjungan = 'lembaga';
        } else if (jenisTamu === 'umum') {
          whereClause.jenisTamu = jenisTamu;
          whereClause.jenisKunjungan = 'individu';
        } else {
          whereClause.jenisTamu = jenisTamu;
        }
      }
      
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.createdAt.lte = new Date(endDate);
        }
      }

      let totalCount = 0;
      try {
        totalCount = await prisma.tamu.count({
          where: whereClause
        });
      } catch (countError) {
        console.error('Error getting count:', countError);
        totalCount = 0;
      }

      // Ambil data dengan pagination dan select spesifik
      const tamu = await prisma.tamu.findMany({
        where: whereClause,
        select: {
          id: true,
          jenisTamu: true,
          nama: true,
          noKontak: true,
          asal: true,
          kelamin: true,
          keperluan: true,
          createdAt: true,
          menginap: true,
          tanggalKeluar: true,
          waliDari: true,
          kelas: true,
          jenisKunjungan: true,
          namaLembaga: true,
          jumlahOrang: true,
          jumlahLaki: true,
          jumlahPerempuan: true,
          fotoSelfi: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit),
        skip: skip
      });
      
      res.status(200).json({
        data: tamu,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
