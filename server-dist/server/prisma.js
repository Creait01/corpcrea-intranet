import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;
let prismaInstance = null;
const dbUrl = process.env.DATABASE_URL;
console.log(`🔗 DATABASE_URL ${dbUrl ? 'is set' : 'is NOT set'} (length: ${dbUrl?.length || 0})`);
if (dbUrl) {
    try {
        prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
            log: ['warn', 'error'],
        });
        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = prismaInstance;
        }
        console.log('✅ Prisma client initialized successfully');
    }
    catch (e) {
        console.error('❌ Could not initialize Prisma client:', e);
    }
}
else {
    console.warn('⚠️  DATABASE_URL not set — database features disabled');
}
export const prisma = prismaInstance;
