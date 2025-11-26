import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config.js';
import { gracefulShutdown } from './utils/gracefulShutdown.js';
// import { errorHandler, notFoundHandler } from './middleware/errorHandler';
// import routes from './routes';
import logger from './utils/logger.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.nodeEnv === 'production' ? ['https://yourdomain.com'] : '*',
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    memory: process.memoryUsage(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// API routes
// app.use('/api', routes);

// 404 handler (must be after all routes)
// app.use(notFoundHandler);

// Error handler (must be last)
// app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  logger.info(
    `🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`
  );
});

// Graceful shutdown
gracefulShutdown(server);

export default app;
