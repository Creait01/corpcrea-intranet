import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/employees
router.get('/', async (_req, res) => {
  try {
    const employees = await prisma.employee.findMany({ orderBy: { name: 'asc' } });
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/employees/month
router.get('/month', async (_req, res) => {
  try {
    const emp = await prisma.employee.findFirst({ where: { isMonthEmployee: true } });
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/employees/:id/month  (set as employee of month)
router.put('/:id/month', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
  try {
    // Reset all
    await prisma.employee.updateMany({ data: { isMonthEmployee: false } });
    const emp = await prisma.employee.update({
      where: { id: String(req.params.id) },
      data: { isMonthEmployee: true },
    });
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/employees
router.post('/', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
  try {
    const emp = await prisma.employee.create({ data: req.body });
    res.status(201).json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// PUT /api/employees/:id
router.put('/:id', authMiddleware, requireRole('CEO', 'MANAGER'), async (req, res) => {
  try {
    const emp = await prisma.employee.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
