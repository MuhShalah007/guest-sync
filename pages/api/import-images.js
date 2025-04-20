import { promises as fs } from 'fs';
import path from 'path';
import JSZip from 'jszip';
import formidable from 'formidable';
import { getSession } from 'next-auth/react';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Initialize formidable with options
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
    });

    // Parse the form data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    if (!files.zipFile) {
      throw new Error('No zip file uploaded');
    }

    // Get the file object (formidable v4 returns an array)
    const zipFile = Array.isArray(files.zipFile) ? files.zipFile[0] : files.zipFile;

    const zipData = await fs.readFile(zipFile.filepath);
    const zip = await JSZip.loadAsync(zipData);
    const uploadsDir = path.join(process.cwd(), 'public/uploads');

    // Ensure uploads directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const entries = Object.entries(zip.files).filter(([_, file]) => !file.dir);
    const total = entries.length;
    let current = 0;

    global.importStatus = {
      total,
      current: 0,
      status: 'Starting extraction...'
    };

    for (const [filename, file] of entries) {
      if (!file.dir) {
        current++;
        global.importStatus = {
          total,
          current,
          status: `Extracting: ${filename}`
        };

        const content = await file.async('nodebuffer');
        const filePath = path.join(uploadsDir, path.basename(filename));
        await fs.writeFile(filePath, content);
        
        // Set original modification time
        const originalDate = file.date;
        await fs.utimes(filePath, originalDate, originalDate);
      }
    }

    global.importStatus = {
      total,
      current: total,
      status: 'completed'
    };

    // Clean up temp file
    await fs.unlink(zipFile.filepath);
    res.status(200).json({ message: 'Images imported successfully' });
  } catch (error) {
    console.error('Import error:', error);
    global.importStatus = {
      total: 0,
      current: 0,
      status: 'error'
    };
    res.status(500).json({ message: 'Error importing images: ' + error.message });
  }
}