import { unlink } from 'fs/promises';
import path from 'path';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ ok: false, error_code: 401, description:'Unauthorized' });
  }

  if (req.method === 'DELETE') {
    const { filename } = req.query;
    const filePath = path.join(process.cwd(), 'public/uploads', filename);

    try {
      await unlink(filePath);
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ ok: false, error_code: 500, description:'Failed to delete file' });
    }
  } else {
    res.status(405).json({ ok: false, error_code: 405, description:'Method not allowed' });
  }
}