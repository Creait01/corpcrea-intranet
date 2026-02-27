import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;
let prismaInstance = null;
if (process.env.DATABASE_URL) {
    try {
        prismaInstance = globalForPrisma.prisma ?? new PrismaClient();
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = prismaInstance;
        }
    }
    catch (e) {
        console.warn('⚠️  Could not initialize Prisma client:', e);
    }
}
else {
    console.warn('⚠️  DATABASE_URL not set — database features disabled');
}
export const prisma = prismaInstance;
