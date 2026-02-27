import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'corpocrea-secret-change-me';
export function generateToken(userId, role) {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}
export function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token requerido' });
        return;
    }
    try {
        const token = header.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    }
    catch {
        res.status(401).json({ error: 'Token inválido' });
    }
}
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            res.status(403).json({ error: 'Permisos insuficientes' });
            return;
        }
        next();
    };
}
