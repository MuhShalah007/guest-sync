import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../../middleware/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Use the middleware to check authentication
  const isAuthorized = await isAdmin(req);
  
  if (!isAuthorized) {
    return res.status(401).json({ ok: false, error_code: 401, description:'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  } 
  
  if (req.method === 'POST') {
    try {
      const { username, password, role, name } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role,
          name
        }
      });
      
      return res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      });
    } catch (error) {
      return res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}