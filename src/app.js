import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { requestLogger } from './middlewares/logger.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Log rapido para desarrollo
app.use(requestLogger); // Log de auditoria obligatorio

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/routes', orderRoutes);

// Manejo Global de Errores
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Error interno del servidor'
    });
});

export default app;