import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const isAuth = await isAuthenticated(req);
  if (!isAuth || isAuth.role !== 'PANITIA') {
    return res.status(401).json({ ok: false, error_code: 401, description: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const events = await prisma.event.findMany({
        where: {
          panitia: {
            some: {
              userId: isAuth.id
            }
          },
          isActive: true
        },
        orderBy: {
          startDate: 'desc'
        }
      });

      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}