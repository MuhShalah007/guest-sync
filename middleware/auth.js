import { getToken } from 'next-auth/jwt';

export async function isAuthenticated(req) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });
  
  return token;
}

export async function isAdmin(req) {
  const token = await isAuthenticated(req);
  return token?.role === 'ADMIN';
}

export async function isPublicRoute(req) {
  if (req.method === 'POST' && req.url.endsWith('/api/tamu')) {
    return true;
  }
  return false;
}