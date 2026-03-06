import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/events
router.get('/', async (_req, res) => {
  try {
    const events = await prisma.eventItem.findMany({ orderBy: { date: 'desc' } });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/events
router.post('/', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
  try {
    const { title, date, location, description } = req.body;
    const item = await prisma.eventItem.create({
      data: { title, date, location: location || '', description: description || '' },
    });
    res.status(201).json(item);
  } catch (err) {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
  try {
    await prisma.eventItem.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
