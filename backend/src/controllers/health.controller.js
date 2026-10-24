import { getDBStatus } from '../config/db.js';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/index.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * Controller for application health check
 */
export const getHealth = (req, res) => {
  const dbStatus = getDBStatus();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: dbStatus.isConnected ? 'healthy' : 'degraded',
    service: 'personal-finance-api',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      name: dbStatus.name,
      host: dbStatus.host,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
    },
  };

  return successResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: dbStatus.isConnected
      ? 'All services are operational'
      : 'API is running but database is not connected',
    data: healthData,
  });
};
