import { PrismaClient } from '@prisma/client';
import { isAuthenticated, isPublicRoute } from '../../middleware/auth';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your@email.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}

export default async function handler(req, res) {
  const isAuth = await isAuthenticated(req);
  if (!isAuth && !isPublicRoute(req)) {
    return res.status(401).json({ ok: false, error_code: 401, description:'Unauthorized' });
  }

  if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const data = req.body;
      
      const updatedTamu = await prisma.tamu.update({
        where: { id: parseInt(id) },
        data
      });
      
      return res.json({ ok: true, result: updatedTamu });
    } catch (error) {
      console.error('Error updating guest:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      
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

      if (data.eventId) {
        const event = await prisma.event.findUnique({
          where: {
            id: data.eventId
          }
        });

        if (!event) {
          return res.status(404).json({
            error: 'Event tidak ditemukan'
          });
        }

        if (!event.isActive) {
          return res.status(400).json({
            error: 'Event sudah tidak aktif'
          });
        }

        data.eventName = event.name;
      }
      
      const savedTamu = await prisma.tamu.create({
        data
      });
      if(savedTamu){
        const subscriptions = await prisma.pushSubscription.findMany({
          include: { user: true }
        });
        
        const payload = JSON.stringify({
          title: 'Tamu Baru',
          body: `${savedTamu.nama} dari ${savedTamu.asal}`,
          url: '/admin'
        });
        
        await Promise.allSettled(
          subscriptions.map(sub => 
            webpush.sendNotification({
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            }, payload)
          )
        );
      }
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
        eventId,
        page = 1,
        limit = 20 
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      let whereClause = {};
      let eventIds = [];
      
      if (isAuth && isAuth.role === 'PANITIA') {
        const panitiaEvents = await prisma.eventPanitia.findMany({
          where: { userId: isAuth.id },
          select: { eventId: true }
        });
        eventIds = panitiaEvents.map(pe => pe.eventId);
        whereClause.eventId = { in: eventIds };
      }
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

      if (eventId) {
        whereClause.eventId = parseInt(eventId);
      }
      
      if (req.query.unassigned === 'true') {
        whereClause.eventId = null;
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
          fotoSelfi: true,
          eventId: true,
          event: {
            select: {
              name: true
            }
          }
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
