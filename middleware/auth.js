import { getToken } from 'next-auth/jwt';

export async function isAuthenticated(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!token;
}

export async function isPublicRoute(req) {
  // Izinkan POST request ke /api/tamu untuk pendaftaran tamu
  if (req.method === 'POST' && req.url.endsWith('/api/tamu')) {
    return true;
  }
  return false;
} 