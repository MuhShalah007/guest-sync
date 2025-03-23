import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await isAuthenticated(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const participants = await prisma.tamu.findMany({
        where: {
          eventId: parseInt(id),
          jenisKeperluan: 'EVENT'
        },
        select: {
          id: true,
          nama: true,
          noKontak: true,
          kelamin: true,
          jenisKunjungan: true,
          namaLembaga: true,
          jumlahOrang: true,
          jumlahLaki: true,
          jumlahPerempuan: true,
          keperluan: true,
          createdAt: true,
          asal: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json(participants);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}