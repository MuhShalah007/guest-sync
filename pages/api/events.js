import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await isAuthenticated(req);

  if (req.method === 'GET') {
    try {
      const { active } = req.query;
      let where = {};

      if (active) {
        where.isActive = active === 'true' ? true : false;
      }

      const events = await prisma.event.findMany({
        where,
        orderBy: {
          startDate: 'desc'
        },
        include: {
          _count: {
            select: { tamu: true }
          },
          tamu: {
            select: {
              jumlahOrang: true,
              jumlahLaki: true,
              jumlahPerempuan: true,
            }
          }
        }
      });

      const now = new Date();
      const updatedEvents = await Promise.all(events.map(async (event) => {
        if (new Date(event.endDate) < now && event.isActive) {
          const updatedEvent = await prisma.event.update({
            where: { id: event.id },
            data: { isActive: false }
          });
          return updatedEvent;
        }
        return event;
      }));

      const eventsWithStats = updatedEvents.map(event => ({
        ...event,
        stats: {
          totalTamu: event._count.tamu,
          totalPeserta: event.tamu.reduce((sum, t) => sum + (t.jumlahOrang || 1), 0),
          totalLaki: event.tamu.reduce((sum, t) => sum + (t.jumlahLaki || 0), 0),
          totalPerempuan: event.tamu.reduce((sum, t) => sum + (t.jumlahPerempuan || 0), 0),
        }
      }));

      if (!token || !['ADMIN', 'HUMAS'].includes(token.role)) {
        return res.status(200).json(eventsWithStats.filter(e => e.isActive));
      } else {
        return res.status(200).json(eventsWithStats);
      }
    } catch (error) {
      return res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  }
  
  if (!token || !['ADMIN', 'HUMAS'].includes(token.role)) {
    return res.status(401).json({ ok: false, error_code: 401, description:'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { name, description, startDate, endDate, isActive } = req.body;
      
      const now = new Date();
      const eventEndDate = new Date(endDate);
      const finalIsActive = eventEndDate < now ? false : isActive;

      const event = await prisma.event.create({
        data: {
          name,
          description,
          startDate: new Date(startDate),
          endDate: eventEndDate,
          isActive: finalIsActive
        }
      });
      
      return res.status(201).json(event);
    } catch (error) {
      return res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}