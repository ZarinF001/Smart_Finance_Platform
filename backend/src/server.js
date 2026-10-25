import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { categoryService } from './services/category.service.js';

let server;

const startServer = async () => {
  try {
    // Attempt database connection
    console.log('🔄 Connecting to MongoDB database...');
    const connected = await connectDB();
    if (connected) {
      await categoryService.seedDefaultCategories();
    }

    // Start Express HTTP server
    server = app.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(' 💰 Split Easy API');
      console.log(` 🚀 Server running at: http://localhost:${env.PORT}`);
      console.log(` 🌐 Health endpoint:  http://localhost:${env.PORT}/api/health`);
      console.log(` 🔒 Environment:      ${env.NODE_ENV}`);
      console.log(` 🔗 Allowed Origin:   ${env.CLIENT_URL}`);
      console.log('====================================================');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${env.PORT} is already in use by another process.`);
        console.error(`💡 Tip: Run "Stop-Process -Id (Get-NetTCPConnection -LocalPort ${env.PORT}).OwningProcess -Force" to free the port.`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      console.log('🔒 HTTP server closed');
      await disconnectDB();
      console.log('👋 Process exiting clean.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception thrown:', err);
  process.exit(1);
});

startServer();
