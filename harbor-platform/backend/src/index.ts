/**
 * HARBOR Main Server Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/index.js';
import { apiRouter } from './api/index.js';

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
}));

// CORS
app.use(cors({
    origin: config.nodeEnv === 'production'
        ? ['https://harbor.ai', 'https://api.harbor.ai']
        : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API routes
app.use(config.apiPrefix, apiRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        documentation: 'https://docs.harbor.ai',
    });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);

    res.status(500).json({
        error: 'Internal Server Error',
        message: config.nodeEnv === 'production' ? 'An unexpected error occurred' : err.message,
        ...(config.nodeEnv !== 'production' && { stack: err.stack }),
    });
});

// ============================================
// SERVER START
// ============================================

const server = app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⚓  HARBOR API Server                                   ║
║                                                           ║
║   Media-Native Audio & Video Data Infrastructure          ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   🌐 Server:     http://localhost:${config.port}                 ║
║   📡 API:        http://localhost:${config.port}${config.apiPrefix}             ║
║   🔧 Environment: ${config.nodeEnv.padEnd(20)}              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;
