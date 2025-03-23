import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    const eventPanitia = await prisma.eventPanitia.findMany({
      where: { eventId: parseInt(id) },
      include: { user: true }
    });
    return res.json(eventPanitia);
  }

  if (req.method === 'POST') {
    const { userIds } = req.body;
    
    try {
      // Delete existing assignments
      await prisma.eventPanitia.deleteMany({
        where: { eventId: parseInt(id) }
      });

      // Create new assignments
      const assignments = await Promise.all(
        userIds.map(userId => 
          prisma.eventPanitia.create({
            data: {
              eventId: parseInt(id),
              userId: parseInt(userId)
            }
          })
        )
      );

      return res.json(assignments);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}