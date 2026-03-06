import { prisma } from './prisma.js';
import bcrypt from 'bcryptjs';
/**
 * Auto-seed: creates default admin users if the users table is empty.
 * This is safe to run on every startup — it only seeds when there are zero users.
 */
export async function autoSeed() {
    if (!prisma)
        return;
    try {
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            console.log(`✅ Database has ${userCount} users — skipping auto-seed.`);
            return;
        }
        console.log('🌱 No users found — creating default admin users...');
        const hash = (pw) => bcrypt.hashSync(pw, 10);
        await prisma.user.createMany({
            data: [
                {
                    id: 'ceo-1',
                    name: 'Roberto Méndez',
                    email: 'ceo@corpocrea.com',
                    password: hash('123'),
                    role: 'CEO',
                    avatar: 'https://ui-avatars.com/api/?name=Roberto+Mendez&background=000&color=fff',
                    position: 'CEO',
                    department: 'Dirección',
                },
                {
                    id: 'mgr-1',
                    name: 'Carlos Admin',
                    email: 'admin@corpocrea.com',
                    password: hash('123'),
                    role: 'MANAGER',
                    avatar: 'https://ui-avatars.com/api/?name=Carlos+Admin&background=1e3a5f&color=fff',
                    position: 'Gerente de Sistemas',
                    department: 'Tecnología',
                },
                {
                    id: 'it-1',
                    name: 'IT Corpocrea',
                    email: 'it@corpocrea.com',
                    password: hash('galipan2023'),
                    role: 'MANAGER',
                    avatar: 'https://ui-avatars.com/api/?name=IT+Corp&background=1e3a5f&color=fff',
                    position: 'Administrador IT',
                    department: 'Tecnología',
                },
            ],
        });
        console.log('✅ Default admin users created:');
        console.log('   - ceo@corpocrea.com / 123 (CEO)');
        console.log('   - admin@corpocrea.com / 123 (MANAGER)');
        console.log('   - it@corpocrea.com / galipan2023 (MANAGER)');
    }
    catch (err) {
        console.error('⚠️ Auto-seed failed (non-fatal):', err);
    }
}
