import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { oldFilename, newFilename } = req.body;
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const oldPath = path.join(uploadsDir, oldFilename);
    const newPath = path.join(uploadsDir, newFilename);

    await fs.rename(oldPath, newPath);

    res.status(200).json({ message: 'File renamed successfully' });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ message: 'Failed to rename file' });
  }
}