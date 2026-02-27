import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// GET /api/documents
router.get('/', async (_req, res) => {
    try {
        const docs = await prisma.documentItem.findMany({ orderBy: { uploadDate: 'desc' } });
        res.json(docs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/documents
router.post('/', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        const doc = await prisma.documentItem.create({ data: req.body });
        res.status(201).json(doc);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// DELETE /api/documents/:id
router.delete('/:id', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        await prisma.documentItem.delete({ where: { id: String(req.params.id) } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
