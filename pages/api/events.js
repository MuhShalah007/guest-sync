import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await isAuthenticated(req);
  
  if (!token || !['ADMIN', 'HUMAS'].includes(token.role)) {
    return res.status(401).json({ ok: false, error_code: 401, description:'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const events = await prisma.event.findMany({
        orderBy: {
          startDate: 'desc'
        }
      });
      return res.status(200).json(events);
    } catch (error) {
      return res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  } 
  
  if (req.method === 'POST') {
    try {
      const { name, description, startDate, endDate, isActive } = req.body;
      
      const event = await prisma.event.create({
        data: {
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive
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