import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const notifications = await prisma.notification.findMany({
      where: { userId: authReq.userId },
      orderBy: { date: 'desc' },
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const n = await prisma.notification.update({
      where: { id: String(req.params.id) },
      data: { read: true },
    });
    res.json(n);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    await prisma.notification.updateMany({
      where: { userId: authReq.userId, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
