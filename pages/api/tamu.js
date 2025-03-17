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
      return res.status(401).json({ error: 'Unauthorized' });
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
      res.status(500).json({ error: error.message });
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
        whereClause.jenisTamu = jenisTamu;
      }
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      let totalCount = 0;
      try {
        // Ambil total count dengan error handling
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
          fotoSelfi: false
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: parseInt(limit),
        skip: skip
      });
      
      const tamuIds = tamu.map((tamuItem) => parseInt(tamuItem.id));
      
      const photos = await prisma.tamu.findMany({
        where: {
          id: { in: tamuIds },
        },
        select: {
          id: true,
          fotoSelfi: true,
        },
      });
      
      const photoMap = new Map(photos.map((photo) => [photo.id, !!photo.fotoSelfi]));
      
      const processedTamu = tamu.map((tamuItem) => ({
        ...tamuItem,
        hasFullPhoto: photoMap.get(parseInt(tamuItem.id)) || false,
      }));
      
      res.status(200).json({
        data: processedTamu,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
