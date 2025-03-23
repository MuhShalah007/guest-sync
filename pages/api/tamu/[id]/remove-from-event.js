import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await isAuthenticated(req);
  if (!token || token.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const updatedTamu = await prisma.tamu.update({
        where: {
          id: parseInt(id)
        },
        data: {
          eventId: null,
          jenisKeperluan: 'UMUM'
        }
      });

      return res.status(200).json({ message: 'Visitor removed from event', data: updatedTamu });
    } catch (error) {
      console.error('Error removing visitor from event:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}