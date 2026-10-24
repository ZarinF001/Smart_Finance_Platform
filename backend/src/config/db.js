import mongoose from 'mongoose';
import { env } from './env.js';
import { DB_CONNECTION_STATES } from '../constants/index.js';

// Setup connection lifecycle event handlers
mongoose.connection.on('connected', () => {
  console.log(`✅ [MongoDB] Connected to database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ [MongoDB] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ [MongoDB] Disconnected from database');
});

/**
 * Connect to MongoDB database
 * @returns {Promise<boolean>} Whether connection succeeded
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });
    console.log(`🚀 [MongoDB] Host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [MongoDB] Initial connection failed: ${error.message}`);
    console.warn(`💡 [MongoDB] Note: Backend is running, but database features require a running MongoDB instance at: ${env.MONGODB_URI}`);
    return false;
  }
};

/**
 * Get current database status summary
 * @returns {object} DB status details
 */
export const getDBStatus = () => {
  const readyState = mongoose.connection.readyState;
  return {
    state: DB_CONNECTION_STATES[readyState] || 'unknown',
    readyState,
    isConnected: readyState === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

/**
 * Gracefully close database connection
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 [MongoDB] Connection closed successfully');
  } catch (error) {
    console.error('❌ [MongoDB] Error closing connection:', error.message);
  }
};
