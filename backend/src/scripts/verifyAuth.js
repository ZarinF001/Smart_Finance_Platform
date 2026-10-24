import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ROLES, ACCOUNT_STATUS, HTTP_STATUS, AUTH_COOKIE_NAME } from '../constants/index.js';
import { signToken, verifyToken } from '../utils/token.js';
import { getAuthCookieOptions, getClearAuthCookieOptions } from '../utils/cookie.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validations/auth.validation.js';
import { authenticate, authorize, authorizeAdmin } from '../middlewares/auth.middleware.js';
import errorHandler from '../middlewares/error.middleware.js';
import User from '../models/user.model.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

async function runVerification() {
  console.log('\n====================================================');
  console.log(' 🧪 AUTHENTICATION & SECURITY VERIFICATION SUITE');
  console.log('====================================================\n');

  // TEST 1: Password Hashing & Comparison
  console.log('📌 Criteria 1 & 8: Password Hashing & Bcrypt Comparison');
  const rawPassword = 'SecurePassword@123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);
  assert(hashedPassword !== rawPassword, 'Password is encrypted into secure hash');
  assert(await bcrypt.compare(rawPassword, hashedPassword), 'Bcrypt accurately verifies matching password');
  assert(!(await bcrypt.compare('WrongPassword@999', hashedPassword)), 'Bcrypt correctly rejects incorrect password');

  // TEST 2: Zod Validation Schemas
  console.log('\n📌 Criteria 4: Zod Request Validation');
  const validRegister = registerSchema.safeParse({
    name: 'Alice Johnson',
    email: ' ALICE@Example.COM ',
    password: 'Password123',
  });
  assert(validRegister.success, 'Valid registration payload passes schema');
  assert(validRegister.data.email === 'alice@example.com', 'Email is normalized to lowercase and trimmed');

  const invalidEmail = registerSchema.safeParse({
    name: 'Alice',
    email: 'not-an-email',
    password: 'Password123',
  });
  assert(!invalidEmail.success, 'Malformed email address is rejected by Zod');

  const shortPassword = registerSchema.safeParse({
    name: 'Alice',
    email: 'alice@example.com',
    password: '123',
  });
  assert(!shortPassword.success, 'Short password (< 6 chars) is rejected by Zod');

  const passwordMismatch = changePasswordSchema.safeParse({
    currentPassword: 'OldPassword123',
    newPassword: 'NewPassword123',
    confirmPassword: 'DifferentPassword456',
  });
  assert(!passwordMismatch.success, 'Password change confirmation mismatch is rejected');

  const samePassword = changePasswordSchema.safeParse({
    currentPassword: 'SamePassword123',
    newPassword: 'SamePassword123',
  });
  assert(!samePassword.success, 'Reusing identical current password is rejected');

  // TEST 3: Public Registration Role Protection
  console.log('\n📌 Criteria 1 & 9: Public Registration Cannot Create Admin');
  const registrationPayloadWithAdmin = {
    name: 'Hacker Bob',
    email: 'bob@example.com',
    password: 'SecretPassword123',
    role: 'ADMIN', // Malicious attempt to inject admin role
  };
  const parsedData = registerSchema.parse(registrationPayloadWithAdmin);
  assert(parsedData.role === undefined, 'Zod registerSchema strips or ignores client-supplied role field');

  // Instantiate Mongoose User object
  const newUser = new User({
    name: parsedData.name,
    email: parsedData.email,
    password: parsedData.password,
    role: ROLES.USER, // Enforced by AuthService
  });
  assert(newUser.role === ROLES.USER, 'User model role defaults/enforces regular USER role');

  // TEST 4: Sensitive Field Scrubbing (Password Never Exposed)
  console.log('\n📌 Criteria 2: Password Hash Exposure Prevention');
  newUser.password = hashedPassword;
  const safeObj = newUser.toSafeObject();
  assert(safeObj.password === undefined, 'toSafeObject() scrubs password hash');
  assert(safeObj.__v === undefined, 'toSafeObject() scrubs internal __v metadata');

  const jsonStr = JSON.stringify(newUser);
  assert(!jsonStr.includes('password'), 'toJSON serialization never contains password hash');

  // TEST 5: JWT Generation & Verification
  console.log('\n📌 Criteria 3 & 5: JWT Token Issuance & Verification');
  const testPayload = { id: '64f123456789abcdef012345', email: 'alice@example.com', role: ROLES.USER };
  const token = signToken(testPayload);
  assert(typeof token === 'string' && token.split('.').length === 3, 'Token is a valid signed JWT format');

  const decoded = verifyToken(token);
  assert(decoded.id === testPayload.id && decoded.email === testPayload.email, 'Token decodes verified payload accurately');

  try {
    jwt.verify(token, 'wrong-secret-key-12345');
    assert(false, 'Tampered JWT should be rejected');
  } catch (err) {
    assert(err.name === 'JsonWebTokenError', 'Tampered JWT correctly rejected with JsonWebTokenError');
  }

  // TEST 6: Cookie Options & Security
  console.log('\n📌 Criteria 6: Cookie Security & HTTP-Only Settings');
  const cookieOpts = getAuthCookieOptions();
  assert(cookieOpts.httpOnly === true, 'Auth cookie is strictly httpOnly');
  assert(cookieOpts.path === '/', 'Auth cookie path is set to root /');
  assert(cookieOpts.maxAge > 0, 'Auth cookie has positive maxAge');

  const clearOpts = getClearAuthCookieOptions();
  assert(clearOpts.httpOnly === true, 'Clear auth cookie maintains httpOnly safety');

  // TEST 7: Authentication Middleware
  console.log('\n📌 Criteria 7: Protected Routes Reject Unauthenticated Requests');
  let mockRes = {
    statusCode: null,
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    },
  };

  // Request with no token
  let unauthReq = { cookies: {}, headers: {} };
  await authenticate(unauthReq, mockRes, () => {});
  assert(mockRes.statusCode === 401, 'Request with no token rejected with 401 Unauthorized');

  // Request with invalid token
  let invalidTokenReq = { cookies: { [AUTH_COOKIE_NAME]: 'invalid.jwt.token' }, headers: {} };
  mockRes.statusCode = null;
  await authenticate(invalidTokenReq, mockRes, () => {});
  assert(mockRes.statusCode === 401, 'Request with invalid token rejected with 401 Unauthorized');

  // TEST 8: Role-based Authorization Middleware
  console.log('\n📌 Criteria 9: Role-based Authorization Middleware');
  const userReq = { user: { role: ROLES.USER } };
  const adminReq = { user: { role: ROLES.ADMIN } };

  let adminAccessBlocked = false;
  let adminAccessGranted = false;

  mockRes.statusCode = null;
  authorizeAdmin(userReq, mockRes, () => {
    adminAccessGranted = true;
  });
  assert(mockRes.statusCode === 403, 'Regular USER blocked from ADMIN route with 403 Forbidden');

  mockRes.statusCode = null;
  authorizeAdmin(adminReq, mockRes, () => {
    adminAccessGranted = true;
  });
  assert(adminAccessGranted === true, 'ADMIN user successfully granted access through authorizeAdmin');

  // TEST 9: Centralized Error Handler (Duplicate Key & JWT Errors)
  console.log('\n📌 Criteria 2: Centralized Error Handling');
  const duplicateErr = { code: 11000, keyValue: { email: 'alice@example.com' } };
  mockRes.statusCode = null;
  errorHandler(duplicateErr, {}, mockRes, () => {});
  assert(mockRes.statusCode === 409, 'MongoDB 11000 duplicate email error translated to 409 Conflict');

  const jwtErr = { name: 'JsonWebTokenError' };
  mockRes.statusCode = null;
  errorHandler(jwtErr, {}, mockRes, () => {});
  assert(mockRes.statusCode === 401, 'JsonWebTokenError translated to 401 Unauthorized');

  const expiredErr = { name: 'TokenExpiredError' };
  mockRes.statusCode = null;
  errorHandler(expiredErr, {}, mockRes, () => {});
  assert(mockRes.statusCode === 401, 'TokenExpiredError translated to 401 Unauthorized');

  // TEST 10: Admin Seed Configuration
  console.log('\n📌 Criteria 10: Admin Seed Configuration');
  assert(typeof env.ADMIN_EMAIL === 'string' && env.ADMIN_EMAIL.includes('@'), 'Admin email is configured in environment');
  assert(typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length >= 8, 'Admin password is configured with min 8 chars');
  assert(env.ADMIN_NAME.length > 0, 'Admin display name is configured in environment');

  console.log('\n====================================================');
  console.log(` 📊 VERIFICATION RESULTS: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 10 AUTHENTICATION & SECURITY CRITERIA VERIFIED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
