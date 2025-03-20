import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../../../middleware/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await isAuthenticated(req);
  
  if (!token || !['ADMIN', 'HUMAS'].includes(token.role)) {
	return res.status(401).json({ ok: false, error_code: 401, description: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'PATCH') {
	try {
	  const { isActive } = req.body;
	  
	  const event = await prisma.event.update({
		where: { id: parseInt(id) },
		data: { isActive }
	  });
	  
	  return res.status(200).json({ 
		ok: true, 
		data: event,
		message: 'Event status updated successfully' 
	  });
	} catch (error) {
	  return res.status(500).json({ 
		ok: false, 
		error_code: 500, 
		description: error.message 
	  });
	}
  } else if (req.method === 'PUT') {
	try {
		const { name, description, startDate, endDate, isActive } = req.body;
		
		const event = await prisma.event.update({
		  where: { id: parseInt(id) },
		  data: {
		    name,
		    description,
		    startDate: new Date(startDate),
		    endDate: new Date(endDate),
		    isActive
		  }
		});
	  
	  return res.status(200).json({ 
		ok: true, 
		data: event,
		message: 'Event status updated successfully' 
	  });
	} catch (error) {
	  return res.status(500).json({ 
		ok: false, 
		error_code: 500, 
		description: error.message 
	  });
	}
  
  } else if (req.method === 'DELETE') {
	try {
	  await prisma.event.delete({
		where: { id: parseInt(id) }
	  });
	  return res.status(200).json({ 
		ok: true, 
		message: 'Event deleted successfully' 
	  });
	} catch (error) {
	  return res.status(500).json({ 
		ok: false, 
		error_code: 500, 
		description: error.message 
	  });
	}
  }

  res.setHeader('Allow', ['PUT', 'PATCH', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}