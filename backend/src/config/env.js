import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z
    .string()
    .default('mongodb://127.0.0.1:27017/personal_finance'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // JWT Configuration
  JWT_SECRET: z
    .string()
    .min(10, 'JWT_SECRET must be at least 10 characters long')
    .default('dev_super_secret_jwt_key_personal_finance_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Cookie Configuration
  COOKIE_EXPIRES_DAYS: z
    .string()
    .default('7')
    .transform((val) => parseInt(val, 10)),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000') // 15 minutes
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z
    .string()
    .default('30')
    .transform((val) => parseInt(val, 10)),

  // Admin Seed Account Configuration
  ADMIN_NAME: z.string().default('System Admin'),
  ADMIN_EMAIL: z.string().email().default('admin@personalfinance.local'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin@123456'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
