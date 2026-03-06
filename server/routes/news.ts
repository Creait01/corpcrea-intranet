import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/news
router.get('/', async (_req, res) => {
  try {
    const news = await prisma.newsItem.findMany({ orderBy: { date: 'desc' } });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/news/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.newsItem.findUnique({ where: { id: String(req.params.id) } });
    if (!item) { res.status(404).json({ error: 'No encontrado' }); return; }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/news  (admin only)
router.post('/', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
  try {
    const { title, description, imageUrl, videoUrl, type } = req.body;
    const item = await prisma.newsItem.create({
      data: {
        title,
        description: description || '',
        imageUrl,
        videoUrl,
        type: type || 'IMAGE',
        date: new Date().toISOString().split('T')[0],
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/news/:id
router.put('/:id', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
  try {
    const item = await prisma.newsItem.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DELETE /api/news/:id
router.delete('/:id', authMiddleware, requireRole('CEO', 'MANAGER', 'CONTENT_MANAGER'), async (req, res) => {
  try {
    await prisma.newsItem.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
