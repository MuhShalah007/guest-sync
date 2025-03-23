import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await isAuthenticated(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { visitorIds } = req.body;
      
      // Update all selected visitors
      await prisma.tamu.updateMany({
        where: {
          id: {
            in: visitorIds
          }
        },
        data: {
          eventId: parseInt(id),
          jenisKeperluan: 'EVENT'
        }
      });

      return res.status(200).json({ message: 'Visitors assigned successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}