import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;
let prismaInstance = null;
try {
    if (process.env.DATABASE_URL) {
        prismaInstance = globalForPrisma.prisma ?? new PrismaClient();
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = prismaInstance;
        }
    }
    else {
        console.warn('⚠️  DATABASE_URL not set — database features disabled');
    }
}
catch (e) {
    console.warn('⚠️  Could not initialize Prisma client:', e);
}
export const prisma = prismaInstance;
