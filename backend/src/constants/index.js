export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const DB_CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const AUTH_COOKIE_NAME = 'token';

export const TRANSACTION_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
};

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Investment',
  'Gifts',
  'Other',
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Education',
  'Shopping',
  'Healthcare',
  'Entertainment',
  'Bills & Utilities',
  'Other',
];

export const PAYMENT_METHODS = [
  'cash',
  'credit_card',
  'debit_card',
  'bank_transfer',
  'mobile_payment',
  'other',
];
