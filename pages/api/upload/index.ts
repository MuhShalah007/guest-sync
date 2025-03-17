import type { NextApiRequest, NextApiResponse } from 'next'

import path from "path";
import fs from 'fs/promises';
import crypto from 'crypto';
import formidable from 'formidable';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  if(req.method === 'POST') {
    const form = new formidable.IncomingForm({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
    });
    try {
      await fs.access(UPLOAD_DIR);
    } catch (error) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            error_code: 500,
            description: 'Error parsing file upload',
          });
        }
    
        const file = files.file as formidable.File | formidable.File[] | undefined;
        if (!file) {
          return res.status(400).json({
            ok: false,
            error_code: 400,
            description: 'No file uploaded',
          });
        }
        const uploadedFile = Array.isArray(file) ? file[0] : file;
        const filePath = uploadedFile.filepath;
        
        const fileExt = path.extname(uploadedFile.originalFilename || '.jpg');
        
        const randomString = crypto.randomBytes(16).toString('hex');
        const md5Hash = crypto.createHash('md5').update(randomString).digest('hex');
        const fileName = `${md5Hash}${fileExt}`;
        const newPath = path.join(UPLOAD_DIR, fileName);
        const protocol = req.headers['x-forwarded-proto']; // || 'http'; // Use 'http' as fallback
        const host = req.headers.host; // || 'localhost:3000'; // Fallback for local dev
        const domain = `${protocol}://${host}`;

        await fs.rename(filePath, newPath).then(() => {
          return res.status(200).json({
            ok: true,
            result: `${domain}/uploads/${fileName}`,
          });

        }).catch(err => {
          return res.status(500).json({
            ok: false,
            error_code: 500,
            description: 'Error saving file',
          });
        });
      });
    })
  }else{
    return res.status(401).json({ ok: false, error_code: 401, description: 'Unauthorized' })
  }
}