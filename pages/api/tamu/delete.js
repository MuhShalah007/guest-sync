import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Cek autentikasi
  const isAuth = await isAuthenticated(req);
  if (!isAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID tidak ditemukan' });
    }

    try {
        const tamu = await prisma.tamu.findUnique({
          where: { id: parseInt(id) },
        });
  
        if (!tamu) {
          // Jika tamu tidak ditemukan, kembalikan error 404
          return res.status(404).json({ error: 'Tamu tidak ditemukan' });
        }
      // Hapus data tamu berdasarkan ID
      const deletedTamu = await prisma.tamu.delete({
        where: {
          id: parseInt(id),
        },
      });

      // Kirim respons berhasil
      res.status(200).json({
        message: 'Tamu berhasil dihapus',
        data: deletedTamu,
      });
    } catch (error) {
      console.error('Error deleting tamu:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
