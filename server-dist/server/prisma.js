import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const globalForPrisma = globalThis;
let prismaInstance = null;
const dbUrl = process.env.DATABASE_URL;
console.log(`🔗 DATABASE_URL ${dbUrl ? 'is set' : 'is NOT set'} (length: ${dbUrl?.length || 0})`);
if (dbUrl) {
    try {
        if (!globalForPrisma.prisma) {
            const pool = new pg.Pool({ connectionString: dbUrl });
            const adapter = new PrismaPg(pool);
            globalForPrisma.prisma = new PrismaClient({
                adapter,
                log: ['warn', 'error'],
            });
        }
        prismaInstance = globalForPrisma.prisma;
        console.log('✅ Prisma client initialized successfully with PrismaPg adapter');
    }
    catch (e) {
        console.error('❌ Could not initialize Prisma client:', e);
    }
}
else {
    console.warn('⚠️  DATABASE_URL not set — database features disabled');
}
export const prisma = prismaInstance;
