import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import User from '../models/user.model.js';
import { ROLES, ACCOUNT_STATUS } from '../constants/index.js';

/**
 * Seed script to create initial system administrator account
 * Uses credentials configured in environment variables
 */
const seedAdmin = async () => {
  console.log('🌱 Starting admin user seed script...');

  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('❌ Cannot seed admin: Database connection could not be established.');
    console.error('💡 Please verify that MongoDB is running and MONGODB_URI is correctly configured.');
    process.exit(1);
  }

  try {
    const adminEmail = env.ADMIN_EMAIL.toLowerCase().trim();

    // Check if user already exists with the configured admin email
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      if (existingUser.role === ROLES.ADMIN) {
        console.log(`ℹ️ Admin account already exists for: ${adminEmail}`);
      } else {
        // Upgrade existing user to ADMIN
        existingUser.role = ROLES.ADMIN;
        existingUser.status = ACCOUNT_STATUS.ACTIVE;
        await existingUser.save();
        console.log(`✅ Existing user ${adminEmail} upgraded to ADMIN role successfully.`);
      }
    } else {
      // Create new administrator account
      const adminUser = new User({
        name: env.ADMIN_NAME.trim(),
        email: adminEmail,
        password: env.ADMIN_PASSWORD,
        role: ROLES.ADMIN,
        status: ACCOUNT_STATUS.ACTIVE,
      });

      await adminUser.save();
      console.log('====================================================');
      console.log(' ✅ Administrator Account Seeded Successfully');
      console.log(` 👤 Name:  ${adminUser.name}`);
      console.log(` 📧 Email: ${adminUser.email}`);
      console.log(` 🛡️ Role:  ${adminUser.role}`);
      console.log('====================================================');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    console.log('🌱 Admin seed script completed.');
  }
};

seedAdmin();
