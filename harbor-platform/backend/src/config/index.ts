/**
 * HARBOR Backend Configuration
 * Environment-based configuration management
 */

import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export interface HarborConfig {
    // Server
    port: number;
    nodeEnv: string;

    // API
    apiVersion: string;
    apiPrefix: string;

    // Rate Limiting
    rateLimitWindow: number;
    rateLimitMax: number;

    // Database (placeholder)
    databaseUrl: string;

    // Storage (placeholder)
    storageEndpoint: string;
    storageBucket: string;

    // Authentication
    jwtSecret: string;
    jwtExpiresIn: string;

    // Logging
    logLevel: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] ?? defaultValue;
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}

function getEnvVarNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
}

export const config: HarborConfig = {
    // Server
    port: getEnvVarNumber('PORT', 3001),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),

    // API
    apiVersion: 'v1',
    apiPrefix: '/api',

    // Rate Limiting
    rateLimitWindow: getEnvVarNumber('RATE_LIMIT_WINDOW', 15 * 60 * 1000), // 15 minutes
    rateLimitMax: getEnvVarNumber('RATE_LIMIT_MAX', 100),

    // Database
    databaseUrl: getEnvVar('DATABASE_URL', 'postgresql://localhost:5432/harbor'),

    // Storage
    storageEndpoint: getEnvVar('STORAGE_ENDPOINT', 'http://localhost:9000'),
    storageBucket: getEnvVar('STORAGE_BUCKET', 'harbor-media'),

    // Authentication
    jwtSecret: getEnvVar('JWT_SECRET', 'development-secret-change-in-production'),
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),

    // Logging
    logLevel: getEnvVar('LOG_LEVEL', 'info'),
};

export default config;
