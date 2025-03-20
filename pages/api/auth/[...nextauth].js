import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (credentials.username === process.env.ADMIN_USERNAME &&
              credentials.password === process.env.ADMIN_PASSWORD) {
            return {
              id: 'env-admin',
              name: 'Administrator',
              role: 'ADMIN',
              username: process.env.ADMIN_USERNAME
            };
          }

          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name || user.username,
            role: user.role,
            username: user.username
          };
        } catch (error) {
          console.error('Auth Error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure all user data is included in both client and server sessions
      session.user = {
        ...session.user,
        role: token.role,
        username: token.username
      };
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
};

export default NextAuth(authOptions);