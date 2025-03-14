import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
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
      const { jenisTamu, startDate, endDate } = req.query;
      
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

      const tamu = await prisma.tamu.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json(tamu);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 