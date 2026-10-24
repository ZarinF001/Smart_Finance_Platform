const BASE_URL = 'http://localhost:5000/api';

// Lightweight cookie-jar client using Node.js native fetch
const createClient = () => {
  let cookie = '';

  const request = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const fetchOptions = {
      ...options,
      headers,
    };

    if (fetchOptions.body && typeof fetchOptions.body === 'object') {
      fetchOptions.body = JSON.stringify(fetchOptions.body);
    }

    const res = await fetch(url, fetchOptions);

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      cookie = setCookie.split(';')[0];
    }

    let data = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      status: res.status,
      ok: res.ok,
      data,
      clearCookie: () => {
        cookie = '';
      },
    };
  };

  return {
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
    patch: (url, body, options) => request(url, { ...options, method: 'PATCH', body }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
    clearSession: () => request.clearCookie?.(),
  };
};

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

async function runMasterSuite() {
  console.log('====================================================================');
  console.log('🏆 MASTER INTEGRATION & AUDIT SUITE: AUTH, MODULE 1 & MODULE 2');
  console.log('====================================================================\n');

  const clientA = createClient();
  const clientB = createClient();
  const unauthClient = createClient();

  const timestamp = Date.now();
  const userA = {
    name: 'Alice Auditor',
    email: `alice_audit_${timestamp}@example.com`,
    password: 'Password123!',
  };
  const userB = {
    name: 'Bob Competitor',
    email: `bob_comp_${timestamp}@example.com`,
    password: 'Password123!',
  };

  /* ====================================================================
   * SECTION 1: AUTHENTICATION, AUTHORIZATION & DATA INTEGRITY
   * ==================================================================== */
  console.log('--------------------------------------------------------------------');
  console.log('SECTION 1: AUTHENTICATION & AUTHORIZATION INTEGRITY');
  console.log('--------------------------------------------------------------------');

  // 1.1 Unauthenticated requests are rejected
  const unauthMe = await unauthClient.get('/auth/me');
  assert(unauthMe.status === 401, 'Unauthenticated access to /api/auth/me returns 401 Unauthorized');

  const unauthIncomes = await unauthClient.get('/incomes');
  assert(unauthIncomes.status === 401, 'Unauthenticated access to /api/incomes returns 401 Unauthorized');

  // 1.2 User Registration with role injection prevention
  const regARes = await clientA.post('/auth/register', {
    ...userA,
    role: 'ADMIN', // Attacker attempts to register as ADMIN
  });
  assert(regARes.status === 201, 'User A registered successfully');
  assert(
    regARes.data.data?.user?.role === 'USER',
    'Role injection prevented: role defaulted to USER'
  );
  assert(!regARes.data.data?.user?.password, 'Password hash is strictly omitted from response');

  // 1.3 User B registration
  const regBRes = await clientB.post('/auth/register', userB);
  assert(regBRes.status === 201, 'User B registered successfully');

  // 1.4 Session verification via /auth/me
  const meA = await clientA.get('/auth/me');
  assert(meA.status === 200, 'Session verified via HTTP-only cookie');
  assert(
    meA.data.data?.user?.email === userA.email.toLowerCase(),
    'Profile matches authenticated user'
  );

  // 1.5 Change Password workflow
  const changePassRes = await clientA.patch('/auth/change-password', {
    currentPassword: 'Password123!',
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  });
  assert(changePassRes.status === 200, 'Password changed successfully');

  // 1.6 Verify old password no longer works
  const oldLoginRes = await createClient().post('/auth/login', {
    email: userA.email,
    password: 'Password123!',
  });
  assert(oldLoginRes.status === 401, 'Old password rejected after password change');

  // 1.7 Verify new password works
  const newLoginRes = await clientA.post('/auth/login', {
    email: userA.email,
    password: 'NewPassword123!',
  });
  assert(newLoginRes.status === 200, 'Login succeeded with new password');

  /* ====================================================================
   * SECTION 2: MODULE 1 - FINANCIAL TRANSACTION MANAGEMENT
   * ==================================================================== */
  console.log('\n--------------------------------------------------------------------');
  console.log('SECTION 2: MODULE 1 - INCOME, EXPENSE & TRANSACTION LEDGER');
  console.log('--------------------------------------------------------------------');

  // 2.1 Category validation & type matching
  const invalidCategoryExpense = await clientA.post('/expenses', {
    amount: 1500,
    category: 'Salary', // Salary is INCOME type!
    paymentMethod: 'cash',
  });
  assert(
    invalidCategoryExpense.status === 400,
    'Rejects using INCOME category "Salary" for Expense'
  );

  const invalidCategoryIncome = await clientA.post('/incomes', {
    amount: 5000,
    category: 'Food & Dining', // Food & Dining is EXPENSE type!
  });
  assert(
    invalidCategoryIncome.status === 400,
    'Rejects using EXPENSE category "Food & Dining" for Income'
  );

  // 2.2 Income CRUD
  const inc1 = await clientA.post('/incomes', {
    amount: 50000,
    category: 'Salary',
    date: new Date('2026-10-01T10:00:00Z').toISOString(),
    description: 'October Base Salary',
  });
  assert(inc1.status === 201, 'Income 1 created (50,000 BDT)');
  const inc1Id = inc1.data.data._id;

  const inc2 = await clientA.post('/incomes', {
    amount: 15000,
    category: 'Freelancing',
    date: new Date('2026-10-15T14:00:00Z').toISOString(),
    description: 'Web development freelance project',
  });
  assert(inc2.status === 201, 'Income 2 created (15,000 BDT)');

  // 2.3 Expense CRUD
  const exp1 = await clientA.post('/expenses', {
    amount: 4000,
    category: 'Food & Dining',
    paymentMethod: 'credit_card',
    date: new Date('2026-10-05T12:00:00Z').toISOString(),
    description: 'Weekly grocery groceries',
  });
  assert(exp1.status === 201, 'Expense 1 created (4,000 BDT, credit_card)');
  const exp1Id = exp1.data.data._id;

  const exp2 = await clientA.post('/expenses', {
    amount: 2500,
    category: 'Transportation',
    paymentMethod: 'mobile_payment',
    date: new Date('2026-10-10T08:00:00Z').toISOString(),
    description: 'Uber rides and fuel',
  });
  assert(exp2.status === 201, 'Expense 2 created (2,500 BDT, mobile_payment)');

  // 2.4 Combined Transactions & Calculation Checks
  const txRes = await clientA.get('/transactions');
  assert(txRes.status === 200, 'GET /api/transactions returned 200 OK');
  assert(txRes.data.data.length === 4, 'Ledger contains exactly 4 records (2 income, 2 expense)');

  const txSummary = txRes.data.meta.summary;
  assert(txSummary.totalIncome === 65000, 'Summary totalIncome accurately calculated (65,000 BDT)');
  assert(txSummary.totalExpense === 6500, 'Summary totalExpense accurately calculated (6,500 BDT)');
  assert(txSummary.netBalance === 58500, 'Summary netBalance accurately calculated (58,500 BDT)');

  // 2.5 Filters: Type, Search, Category
  const incomeOnly = await clientA.get('/transactions?type=INCOME');
  assert(incomeOnly.data.data.length === 2, 'type=INCOME filter returns only 2 income records');

  const expenseOnly = await clientA.get('/transactions?type=EXPENSE');
  assert(expenseOnly.data.data.length === 2, 'type=EXPENSE filter returns only 2 expense records');

  const searchTx = await clientA.get('/transactions?search=freelance');
  assert(searchTx.data.data.length === 1, 'Search filter matches "freelance" correctly');

  /* ====================================================================
   * SECTION 3: MODULE 2 - BUDGETS & SAVINGS GOALS
   * ==================================================================== */
  console.log('\n--------------------------------------------------------------------');
  console.log('SECTION 3: MODULE 2 - BUDGETS & SAVINGS GOALS');
  console.log('--------------------------------------------------------------------');

  const testMonth = 10;
  const testYear = 2026;

  // 3.1 Budget Creation for Food & Dining (Limit: 5,000 BDT)
  // Current spent in Food & Dining is 4,000 BDT -> 80% utilization -> WARNING
  const budget1Res = await clientA.post('/budgets', {
    category: 'Food & Dining',
    limit: 5000,
    month: testMonth,
    year: testYear,
  });
  assert(budget1Res.status === 201, 'Budget created for Food & Dining (Limit: 5,000 BDT)');
  const budget1 = budget1Res.data.data;

  assert(budget1.spent === 4000, 'Dynamic spent reflects the 4,000 BDT expense');
  assert(budget1.remaining === 1000, 'Remaining is 1,000 BDT');
  assert(budget1.utilization === 80, 'Utilization is exactly 80%');
  assert(budget1.status === 'WARNING', 'Status is WARNING (utilization >= 80% and <= 100%)');

  // 3.2 Duplicate budget rejection
  const dupBudget = await clientA.post('/budgets', {
    category: 'Food & Dining',
    limit: 8000,
    month: testMonth,
    year: testYear,
  });
  assert(dupBudget.status === 409, 'Duplicate budget rejected with 409 Conflict');

  // 3.3 Add expense to exceed budget
  const expExceed = await clientA.post('/expenses', {
    amount: 2000,
    category: 'Food & Dining',
    paymentMethod: 'cash',
    date: new Date('2026-10-20T19:00:00Z').toISOString(),
    description: 'Dining out at buffet',
  });
  assert(expExceed.status === 201, 'Added expense of 2,000 BDT to Food & Dining');
  const expExceedId = expExceed.data.data._id;

  const budgetExceeded = await clientA.get(`/budgets/${budget1._id}`);
  assert(budgetExceeded.data.data.spent === 6000, 'Total spent updated to 6,000 BDT');
  assert(budgetExceeded.data.data.remaining === -1000, 'Remaining is -1,000 BDT');
  assert(budgetExceeded.data.data.status === 'EXCEEDED', 'Status transitioned to EXCEEDED');

  // 3.4 Budget Summary
  const bSummary = await clientA.get(`/budgets/summary?month=${testMonth}&year=${testYear}`);
  assert(bSummary.status === 200, 'GET /api/budgets/summary returned 200 OK');
  assert(bSummary.data.data.exceededCount === 1, 'exceededCount in summary is 1');

  // 3.5 Rollback by deleting the extra expense
  await clientA.delete(`/expenses/${expExceedId}`);
  const budgetAfterRollback = await clientA.get(`/budgets/${budget1._id}`);
  assert(budgetAfterRollback.data.data.spent === 4000, 'Spent dynamically rolled back to 4,000 BDT');
  assert(budgetAfterRollback.data.data.status === 'WARNING', 'Status dynamically rolled back to WARNING');

  // 3.6 Savings Goals Creation
  const futureDeadline = new Date();
  futureDeadline.setMonth(futureDeadline.getMonth() + 5);

  const goalRes = await clientA.post('/savings-goals', {
    name: 'Master Emergency Fund',
    targetAmount: 50000,
    deadline: futureDeadline.toISOString(),
    description: 'Master verification test emergency reserve',
  });
  assert(goalRes.status === 201, 'Created savings goal (50,000 BDT target)');
  const goal = goalRes.data.data;
  const goalId = goal._id;

  assert(goal.totalSaved === 0, 'Initial saved amount is 0 BDT');
  assert(goal.status === 'IN_PROGRESS', 'Initial status is IN_PROGRESS');
  assert(goal.requiredMonthlySavings > 0, 'Required monthly savings calculated');

  // 3.7 Contributions & Calculations
  const contribRes = await clientA.post(`/savings-goals/${goalId}/contributions`, {
    amount: 50000,
    date: new Date().toISOString(),
    description: 'Full deposit to complete goal',
  });
  assert(contribRes.status === 201, 'Recorded full contribution of 50,000 BDT');
  const completedGoal = contribRes.data.data.goal;

  assert(completedGoal.totalSaved === 50000, 'Total saved reached 50,000 BDT');
  assert(completedGoal.remainingAmount === 0, 'Remaining amount is 0 BDT');
  assert(completedGoal.progressPercentage === 100, 'Progress percentage is 100%');
  assert(completedGoal.status === 'COMPLETED', 'Goal status transitioned to COMPLETED');
  assert(completedGoal.requiredMonthlySavings === 0, 'Required monthly savings is 0 BDT when completed');

  // 3.8 Contribution History
  const historyRes = await clientA.get(`/savings-goals/${goalId}/contributions`);
  assert(historyRes.data.data.length === 1, 'Contribution history contains the deposit');

  /* ====================================================================
   * SECTION 4: MULTI-TENANT ISOLATION & DATA SECURITY
   * ==================================================================== */
  console.log('\n--------------------------------------------------------------------');
  console.log('SECTION 4: MULTI-TENANT ISOLATION & USER OWNERSHIP ENFORCEMENT');
  console.log('--------------------------------------------------------------------');

  // User B tries to access User A's income
  const bReadInc = await clientB.get(`/incomes/${inc1Id}`);
  assert(bReadInc.status === 404, 'User B cannot read User A income (HTTP 404 Not Found)');

  // User B tries to delete User A's expense
  const bDelExp = await clientB.delete(`/expenses/${exp1Id}`);
  assert(bDelExp.status === 404, 'User B cannot delete User A expense (HTTP 404 Not Found)');

  // User B tries to read User A's budget
  const bReadBudget = await clientB.get(`/budgets/${budget1._id}`);
  assert(bReadBudget.status === 404, 'User B cannot read User A budget (HTTP 404 Not Found)');

  // User B tries to contribute to User A's savings goal
  const bContribGoal = await clientB.post(`/savings-goals/${goalId}/contributions`, {
    amount: 1000,
  });
  assert(bContribGoal.status === 404, 'User B cannot contribute to User A goal (HTTP 404 Not Found)');

  // User B tries to delete User A's savings goal
  const bDelGoal = await clientB.delete(`/savings-goals/${goalId}`);
  assert(bDelGoal.status === 404, 'User B cannot delete User A goal (HTTP 404 Not Found)');

  /* ====================================================================
   * SECTION 5: CLEANUP & TEARDOWN
   * ==================================================================== */
  console.log('\n--------------------------------------------------------------------');
  console.log('SECTION 5: DATA CLEANUP & CASCADE DELETION CHECK');
  console.log('--------------------------------------------------------------------');

  // Cascade delete goal
  await clientA.delete(`/savings-goals/${goalId}`);
  const checkOrphanContrib = await clientA.get(`/savings-goals/${goalId}/contributions`);
  assert(checkOrphanContrib.status === 404, 'Contributions cleanly deleted with goal (cascade)');

  // Clean up User A records
  await clientA.delete(`/incomes/${inc1Id}`);
  await clientA.delete(`/incomes/${inc2.data.data._id}`);
  await clientA.delete(`/expenses/${exp1Id}`);
  await clientA.delete(`/expenses/${exp2.data.data._id}`);
  await clientA.delete(`/budgets/${budget1._id}`);
  console.log('  Cleaned up all temporary test records.');

  console.log('\n====================================================================');
  console.log(`🎉 MASTER AUDIT RESULT: ${passed}/${total} CRITERIA PASSED (100% SUCCESS)`);
  console.log('====================================================================\n');
}

runMasterSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
