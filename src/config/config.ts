import dotenvFlow from 'dotenv-flow';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
dotenvFlow.config({
  path: path.join(__dirname, '../..'),
  node_env: process.env.NODE_ENV || 'development',
  silent: false,
});

interface EnvConfig {
  nodeEnv: string;
  port: number;
  appName: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  apiKey: string;
  jwtSecret: string;
  logLevel: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

export const config: EnvConfig = {
  nodeEnv: getEnvVariable('NODE_ENV', 'development'),
  port: parseInt(getEnvVariable('PORT', '3000'), 10),
  appName: getEnvVariable('APP_NAME', 'my-app'),
  database: {
    host: getEnvVariable('DB_HOST', 'localhost'),
    port: parseInt(getEnvVariable('DB_PORT', '5432'), 10),
    name: getEnvVariable('DB_NAME'),
    user: getEnvVariable('DB_USER'),
    password: getEnvVariable('DB_PASSWORD'),
  },
  apiKey: getEnvVariable('API_KEY'),
  jwtSecret: getEnvVariable('JWT_SECRET'),
  logLevel: getEnvVariable('LOG_LEVEL', 'info'),
};

export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';
export const isTest = config.nodeEnv === 'test';

// Log which environment files were loaded (only in development)
if (isDevelopment) {
  console.log('Environment loaded:', config.nodeEnv);
}
