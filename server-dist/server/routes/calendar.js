import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// GET /api/calendar
router.get('/', async (_req, res) => {
    try {
        const events = await prisma.calendarEvent.findMany({ orderBy: { date: 'asc' } });
        res.json(events);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/calendar
router.post('/', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        const event = await prisma.calendarEvent.create({ data: req.body });
        res.status(201).json(event);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/calendar/:id
router.delete('/:id', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        await prisma.calendarEvent.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
