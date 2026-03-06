import { Router } from 'express';
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
// ================== CORPORATE COMPANIES ==================
// GET /api/admin/corporate-companies (public for landing)
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
router.post('/corporate-companies', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
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
router.delete('/corporate-companies/:id', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        await prisma.corporateCompany.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
