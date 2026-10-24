export { authService } from './auth.service.js';
export { categoryService } from './category.service.js';
export { incomeService } from './income.service.js';
export { expenseService } from './expense.service.js';
export { transactionService } from './transaction.service.js';

export default {
  authService: (await import('./auth.service.js')).authService,
  categoryService: (await import('./category.service.js')).categoryService,
  incomeService: (await import('./income.service.js')).incomeService,
  expenseService: (await import('./expense.service.js')).expenseService,
  transactionService: (await import('./transaction.service.js')).transactionService,
};
