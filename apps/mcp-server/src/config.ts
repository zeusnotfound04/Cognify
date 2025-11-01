import { logger } from './logger.js';

interface EnvConfig {
  NODE_ENV: string;
  BACKEND_URL: string;
  LOG_LEVEL: string;
}

const requiredEnvVars = ['BACKEND_URL'];

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  const backendUrl = process.env.BACKEND_URL;
  if (backendUrl && !backendUrl.startsWith('http')) {
    errors.push('BACKEND_URL must start with http:// or https://');
  }
  
  const logLevel = process.env.LOG_LEVEL;
  if (logLevel && !['error', 'warn', 'info', 'debug'].includes(logLevel)) {
    errors.push('LOG_LEVEL must be one of: error, warn, info, debug');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function getConfig(): EnvConfig {
  const validation = validateEnvironment();
  
  if (!validation.valid) {
    logger.error('Environment validation failed', { errors: validation.errors });
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
  }
  
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    BACKEND_URL: process.env.BACKEND_URL!,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
  };
}