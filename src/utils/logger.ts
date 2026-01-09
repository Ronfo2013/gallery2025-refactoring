/**
 * Production-ready Logger
 *
 * Centralizes all logging with environment-aware behavior:
 * - Development: Full logging to console
 * - Production: Only warnings and errors
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('Debug info', { data });
 *   logger.info('User logged in', userId);
 *   logger.warn('Deprecated API used');
 *   logger.error('Failed to fetch', error);
 */

/* eslint-disable no-console */

interface LoggerConfig {
  isDevelopment: boolean;
  enableDebug: boolean;
  enableInfo: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      isDevelopment: import.meta.env.DEV,
      enableDebug: import.meta.env.DEV,
      enableInfo: import.meta.env.DEV,
    };
  }

  /**
   * Debug logs - only in development
   * Use for verbose debugging information
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.enableDebug) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Info logs - only in development
   * Use for general informational messages
   */
  info(message: string, ...args: any[]): void {
    if (this.config.enableInfo) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Warning logs - always logged
   * Use for deprecated features or potential issues
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Error logs - always logged
   * Use for actual errors that need attention
   *
   * In production, these should be sent to error tracking (e.g., Sentry)
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}`, {
        message: error.message,
        stack: error.stack,
        ...args,
      });
    } else {
      console.error(`[ERROR] ${message}`, error, ...args);
    }

    // TODO: Send to Sentry in production
    // if (!this.config.isDevelopment && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: { message, args } });
    // }
  }

  /**
   * Group logs (development only)
   * Useful for grouping related log statements
   */
  group(label: string): void {
    if (this.config.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.config.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Time measurement (development only)
   * Useful for performance profiling
   */
  time(label: string): void {
    if (this.config.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.config.isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Table display (development only)
   * Useful for displaying arrays/objects in tabular format
   */
  table(data: any): void {
    if (this.config.isDevelopment) {
      console.table(data);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
