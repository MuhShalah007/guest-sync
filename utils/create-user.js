import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser(username, password, role, name) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        name
      }
    });
    console.log(`User created: ${username} with role ${role}`);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage:
// createUser('admin', 'secure-password', 'ADMIN', 'Super Admin');