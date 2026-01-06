import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// For Prisma 7, we can use the connection string directly
// The adapter will be auto-detected from the DATABASE_URL
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Prisma 7 auto-detects SQLite from file: URLs
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

