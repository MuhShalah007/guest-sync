import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Cek autentikasi
  const isAuth = await isAuthenticated(req);
  if (!isAuth) {
    return res.status(401).json({ ok: false, error_code: 401, description:'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ ok: false, error_code: 400, description:'ID tidak ditemukan' });
    }

    try {
      // Tambahkan cache control header
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

      const photo = await prisma.tamu.findUnique({
        where: { id: parseInt(id) },
        select: { fotoSelfi: true }
      });
      if (!photo || !photo.fotoSelfi) {
        return res.status(404).json({ ok: false, error_code: 404, description:'Foto tidak ditemukan' });
      }
      // Fungsi untuk mengecek apakah string adalah URL
      function isURL(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
      }

      // Proses gambar berdasarkan tipe input
      if (photo.fotoSelfi) {
        let imageBuffer;

        // Kondisi 1: Jika fotoSelfi adalah URL
        if (isURL(photo.fotoSelfi)) {
            const response = await fetch(photo.fotoSelfi);
            if (!response.ok) {
              throw new Error('Failed to fetch image');
          }
          // Konversi response ke buffer
          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          
          // Set header untuk menampilkan gambar
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Content-Length', imageBuffer.length);
            
            // Kirim buffer gambar sebagai response
            res.status(200).send(imageBuffer);
        } 
        // Kondisi 2: Jika fotoSelfi adalah string base64
        else if (photo.fotoSelfi.includes('base64,')) {
            const base64Data = photo.fotoSelfi.split(',')[1]; // Ambil bagian setelah "base64,"
            imageBuffer = Buffer.from(base64Data, 'base64'); // Konversi base64 ke buffer
            
            // Set header untuk menampilkan gambar
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Length', imageBuffer.length);
            
            // Kirim buffer gambar sebagai response
            res.status(200).send(imageBuffer);
        } 
        else {
            // Jika format tidak dikenali
            res.status(400).send('Format gambar tidak valid');
        }
      } else {
        res.status(400).send('Foto tidak ditemukan');
      }
    //   res.status(200).json({ fotoSelfi: photo.fotoSelfi });
    } catch (error) {
      console.error('Error fetching photo:', error);
      res.status(500).json({ ok: false, error_code: 500, description: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 