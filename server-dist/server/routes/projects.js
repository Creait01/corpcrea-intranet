import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// GET /api/projects
router.get('/', authMiddleware, async (_req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
                tasks: true,
                leader: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { deadline: 'asc' },
        });
        res.json(projects);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/projects/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: String(req.params.id) },
            include: {
                members: { include: { user: { select: { id: true, name: true, avatar: true, position: true } } } },
                tasks: { include: { assignedTo: { select: { id: true, name: true, avatar: true } } } },
                leader: { select: { id: true, name: true, avatar: true } },
            },
        });
        if (!project) {
            res.status(404).json({ error: 'No encontrado' });
            return;
        }
        res.json(project);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/projects
router.post('/', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
    try {
        const { name, description, status, deadline, leaderId, memberIds } = req.body;
        const project = await prisma.project.create({
            data: {
                name,
                description: description || '',
                status: status || 'PLANNING',
                deadline,
                leaderId,
                members: memberIds?.length
                    ? { create: memberIds.map((uid) => ({ userId: uid })) }
                    : undefined,
            },
            include: { members: true },
        });
        res.status(201).json(project);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== TASKS ==================
// GET /api/projects/:projectId/tasks
router.get('/:projectId/tasks', authMiddleware, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { projectId: String(req.params.projectId) },
            include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
            orderBy: { dueDate: 'asc' },
        });
        res.json(tasks);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/projects/:projectId/tasks
router.post('/:projectId/tasks', authMiddleware, async (req, res) => {
    try {
        const { title, description, assignedToUserId, status, progress, startDate, dueDate } = req.body;
        const task = await prisma.task.create({
            data: {
                projectId: String(req.params.projectId),
                title,
                description: description || '',
                assignedToUserId,
                status: status || 'TODO',
                progress: progress || 0,
                startDate,
                dueDate,
            },
        });
        res.status(201).json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/projects/tasks/:id
router.put('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const task = await prisma.task.update({
            where: { id: String(req.params.id) },
            data: req.body,
        });
        res.json(task);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
