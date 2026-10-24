import User from '../models/user.model.js';
import { ROLES, ACCOUNT_STATUS, HTTP_STATUS } from '../constants/index.js';
import { signToken } from '../utils/token.js';

class AuthService {
  /**
   * Register a new user
   * Public registration always assigns regular USER role
   */
  async register({ name, email, password }) {
    // 1. Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // 2. Create user with regular USER role strictly enforced
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: ROLES.USER, // Strictly ignore/prevent client-provided roles
      status: ACCOUNT_STATUS.ACTIVE,
    });

    await user.save();

    // 3. Issue token
    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toSafeObject(),
      token,
    };
  }

  /**
   * Authenticate user with email and password
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch user including password field for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }

    // 2. Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }

    // 3. Check account status
    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      const error = new Error('Your account is deactivated. Please contact an administrator.');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // 4. Generate token
    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toSafeObject(),
      token,
    };
  }

  /**
   * Change user password with current password verification
   */
  async changePassword({ userId, currentPassword, newPassword }) {
    // 1. Fetch user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // 2. Verify current password
    const isCurrentValid = await user.comparePassword(currentPassword);
    if (!isCurrentValid) {
      const error = new Error('Current password is incorrect');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // 3. Set new password and save (triggers pre-save bcrypt hash)
    user.password = newPassword;
    await user.save();

    return {
      user: user.toSafeObject(),
    };
  }
}

export const authService = new AuthService();
export default authService;
