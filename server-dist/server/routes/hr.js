import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
// ================== LOANS ==================
// GET /api/hr/loans  (user's loans)
router.get('/loans', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const loans = await prisma.loan.findMany({
            where: { userId: authReq.userId },
            orderBy: { requestDate: 'desc' },
        });
        res.json(loans);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/hr/loans  (request a loan)
router.post('/loans', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const { amount, reason, paymentTermMonths, monthlyIncome } = req.body;
        const loan = await prisma.loan.create({
            data: {
                userId: authReq.userId,
                amount,
                balance: amount,
                status: 'PENDING',
                requestDate: new Date().toISOString().split('T')[0],
                reason,
                paymentTermMonths,
                monthlyIncome,
            },
        });
        res.status(201).json(loan);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/hr/loans/:id/approve
router.put('/loans/:id/approve', authMiddleware, async (req, res) => {
    try {
        const loan = await prisma.loan.update({
            where: { id: String(req.params.id) },
            data: { status: 'ACTIVE' },
        });
        res.json(loan);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/hr/loans/:id/reject
router.put('/loans/:id/reject', authMiddleware, async (req, res) => {
    try {
        const loan = await prisma.loan.update({
            where: { id: String(req.params.id) },
            data: { status: 'REJECTED' },
        });
        res.json(loan);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// GET /api/hr/loans/all  (admin — all loans)
router.get('/loans/all', authMiddleware, async (_req, res) => {
    try {
        const loans = await prisma.loan.findMany({
            include: { user: { select: { name: true, email: true, department: true } } },
            orderBy: { requestDate: 'desc' },
        });
        res.json(loans);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== VACATIONS ==================
// GET /api/hr/vacations (user's requests)
router.get('/vacations', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const requests = await prisma.vacationRequest.findMany({
            where: { userId: authReq.userId },
            orderBy: { requestDate: 'desc' },
        });
        res.json(requests);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/hr/vacations
router.post('/vacations', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const { startDate, endDate, days } = req.body;
        const request = await prisma.vacationRequest.create({
            data: {
                userId: authReq.userId,
                startDate,
                endDate,
                days,
                status: 'PENDING',
                requestDate: new Date().toISOString().split('T')[0],
            },
        });
        res.status(201).json(request);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// PUT /api/hr/vacations/:id/approve
router.put('/vacations/:id/approve', authMiddleware, async (req, res) => {
    try {
        const request = await prisma.vacationRequest.update({
            where: { id: String(req.params.id) },
            data: { status: 'APPROVED' },
        });
        res.json(request);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== DOCUMENT REQUESTS ==================
// GET /api/hr/document-requests
router.get('/document-requests', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const requests = await prisma.documentRequest.findMany({
            where: { userId: authReq.userId },
            orderBy: { requestDate: 'desc' },
        });
        res.json(requests);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/hr/document-requests
router.post('/document-requests', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const { type, additionalDetails } = req.body;
        const request = await prisma.documentRequest.create({
            data: {
                userId: authReq.userId,
                type,
                additionalDetails: additionalDetails || '',
                status: 'PENDING',
                requestDate: new Date().toISOString().split('T')[0],
            },
        });
        res.status(201).json(request);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// ================== SOCIAL BENEFITS ==================
// GET /api/hr/social-benefits
router.get('/social-benefits', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const requests = await prisma.socialBenefitsRequest.findMany({
            where: { userId: authReq.userId },
            orderBy: { requestDate: 'desc' },
        });
        res.json(requests);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
// POST /api/hr/social-benefits
router.post('/social-benefits', authMiddleware, async (req, res) => {
    try {
        const authReq = req;
        const { amount, reason } = req.body;
        const request = await prisma.socialBenefitsRequest.create({
            data: {
                userId: authReq.userId,
                amount,
                reason: reason || '',
                status: 'PENDING',
                requestDate: new Date().toISOString().split('T')[0],
            },
        });
        res.status(201).json(request);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno' });
    }
});
export default router;
