export { User } from './user.model.js';
export { Category } from './category.model.js';
export { Income } from './income.model.js';
export { Expense } from './expense.model.js';

export default {
  User: (await import('./user.model.js')).User,
  Category: (await import('./category.model.js')).Category,
  Income: (await import('./income.model.js')).Income,
  Expense: (await import('./expense.model.js')).Expense,
};
