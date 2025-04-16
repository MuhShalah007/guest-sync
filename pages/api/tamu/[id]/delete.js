import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const isAuth = await isAuthenticated(req);
  
  if (!isAuth || !['ADMIN', 'HUMAS'].includes(isAuth.role)) {
    return res.status(401).json({ ok: false, error_code: 401, description: 'Unauthorized' });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ ok: false, error_code: 400, description:'ID tidak ditemukan' });
    }

    try {
      const tamu = await prisma.tamu.findUnique({
        where: { id: parseInt(id) }
      });

      if (!tamu) {         
        return res.status(404).json({ ok: false, error_code: 404, description:'Tamu tidak ditemukan' });
      }
     
      const deletedTamu = await prisma.tamu.delete({
        where: {
          id: parseInt(id),
        },
      });
     
      res.status(200).json({
        message: 'Tamu berhasil dihapus',
        data: deletedTamu,
      });
    } catch (error) {
      console.error('Error deleting tamu:', error);
      res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
