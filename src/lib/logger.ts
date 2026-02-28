/**
 * Professional Logging Utility
 *
 * Provides safe logging that only outputs in development mode.
 * In production, logs are suppressed to prevent information disclosure.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('User logged in', { userId });
 *   logger.error('Failed to fetch data', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, ...args: any[]) {
    const enableProductionLogs = false;

    if (!this.isDevelopment && !enableProductionLogs) {
      // In production, only log errors to help with debugging critical issues
      if (level === 'error') {
        // In a real production app, send to error tracking service (Sentry, etc.)
        console.error('[ERROR]', message, ...args);
      }
      return;
    }

    // In development, log everything
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.log(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = new Logger();
