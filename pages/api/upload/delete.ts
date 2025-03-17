import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

type ResponseData = {
  ok: boolean;
  result?: string;
  error_code?: 200 | 400 | 401 | 404 | 405 | 500;
  description?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'DELETE') {
    try {
      // Mendapatkan nama file dari query parameter atau body
      const { filename } = req.query; // atau req.body jika Anda ingin mengirim melalui body
      
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({
          ok: false,
          error_code: 400,
          description: 'Filename is required',
        });
      }

      const filePath = path.join(UPLOAD_DIR, filename);

      // Cek apakah file ada
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          ok: false,
          error_code: 404,
          description: 'File not found',
        });
      }

      // Hapus file
      await fs.unlink(filePath);

      return res.status(200).json({
        ok: true,
        result: 'File deleted successfully',
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        error_code: 500,
        description: 'Error deleting file',
      });
    }
  } else {
    return res.status(405).json({
      ok: false,
      error_code: 405,
      description: 'Method not allowed',
    });
  }
}