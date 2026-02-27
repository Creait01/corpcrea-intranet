import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/auth.js';
import newsRoutes from './routes/news.js';
import eventsRoutes from './routes/events.js';
import employeesRoutes from './routes/employees.js';
import documentsRoutes from './routes/documents.js';
import hrRoutes from './routes/hr.js';
import chatRoutes from './routes/chat.js';
import projectsRoutes from './routes/projects.js';
import calendarRoutes from './routes/calendar.js';
import trainingRoutes from './routes/training.js';
import notificationsRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Middleware
app.use(cors());
app.use(express.json());
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Serve static frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
// SPA fallback — any non-API route serves index.html
app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Corpocrea server running on port ${PORT}`);
});
