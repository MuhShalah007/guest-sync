import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await isAuthenticated(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { endpoint, keys } = req.body;

      await prisma.pushSubscription.upsert({
        where: { endpoint },
        update: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          userId: token.id
        },
        create: {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userId: token.id
        }
      });

      res.status(200).json({ message: 'Subscription saved' });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  }
}