import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
// GET /api/training
router.get('/', async (_req, res) => {
    try {
        const modules = await prisma.trainingModule.findMany({
            include: { _count: { select: { completions: true } } },
        });
        res.json(modules);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/training/completions (user's completions)
router.get('/completions', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const completions = await prisma.trainingCompletion.findMany({
            where: { userId: authReq.userId },
            select: { trainingId: true },
        });
        res.json(completions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/training/:id/complete
router.post('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const completion = await prisma.trainingCompletion.create({
            data: {
                trainingId: String(req.params.id),
                userId: authReq.userId,
            },
        });
        res.status(201).json(completion);
    }
    catch (err) {
        if (err?.code === 'P2002') {
            res.status(409).json({ error: 'Ya completaste este módulo' });
            return;
        }
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
