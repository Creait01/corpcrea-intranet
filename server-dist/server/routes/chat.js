import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
// GET /api/chat/channels
router.get('/channels', authMiddleware, async (_req, res) => {
    try {
        const channels = await prisma.chatChannel.findMany({
            include: {
                messages: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
            },
        });
        res.json(channels);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/chat/channels/:id/messages
router.get('/channels/:id/messages', authMiddleware, async (req, res) => {
    try {
        const messages = await prisma.chatMessage.findMany({
            where: { channelId: String(req.params.id) },
            orderBy: { timestamp: 'asc' },
        });
        res.json(messages);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/chat/channels/:id/messages
router.post('/channels/:id/messages', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const user = await prisma.user.findUnique({ where: { id: authReq.userId } });
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        const message = await prisma.chatMessage.create({
            data: {
                channelId: String(req.params.id),
                senderId: user.id,
                senderName: user.name,
                text: req.body.text,
                timestamp: new Date(),
            },
        });
        res.status(201).json(message);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/chat/channels  (create)
router.post('/channels', authMiddleware, async (req, res) => {
    try {
        const { name, type, participants } = req.body;
        const channel = await prisma.chatChannel.create({
            data: {
                name,
                type: type || 'GROUP',
                participants: participants || ['all'],
            },
        });
        res.status(201).json(channel);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
