export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial status
  res.write(`data: ${JSON.stringify(global.importStatus || { total: 0, current: 0, status: 'waiting' })}\n\n`);

  // Set up interval to check status
  const interval = setInterval(() => {
    if (!global.importStatus) return;

    res.write(`data: ${JSON.stringify(global.importStatus)}\n\n`);

    if (global.importStatus.status === 'completed' || global.importStatus.status === 'error') {
      clearInterval(interval);
      res.end();
    }
  }, 100);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
}