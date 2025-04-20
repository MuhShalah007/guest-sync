import { promises as fs } from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const zip = new JSZip();
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const files = await fs.readdir(uploadsDir);

    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);
      const stats = await fs.stat(filePath);
      const fileData = await fs.readFile(filePath);
      
      // Use original filename and set the file's date in the zip
      zip.file(filename, fileData, {
        date: stats.mtime // This preserves the original modification date
      });
    }

    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      platform: process.platform === 'win32' ? 'DOS' : 'UNIX' // Ensure proper timestamp handling
    });
    
    const currentDate = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=gallery-export-${currentDate}.zip`);
    res.send(zipBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error creating zip file' });
  }
}