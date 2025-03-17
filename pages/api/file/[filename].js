import fs from 'fs';
import path from 'path';
 
export default function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join(process.cwd(), 'public/uploads', filename);

  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(fileBuffer);
  } else {
    res.status(404).send('File '+filePath+' not found');
  }
}