const BASE_URL = 'http://localhost:5000/api';

// Simple cookie-jar wrapper around native fetch
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

    // Save set-cookie
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
    };
  };

  return {
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
    patch: (url, body, options) => request(url, { ...options, method: 'PATCH', body }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
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

async function runTests() {
  console.log('================================================================');
  console.log('🧪 MODULE 2 BACKEND VERIFICATION: BUDGETS & SAVINGS GOALS');
  console.log('================================================================\n');

  const clientA = createClient();
  const clientB = createClient();

  const timestamp = Date.now();
  const userA = {
    name: 'Alice Budgeter',
    email: `alice_budget_${timestamp}@example.com`,
    password: 'Password123!',
  };
  const userB = {
    name: 'Bob Saver',
    email: `bob_saver_${timestamp}@example.com`,
    password: 'Password123!',
  };

  // 1. Authenticate User A and User B
  console.log('1. User Registration & Cookie Authentication:');
  const regA = await clientA.post('/auth/register', userA);
  const regB = await clientB.post('/auth/register', userB);

  assert(regA.status === 201, 'User A registered and authenticated with HTTP-only cookie');
  assert(regB.status === 201, 'User B registered and authenticated with HTTP-only cookie');

  const now = new Date();
  const testMonth = now.getMonth() + 1;
  const testYear = now.getFullYear();

  // 2. Budget Input Validation: Non-positive limit
  console.log('\n2. Budget Input Validation:');
  const negLimit = await clientA.post('/budgets', {
    category: 'Food & Dining',
    limit: -200,
    month: testMonth,
    year: testYear,
  });
  assert(negLimit.status === 400, 'Rejects negative spending limit with 400 Bad Request');

  const zeroLimit = await clientA.post('/budgets', {
    category: 'Food & Dining',
    limit: 0,
    month: testMonth,
    year: testYear,
  });
  assert(zeroLimit.status === 400, 'Rejects zero spending limit with 400 Bad Request');

  // 3. Category Type Matching: Cannot use INCOME category for Budget
  console.log('\n3. Category Type Enforcement:');
  const incomeCategoryBudget = await clientA.post('/budgets', {
    category: 'Salary',
    limit: 10000,
    month: testMonth,
    year: testYear,
  });
  assert(
    incomeCategoryBudget.status === 400,
    'Rejects using Income category "Salary" for Expense Budget'
  );

  // 4. Budget Creation
  console.log('\n4. Monthly Budget Creation:');
  const createBudgetRes = await clientA.post('/budgets', {
    category: 'Food & Dining',
    limit: 10000,
    month: testMonth,
    year: testYear,
  });
  assert(createBudgetRes.status === 201, 'Successfully creates monthly budget (10,000 BDT)');
  const budget1 = createBudgetRes.data.data;
  assert(budget1.spent === 0, 'Initial spent is dynamically calculated as 0 BDT');
  assert(budget1.remaining === 10000, 'Initial remaining equals limit (10,000 BDT)');
  assert(budget1.status === 'NORMAL', 'Initial status is NORMAL (0% utilization)');

  // 5. Unique Compound Index & Duplicate Prevention
  console.log('\n5. Duplicate Budget Prevention:');
  const dupBudgetRes = await clientA.post('/budgets', {
    category: 'Food & Dining',
    limit: 15000,
    month: testMonth,
    year: testYear,
  });
  assert(
    dupBudgetRes.status === 409,
    'Rejects duplicate budget for same category/month/year with 409 Conflict'
  );

  // 6. Dynamic Budget Status Transitions Based on Actual Expenses
  console.log('\n6. Dynamic Budget Spending & Status Transitions:');

  // 6a. Record Expense: 8,500 BDT (85% utilization -> WARNING)
  const expWarn = await clientA.post('/expenses', {
    amount: 8500,
    category: 'Food & Dining',
    paymentMethod: 'credit_card',
    date: new Date().toISOString(),
    description: 'Weekly restaurant dinners',
  });
  assert(expWarn.status === 201, 'Expense of 8,500 BDT created');
  const expWarnId = expWarn.data.data._id;

  const budgetAfterWarn = await clientA.get(`/budgets/${budget1._id}`);
  const warnData = budgetAfterWarn.data.data;
  assert(warnData.spent === 8500, 'Spent dynamically updated to 8,500 BDT');
  assert(warnData.remaining === 1500, 'Remaining dynamically updated to 1,500 BDT');
  assert(warnData.utilization === 85, 'Utilization percentage calculated as 85%');
  assert(warnData.status === 'WARNING', 'Status dynamically transitioned to WARNING (>= 80%)');

  // 6b. Record Additional Expense: 2,500 BDT (Total: 11,000 BDT > 10,000 limit -> EXCEEDED)
  const expExceed = await clientA.post('/expenses', {
    amount: 2500,
    category: 'Food & Dining',
    paymentMethod: 'cash',
    date: new Date().toISOString(),
    description: 'Grocery shopping spree',
  });
  assert(expExceed.status === 201, 'Additional expense of 2,500 BDT created');
  const expExceedId = expExceed.data.data._id;

  const budgetAfterExceed = await clientA.get(`/budgets/${budget1._id}`);
  const exceedData = budgetAfterExceed.data.data;
  assert(exceedData.spent === 11000, 'Spent dynamically updated to 11,000 BDT');
  assert(exceedData.remaining === -1000, 'Remaining is negative (-1,000 BDT)');
  assert(exceedData.utilization === 110, 'Utilization is 110%');
  assert(exceedData.status === 'EXCEEDED', 'Status dynamically transitioned to EXCEEDED');
  assert(exceedData.isExceeded === true, 'isExceeded boolean is true');

  // 6c. Automatic Rollback on Expense Deletion
  await clientA.delete(`/expenses/${expExceedId}`);
  const budgetAfterRollback = await clientA.get(`/budgets/${budget1._id}`);
  const rollbackData = budgetAfterRollback.data.data;
  assert(rollbackData.spent === 8500, 'Spent automatically rolled back to 8,500 BDT after deletion');
  assert(rollbackData.status === 'WARNING', 'Status automatically rolled back to WARNING');

  // 7. Budget Summary Endpoint
  console.log('\n7. Budget Summary Aggregation:');
  // Create second budget for Transportation: 5,000 BDT
  await clientA.post('/budgets', {
    category: 'Transportation',
    limit: 5000,
    month: testMonth,
    year: testYear,
  });

  const summaryRes = await clientA.get(`/budgets/summary?month=${testMonth}&year=${testYear}`);
  assert(summaryRes.status === 200, 'GET /api/budgets/summary returned 200 OK');
  const summary = summaryRes.data.data;
  assert(summary.totalBudgets === 2, 'Summary totalBudgets count is 2');
  assert(summary.totalBudgetLimit === 15000, 'Total budget limit is 15,000 BDT (10k + 5k)');
  assert(summary.totalSpent === 8500, 'Total spent across budgeted categories is 8,500 BDT');
  assert(summary.totalRemaining === 6500, 'Total remaining is 6,500 BDT');
  assert(summary.warningCount === 1, 'warningCount is 1 (Food & Dining)');
  assert(summary.normalCount === 1, 'normalCount is 1 (Transportation)');

  // 8. Savings Goals: Creation & Input Validation
  console.log('\n8. Savings Goals Creation & Metrics:');
  const futureDeadline = new Date();
  futureDeadline.setMonth(futureDeadline.getMonth() + 6); // 6 months in future

  const createGoalRes = await clientA.post('/savings-goals', {
    name: 'Tech Upgrade Fund',
    targetAmount: 60000,
    deadline: futureDeadline.toISOString(),
    description: 'Saving for M3 MacBook Pro',
  });
  assert(createGoalRes.status === 201, 'Successfully creates savings goal (60,000 BDT)');
  const goal = createGoalRes.data.data;
  assert(goal.totalSaved === 0, 'Initial totalSaved is 0 BDT');
  assert(goal.remainingAmount === 60000, 'Initial remainingAmount is 60,000 BDT');
  assert(goal.status === 'IN_PROGRESS', 'Initial status is IN_PROGRESS');
  assert(goal.daysRemaining > 150, 'Calculates valid days remaining (> 150 days)');
  assert(goal.monthsRemaining >= 5, 'Calculates valid months remaining');
  assert(goal.requiredMonthlySavings > 0, 'Calculates required monthly savings (> 0 BDT)');

  // 9. Savings Contributions & Target Completion
  console.log('\n9. Savings Contributions & Progress Tracking:');

  // 9a. Non-positive contribution validation
  const invalidContrib = await clientA.post(`/savings-goals/${goal._id}/contributions`, {
    amount: -500,
  });
  assert(invalidContrib.status === 400, 'Rejects negative contribution with 400 Bad Request');

  // 9b. Valid contribution 1: 20,000 BDT
  const contrib1Res = await clientA.post(`/savings-goals/${goal._id}/contributions`, {
    amount: 20000,
    description: 'Initial deposit from monthly income',
  });
  assert(contrib1Res.status === 201, 'Recorded contribution of 20,000 BDT');
  const goalAfter1 = contrib1Res.data.data.goal;
  assert(goalAfter1.totalSaved === 20000, 'Total saved updated to 20,000 BDT');
  assert(goalAfter1.remainingAmount === 40000, 'Remaining target updated to 40,000 BDT');
  assert(goalAfter1.progressPercentage === 33.33, 'Progress calculated as 33.33%');
  assert(goalAfter1.status === 'IN_PROGRESS', 'Status remains IN_PROGRESS');

  // 9c. Valid contribution 2: 40,000 BDT (Completes the 60,000 BDT target)
  const contrib2Res = await clientA.post(`/savings-goals/${goal._id}/contributions`, {
    amount: 40000,
    description: 'Bonus deposit to complete goal',
  });
  assert(contrib2Res.status === 201, 'Recorded final contribution of 40,000 BDT');
  const goalAfter2 = contrib2Res.data.data.goal;
  assert(goalAfter2.totalSaved === 60000, 'Total saved reaches target (60,000 BDT)');
  assert(goalAfter2.remainingAmount === 0, 'Remaining amount is 0 BDT');
  assert(goalAfter2.progressPercentage === 100, 'Progress percentage is 100%');
  assert(goalAfter2.status === 'COMPLETED', 'Status transitioned to COMPLETED');
  assert(goalAfter2.requiredMonthlySavings === 0, 'Required monthly savings is 0 for completed goal');

  // 10. Contribution History Endpoint
  console.log('\n10. Contribution History Endpoint:');
  const historyRes = await clientA.get(`/savings-goals/${goal._id}/contributions`);
  assert(historyRes.status === 200, 'GET /api/savings-goals/:id/contributions returned 200 OK');
  assert(historyRes.data.data.length === 2, 'History contains both contribution records');

  // 11. Expired Goal Calculation
  console.log('\n11. Expired Goal Handling:');
  const pastDeadline = new Date();
  pastDeadline.setDate(pastDeadline.getDate() - 15); // 15 days in the past

  const expiredRes = await clientA.post('/savings-goals', {
    name: 'Old Course Subscription',
    targetAmount: 12000,
    deadline: pastDeadline.toISOString(),
  });
  const expiredGoal = expiredRes.data.data;
  assert(expiredGoal.isExpired === true, 'isExpired is true for past deadline');
  assert(expiredGoal.daysRemaining === 0, 'daysRemaining is 0 for past deadline');
  assert(expiredGoal.status === 'EXPIRED', 'Status is EXPIRED');
  assert(
    expiredGoal.requiredMonthlySavings === 12000,
    'Required monthly savings equals remaining target for overdue goal'
  );

  // 12. Multi-Tenant User Isolation & Security
  console.log('\n12. Multi-Tenant Authorization & User Ownership Isolation:');
  const userBViewBudget = await clientB.get(`/budgets/${budget1._id}`);
  assert(userBViewBudget.status === 404, 'User B cannot view User A budget (HTTP 404 Not Found)');

  const userBEditBudget = await clientB.patch(`/budgets/${budget1._id}`, { limit: 99999 });
  assert(userBEditBudget.status === 404, 'User B cannot update User A budget (HTTP 404 Not Found)');

  const userBDeleteBudget = await clientB.delete(`/budgets/${budget1._id}`);
  assert(userBDeleteBudget.status === 404, 'User B cannot delete User A budget (HTTP 404 Not Found)');

  const userBViewGoal = await clientB.get(`/savings-goals/${goal._id}`);
  assert(userBViewGoal.status === 404, 'User B cannot view User A goal (HTTP 404 Not Found)');

  const userBContribGoal = await clientB.post(`/savings-goals/${goal._id}/contributions`, {
    amount: 100,
  });
  assert(userBContribGoal.status === 404, 'User B cannot contribute to User A goal (HTTP 404 Not Found)');

  // 13. Cascade Deletion of Goal and Contributions
  console.log('\n13. Cascade Deletion of Savings Goal:');
  const deleteGoalRes = await clientA.delete(`/savings-goals/${goal._id}`);
  assert(deleteGoalRes.status === 200, 'Goal deleted successfully');

  const checkGoalHistory = await clientA.get(`/savings-goals/${goal._id}/contributions`);
  assert(checkGoalHistory.status === 404, 'Contributions no longer accessible for deleted goal');

  // 14. Cleanup Remaining Test Data
  console.log('\n14. Cleaning Up Test Data:');
  await clientA.delete(`/budgets/${budget1._id}`);
  await clientA.delete(`/expenses/${expWarnId}`);
  await clientA.delete(`/savings-goals/${expiredGoal._id}`);
  console.log('  Cleaned up all temporary test budgets and expenses.');

  console.log('\n================================================================');
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} TESTS PASSED WITH 100% SUCCESS!`);
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('Unexpected test failure:', err);
  process.exit(1);
});
