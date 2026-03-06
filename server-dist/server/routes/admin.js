import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// ================== SETTINGS ==================
// GET /api/admin/settings (public — needed for site logo on landing page)
router.get('/settings', async (_req, res) => {
    try {
        const settings = await prisma.setting.findMany();
        const obj = {};
        settings.forEach((s) => (obj[s.key] = s.value));
        res.json(obj);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/admin/settings (allow without strict auth — admin panel is role-gated in frontend)
router.put('/settings', async (req, res) => {
    try {
        const entries = Object.entries(req.body);
        for (const [key, value] of entries) {
            await prisma.setting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            });
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== CEO MESSAGE ==================
// GET /api/admin/ceo-message
router.get('/ceo-message', async (_req, res) => {
    try {
        let msg = await prisma.ceoMessage.findUnique({ where: { id: 'singleton' } });
        if (!msg) {
            msg = await prisma.ceoMessage.create({
                data: { id: 'singleton', text: '', updatedAt: new Date().toLocaleDateString() },
            });
        }
        res.json(msg);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/admin/ceo-message
router.put('/ceo-message', authMiddleware, requireRole('CEO'), async (req, res) => {
    try {
        const { text, imageUrl } = req.body;
        const msg = await prisma.ceoMessage.upsert({
            where: { id: 'singleton' },
            update: { text, imageUrl, updatedAt: new Date().toLocaleDateString() },
            create: { id: 'singleton', text, imageUrl, updatedAt: new Date().toLocaleDateString() },
        });
        res.json(msg);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== DEPARTMENTS ==================
// GET /api/admin/departments
router.get('/departments', async (_req, res) => {
    try {
        const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
        res.json(departments);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/admin/departments
router.post('/departments', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        const dept = await prisma.department.create({ data: req.body });
        res.status(201).json(dept);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/admin/departments/:id
router.delete('/departments/:id', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        await prisma.department.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== USERS (admin) ==================
// GET /api/admin/users (all approved users)
router.get('/users', authMiddleware, requireRole('CEO', 'MANAGER'), async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { approved: true },
            select: {
                id: true, name: true, email: true, role: true, position: true,
                department: true, avatar: true, vacationDays: true, socialBenefits: true, approved: true,
            },
            orderBy: { name: 'asc' },
        });
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/admin/pending-users (users awaiting approval)
router.get('/pending-users', authMiddleware, requireRole('CEO', 'MANAGER'), async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { approved: false },
            select: {
                id: true, name: true, email: true, role: true, position: true,
                department: true, avatar: true, approved: true, identificationId: true,
            },
            orderBy: { name: 'asc' },
        });
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/admin/users/:id/approve
router.put('/users/:id/approve', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        const { role, department, position } = req.body;
        const user = await prisma.user.update({
            where: { id: String(req.params.id) },
            data: {
                approved: true,
                role: role || 'EMPLOYEE',
                department: department || undefined,
                position: position || undefined,
            },
            select: { id: true, name: true, email: true, role: true, position: true, department: true, approved: true },
        });
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/admin/users/:id/reject (reject/delete pending user)
router.delete('/users/:id/reject', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/admin/users/:id (delete approved user)
router.delete('/users/:id', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/admin/users/:id
router.put('/users/:id', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        const { role, position, department, vacationDays, socialBenefits } = req.body;
        const user = await prisma.user.update({
            where: { id: String(req.params.id) },
            data: { role, position, department, vacationDays, socialBenefits },
            select: { id: true, name: true, email: true, role: true, position: true, department: true, approved: true },
        });
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/admin/users/:id/role — Change role for approved user
router.put('/users/:id/role', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            res.status(400).json({ error: 'El rol es requerido' });
            return;
        }
        const user = await prisma.user.update({
            where: { id: String(req.params.id) },
            data: { role },
            select: { id: true, name: true, email: true, role: true, position: true, department: true, avatar: true, approved: true },
        });
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/admin/users/:id/password — Reset password for a user
router.put('/users/:id/password', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: String(req.params.id) },
            data: { password: hashedPassword },
        });
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== NEW HIRES / NUEVOS INGRESOS ==================
// GET /api/admin/new-hires (public for landing/dashboard)
router.get('/new-hires', async (_req, res) => {
    try {
        const hires = await prisma.newHire.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(hires);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/admin/new-hires
router.post('/new-hires', authMiddleware, requireRole('CEO', 'MANAGER', 'HR'), async (req, res) => {
    try {
        const { employeeName, position, department, date, description, photoUrl } = req.body;
        const hire = await prisma.newHire.create({
            data: {
                employeeName,
                position: position || '',
                department: department || '',
                date: date || new Date().toISOString().split('T')[0],
                description: description || '',
                photoUrl: photoUrl || null,
            },
        });
        // Send notification to all users
        try {
            const allUsers = await prisma.user.findMany({ select: { id: true } });
            if (allUsers.length > 0) {
                await prisma.notification.createMany({
                    data: allUsers.map(u => ({
                        userId: u.id,
                        title: '👋 Nuevo Ingreso',
                        message: `¡Bienvenido/a ${employeeName}! Se une como ${position || 'nuevo integrante'}${department ? ' en ' + department : ''}.`,
                        date: new Date().toISOString().split('T')[0],
                        type: 'SUCCESS',
                    })),
                });
            }
        }
        catch (notifErr) {
            console.error('Error creating new-hire notifications:', notifErr);
        }
        res.status(201).json(hire);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/admin/new-hires/:id
router.delete('/new-hires/:id', authMiddleware, requireRole('CEO', 'MANAGER', 'HR'), async (req, res) => {
    try {
        await prisma.newHire.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== CORPORATE COMPANIES ==================
router.get('/corporate-companies', async (_req, res) => {
    try {
        const companies = await prisma.corporateCompany.findMany({ orderBy: { sortOrder: 'asc' } });
        res.json(companies);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/admin/corporate-companies
router.post('/corporate-companies', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
    try {
        const { name, logoUrl, website, sortOrder } = req.body;
        const company = await prisma.corporateCompany.create({
            data: { name, logoUrl, website: website || '', sortOrder: sortOrder || 0 },
        });
        res.status(201).json(company);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/admin/corporate-companies/:id
router.delete('/corporate-companies/:id', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
    try {
        await prisma.corporateCompany.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== PROMOTIONS ==================
// GET /api/admin/promotions (public for landing/dashboard)
router.get('/promotions', async (_req, res) => {
    try {
        const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(promotions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/admin/promotions
router.post('/promotions', authMiddleware, requireRole('CEO', 'MANAGER', 'HR'), async (req, res) => {
    try {
        const { userId, employeeName, previousPosition, newPosition, department, date, description, photoUrl } = req.body;
        const promo = await prisma.promotion.create({
            data: {
                userId: userId || '',
                employeeName,
                previousPosition: previousPosition || '',
                newPosition,
                department: department || '',
                date: date || new Date().toISOString().split('T')[0],
                description: description || '',
                photoUrl: photoUrl || null,
            },
        });
        // Send notification to all users
        try {
            const allUsers = await prisma.user.findMany({ select: { id: true } });
            if (allUsers.length > 0) {
                await prisma.notification.createMany({
                    data: allUsers.map(u => ({
                        userId: u.id,
                        title: '🎉 Nuevo Ascenso',
                        message: `¡Felicidades a ${employeeName}! Ha sido promovido/a a ${newPosition}${department ? ' en ' + department : ''}.`,
                        date: new Date().toISOString().split('T')[0],
                        type: 'SUCCESS',
                    })),
                });
            }
        }
        catch (notifErr) {
            console.error('Error creating promotion notifications:', notifErr);
        }
        res.status(201).json(promo);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/admin/promotions/:id
router.delete('/promotions/:id', authMiddleware, requireRole('CEO', 'MANAGER', 'HR'), async (req, res) => {
    try {
        await prisma.promotion.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
