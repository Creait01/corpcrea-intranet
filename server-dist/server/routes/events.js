import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// GET /api/events
router.get('/', async (_req, res) => {
    try {
        const events = await prisma.eventItem.findMany({ orderBy: { date: 'desc' } });
        res.json(events);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/events
router.post('/', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
    try {
        const { title, date, location, description, imageUrl, videoUrl } = req.body;
        const item = await prisma.eventItem.create({
            data: { title, date, location: location || '', description: description || '', imageUrl: imageUrl || null, videoUrl: videoUrl || null },
        });
        // Send notification to all users
        try {
            const allUsers = await prisma.user.findMany({ select: { id: true } });
            if (allUsers.length > 0) {
                await prisma.notification.createMany({
                    data: allUsers.map(u => ({
                        userId: u.id,
                        title: '📅 Nuevo Evento',
                        message: `Se ha programado: ${title} — ${date}${location ? ' en ' + location : ''}`,
                        date: new Date().toISOString().split('T')[0],
                        type: 'INFO',
                    })),
                });
            }
        }
        catch (notifErr) {
            console.error('Error creating event notifications:', notifErr);
        }
        res.status(201).json(item);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/events/:id
router.put('/:id', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
    try {
        const item = await prisma.eventItem.update({
            where: { id: String(req.params.id) },
            data: req.body,
        });
        res.json(item);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/events/:id
router.delete('/:id', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
    try {
        await prisma.eventItem.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
