type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || 'info'
);

export function handleError(error: any, context: string): { message: string; code: string } {
  const errorId = Math.random().toString(36).substr(2, 9);
  
  logger.error(`[${errorId}] Error in ${context}`, {
    message: error.message,
    stack: error.stack,
    name: error.name
  });

  if (error.code === 'ECONNREFUSED') {
    return {
      message: 'Backend service unavailable',
      code: 'SERVICE_UNAVAILABLE'
    };
  }

  if (error.response?.status === 401) {
    return {
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    };
  }

  if (error.response?.status === 403) {
    return {
      message: 'Access denied',
      code: 'ACCESS_DENIED'
    };
  }

  return {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  };
}