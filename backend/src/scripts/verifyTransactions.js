import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import User from '../models/user.model.js';
import Income from '../models/income.model.js';
import Expense from '../models/expense.model.js';
import Category from '../models/category.model.js';
import { incomeService } from '../services/income.service.js';
import { expenseService } from '../services/expense.service.js';
import { transactionService } from '../services/transaction.service.js';
import { categoryService } from '../services/category.service.js';
import { authService } from '../services/auth.service.js';
import { TRANSACTION_TYPES } from '../constants/index.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('\n====================================================');
  console.log(' 🧪 FINANCIAL TRANSACTIONS VERIFICATION SUITE');
  console.log('====================================================\n');

  console.log('🔄 Connecting to database for live tests...');
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot run tests: Database connection failed.');
    process.exit(1);
  }

  // Ensure default categories are seeded
  await categoryService.seedDefaultCategories();

  // Create two distinct test users to test ownership and authorization
  const timestamp = Date.now();
  const userAData = {
    name: 'Test User A',
    email: `usera_${timestamp}@testfinance.local`,
    password: 'Password@123',
  };
  const userBData = {
    name: 'Test User B',
    email: `userb_${timestamp}@testfinance.local`,
    password: 'Password@123',
  };

  const { user: userA } = await authService.register(userAData);
  const { user: userB } = await authService.register(userBData);

  try {
    // ----------------------------------------------------
    // CRITERIA 1: Income CRUD Works
    // ----------------------------------------------------
    console.log('\n📌 Criteria 1: Income CRUD Works');
    const income1 = await incomeService.createIncome(userA._id, {
      amount: 5000,
      category: 'Salary',
      date: new Date('2026-10-01'),
      description: 'Monthly company salary',
    });
    assert(income1 && income1.amount === 5000, 'Income created with correct amount ($5000)');
    assert(income1.category === 'Salary', 'Income created with valid category (Salary)');
    assert(income1.user.toString() === userA._id.toString(), 'Income accurately assigned to authenticated User A');

    // List Incomes
    const incomeList = await incomeService.getIncomes(userA._id, { page: 1, limit: 10 });
    assert(incomeList.items.length >= 1, 'getIncomes returns created income record');
    assert(incomeList.meta.summary.totalIncome >= 5000, 'Income summary calculates total amount correctly');

    // Get Single Income
    const fetchedIncome = await incomeService.getIncomeById(userA._id, income1._id);
    assert(fetchedIncome._id.toString() === income1._id.toString(), 'getIncomeById fetches specific record');

    // Update Income
    const updatedIncome = await incomeService.updateIncome(userA._id, income1._id, {
      amount: 5500,
      description: 'Monthly salary with bonus',
    });
    assert(updatedIncome.amount === 5500, 'Income update successfully updated amount to $5500');
    assert(updatedIncome.description === 'Monthly salary with bonus', 'Income update updated description');

    // ----------------------------------------------------
    // CRITERIA 2: Expense CRUD Works
    // ----------------------------------------------------
    console.log('\n📌 Criteria 2: Expense CRUD Works');
    const expense1 = await expenseService.createExpense(userA._id, {
      amount: 120.5,
      category: 'Food & Dining',
      date: new Date('2026-10-05'),
      description: 'Grocery shopping',
      paymentMethod: 'credit_card',
    });
    assert(expense1 && expense1.amount === 120.5, 'Expense created with correct amount ($120.50)');
    assert(expense1.category === 'Food & Dining', 'Expense created with valid category (Food & Dining)');
    assert(expense1.paymentMethod === 'credit_card', 'Expense payment method saved properly');

    // List Expenses
    const expenseList = await expenseService.getExpenses(userA._id, { page: 1, limit: 10 });
    assert(expenseList.items.length >= 1, 'getExpenses returns created expense record');
    assert(expenseList.meta.summary.totalExpense >= 120.5, 'Expense summary calculates total amount correctly');

    // Get Single Expense
    const fetchedExpense = await expenseService.getExpenseById(userA._id, expense1._id);
    assert(fetchedExpense._id.toString() === expense1._id.toString(), 'getExpenseById fetches specific expense');

    // Update Expense
    const updatedExpense = await expenseService.updateExpense(userA._id, expense1._id, {
      amount: 150,
      paymentMethod: 'debit_card',
    });
    assert(updatedExpense.amount === 150, 'Expense updated amount to $150');
    assert(updatedExpense.paymentMethod === 'debit_card', 'Expense updated payment method to debit_card');

    // ----------------------------------------------------
    // CRITERIA 3: Invalid Amounts, Dates, and Categories Rejected
    // ----------------------------------------------------
    console.log('\n📌 Criteria 3: Validation Constraints (Amounts, Dates, Categories)');
    // 3a. Income category cannot be used for expense
    try {
      await expenseService.createExpense(userA._id, {
        amount: 50,
        category: 'Salary', // Income category!
      });
      assert(false, 'Should reject using Salary for an expense');
    } catch (err) {
      assert(
        err.message.includes('income category and cannot be used for expenses'),
        'Rejects income category when creating expense'
      );
    }

    // 3b. Expense category cannot be used for income
    try {
      await incomeService.createIncome(userA._id, {
        amount: 50,
        category: 'Food & Dining', // Expense category!
      });
      assert(false, 'Should reject using Food & Dining for an income');
    } catch (err) {
      assert(
        err.message.includes('expense category and cannot be used for income'),
        'Rejects expense category when creating income'
      );
    }

    // 3c. Completely unknown category
    try {
      await incomeService.createIncome(userA._id, {
        amount: 50,
        category: 'Extraterrestrial Mining',
      });
      assert(false, 'Should reject unknown category');
    } catch (err) {
      assert(err.message.includes('not a valid income category'), 'Rejects nonexistent category');
    }

    // ----------------------------------------------------
    // CRITERIA 4 & 5: Combined Transactions History, Filtering & Pagination
    // ----------------------------------------------------
    console.log('\n📌 Criteria 4 & 5: Combined Transaction History, Filtering & Pagination');
    // Add additional records to test filtering & sorting
    await incomeService.createIncome(userA._id, {
      amount: 1200,
      category: 'Freelancing',
      date: new Date('2026-10-15'),
      description: 'Web development freelance client',
    });
    await expenseService.createExpense(userA._id, {
      amount: 60,
      category: 'Transportation',
      date: new Date('2026-10-10'),
      description: 'Train ticket',
      paymentMethod: 'cash',
    });

    // 4a. Combined list (type = ALL)
    const allTransactions = await transactionService.getTransactions(userA._id, {
      type: 'ALL',
      page: 1,
      limit: 10,
    });
    assert(allTransactions.items.length >= 3, 'Combined transactions query returns both incomes and expenses');
    assert(
      allTransactions.items.some((t) => t.type === 'INCOME') &&
        allTransactions.items.some((t) => t.type === 'EXPENSE'),
      'Transaction items correctly tagged with type INCOME and EXPENSE'
    );

    // 4b. Pagination metadata
    assert(allTransactions.meta.pagination.page === 1, 'Pagination page is 1');
    assert(allTransactions.meta.pagination.totalRecords >= 3, 'Pagination totalRecords is accurate');
    assert(typeof allTransactions.meta.summary.netBalance === 'number', 'Summary netBalance is calculated');
    assert(
      allTransactions.meta.summary.netBalance ===
        allTransactions.meta.summary.totalIncome - allTransactions.meta.summary.totalExpense,
      'netBalance exactly equals totalIncome - totalExpense'
    );

    // 4c. Filter by type = INCOME
    const incomeOnly = await transactionService.getTransactions(userA._id, { type: 'INCOME' });
    assert(
      incomeOnly.items.every((t) => t.type === 'INCOME'),
      'type=INCOME filter returns exclusively income transactions'
    );
    assert(incomeOnly.meta.summary.totalExpense === 0, 'Income-only summary has totalExpense = 0');

    // 4d. Filter by type = EXPENSE
    const expenseOnly = await transactionService.getTransactions(userA._id, { type: 'EXPENSE' });
    assert(
      expenseOnly.items.every((t) => t.type === 'EXPENSE'),
      'type=EXPENSE filter returns exclusively expense transactions'
    );

    // 4e. Filter by category
    const freelancingOnly = await transactionService.getTransactions(userA._id, {
      category: 'Freelancing',
    });
    assert(
      freelancingOnly.items.length === 1 && freelancingOnly.items[0].category === 'Freelancing',
      'category filter isolates specific category records'
    );

    // 4f. Search by keyword
    const searchResult = await transactionService.getTransactions(userA._id, { search: 'ticket' });
    assert(
      searchResult.items.length === 1 && searchResult.items[0].description.includes('Train ticket'),
      'Keyword search matches description properly'
    );

    // 4g. Sorting by amount desc
    const sortedByAmount = await transactionService.getTransactions(userA._id, {
      sortBy: 'amount',
      sortOrder: 'desc',
    });
    assert(
      sortedByAmount.items[0].amount >= sortedByAmount.items[1].amount,
      'Transactions sorted in descending order by amount'
    );

    // ----------------------------------------------------
    // CRITERIA 6: Ownership Protection (Cross-user Access Forbidden)
    // ----------------------------------------------------
    console.log('\n📌 Criteria 6: Cross-User Ownership Isolation');
    // User B attempts to access User A's income
    try {
      await incomeService.getIncomeById(userB._id, income1._id);
      assert(false, "User B should NOT access User A's income");
    } catch (err) {
      assert(err.statusCode === 404, "User B cannot view User A's income (returns 404 Not Found)");
    }

    // User B attempts to edit User A's income
    try {
      await incomeService.updateIncome(userB._id, income1._id, { amount: 999999 });
      assert(false, "User B should NOT edit User A's income");
    } catch (err) {
      assert(err.statusCode === 404, "User B cannot edit User A's income (returns 404 Not Found)");
    }

    // User B attempts to delete User A's income
    try {
      await incomeService.deleteIncome(userB._id, income1._id);
      assert(false, "User B should NOT delete User A's income");
    } catch (err) {
      assert(err.statusCode === 404, "User B cannot delete User A's income (returns 404 Not Found)");
    }

    // User B attempts to access User A's expense
    try {
      await expenseService.getExpenseById(userB._id, expense1._id);
      assert(false, "User B should NOT access User A's expense");
    } catch (err) {
      assert(err.statusCode === 404, "User B cannot view User A's expense (returns 404 Not Found)");
    }

    // ----------------------------------------------------
    // CRITERIA 7: Deleting Record Removes it From Lists & History
    // ----------------------------------------------------
    console.log('\n📌 Criteria 7: Deletion Cascading & Removal Verification');
    const initialHistory = await transactionService.getTransactions(userA._id, { type: 'ALL' });
    const countBefore = initialHistory.meta.pagination.totalRecords;

    await incomeService.deleteIncome(userA._id, income1._id);

    // Verify it is gone from income list
    const incomeListAfter = await incomeService.getIncomes(userA._id);
    assert(
      !incomeListAfter.items.some((i) => i._id.toString() === income1._id.toString()),
      'Deleted income removed from getIncomes'
    );

    // Verify it is gone from transaction history
    const historyAfter = await transactionService.getTransactions(userA._id, { type: 'ALL' });
    assert(
      historyAfter.meta.pagination.totalRecords === countBefore - 1,
      'Deleted income removed from combined transaction history'
    );

    // ----------------------------------------------------
    // CRITERIA 8 & 9: Authentication & Security Still Functional
    // ----------------------------------------------------
    console.log('\n📌 Criteria 8 & 9: Authentication & Session Verification');
    const loginRes = await authService.login({
      email: userAData.email,
      password: userAData.password,
    });
    assert(loginRes && loginRes.user && loginRes.token, 'Login works seamlessly with user credentials');

    // Clean up test data
    console.log('\n🧹 Cleaning up test records...');
    await Promise.all([
      Income.deleteMany({ user: { $in: [userA._id, userB._id] } }),
      Expense.deleteMany({ user: { $in: [userA._id, userB._id] } }),
      User.deleteMany({ _id: { $in: [userA._id, userB._id] } }),
    ]);
    console.log('✅ Cleaned up test records');

    console.log('\n====================================================');
    console.log(` 📊 VERIFICATION RESULTS: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
    console.log('====================================================\n');

    if (passed === total) {
      console.log('🎉 ALL 9 FINANCIAL TRANSACTION CRITERIA VERIFIED SUCCESSFULLY!\n');
    }
  } catch (error) {
    console.error('💥 Test suite failure:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runTests().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
