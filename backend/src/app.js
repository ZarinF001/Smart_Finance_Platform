import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CLIENT_URL
      if (!origin || origin === env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Body parsing with sensible limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parsing for HTTP-only JWT cookies
app.use(cookieParser());

// Lightweight request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root API welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Personal Finance Management API',
    version: '1.0.0',
    documentation: '/api/health for system status',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        changePassword: 'PATCH /api/auth/change-password',
      },
      categories: 'GET /api/categories',
      incomes: 'POST, GET /api/incomes, GET, PUT, DELETE /api/incomes/:id',
      expenses: 'POST, GET /api/expenses, GET, PUT, DELETE /api/expenses/:id',
      transactions: 'GET /api/transactions',
    },
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Catch unknown routes (404)
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
