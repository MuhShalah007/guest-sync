import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../middleware/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await isAuthenticated(req);
  
  if (!token || token.role !== 'ADMIN') {
    return res.status(403).json({ ok: false, error_code: 403, description:'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { username, name, role, password } = req.body;
      
      const updateData = {
        username,
        name,
        role,
      };
      
      if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      
      return res.status(200).json({ 
        ok: true, 
        data: user,
        message: 'user status updated successfully' 
      });
    } catch (error) {
      return res.status(500).json({ 
        ok: false, 
        error_code: 500, 
        description: error.message 
      });
    }	
  } else if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({
        where: { id: parseInt(id) }
      });
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}