import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) return res.status(401).json({ message: 'No token provided'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalido o expirado'});
    }
};

export const checkRole = (role) => (req, res, next ) => {
    if (!role.includes(req.user.rol)) {
        return res.status(403).json({message: 'No tienes permiso para esta accion'});
    }
    next();
};