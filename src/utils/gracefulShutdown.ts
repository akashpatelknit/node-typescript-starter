import type { Server } from 'http';
import logger from './logger.js';

export const gracefulShutdown = (server: Server) => {
  const shutdown = (signal: string) => {
    logger.info(`${signal} signal received: starting graceful shutdown`);

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed - no longer accepting connections');

      // All existing connections finished
      logger.info('All requests completed, exiting process');
      process.exit(0);
    });

    // Force shutdown after timeout (30 seconds)
    setTimeout(() => {
      logger.error('Forcing shutdown - timeout exceeded');
      process.exit(1);
    }, 30000);
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
