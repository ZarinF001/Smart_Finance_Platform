import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Module 2 Frontend-Backend End-to-End Verification ---');

  let cookieHeader = '';

  const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    validateStatus: () => true,
  });

  client.interceptors.request.use((config) => {
    if (cookieHeader) {
      config.headers['Cookie'] = cookieHeader;
    }
    return config;
  });

  client.interceptors.response.use((response) => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie && Array.isArray(setCookie)) {
      cookieHeader = setCookie.map((c) => c.split(';')[0]).join('; ');
    }
    return response;
  });

  const timestamp = Date.now();
  const testUser = {
    name: 'Module 2 Frontend Tester',
    email: `m2_frontend_${timestamp}@example.com`,
    password: 'Password123!',
  };

  // 1. Authenticate
  console.log(`\n1. Registering test user: ${testUser.email}...`);
  const regRes = await client.post('/auth/register', testUser);
  if (regRes.status !== 201) {
    console.error('Registration failed:', regRes.status, regRes.data);
    process.exit(1);
  }
  console.log('✓ User registered and authenticated via cookie session.');

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // 2. Create Budget via Service API
  console.log(`\n2. Creating Budget for "Food & Dining" (Limit: 15,000 BDT, ${month}/${year})...`);
  const createBudgetRes = await client.post('/budgets', {
    category: 'Food & Dining',
    limit: 15000,
    month,
    year,
  });
  if (createBudgetRes.status !== 201) {
    console.error('Failed to create budget:', createBudgetRes.status, createBudgetRes.data);
    process.exit(1);
  }
  const createdBudget = createBudgetRes.data.data;
  console.log(`✓ Budget created: ID ${createdBudget._id}, Limit: ৳ ${createdBudget.limit}, Status: ${createdBudget.status}`);

  // 3. List Budgets & Query Summary
  console.log('\n3. Querying Budgets & Monthly Summary...');
  const listBudgetsRes = await client.get(`/budgets?month=${month}&year=${year}`);
  const summaryRes = await client.get(`/budgets/summary?month=${month}&year=${year}`);

  if (listBudgetsRes.status !== 200 || summaryRes.status !== 200) {
    console.error('Failed to get budgets or summary');
    process.exit(1);
  }
  console.log(`✓ Budgets found: ${listBudgetsRes.data.data.length}`);
  console.log(`✓ Summary: Total Limit: ৳ ${summaryRes.data.data.totalBudgetLimit}, Total Spent: ৳ ${summaryRes.data.data.totalSpent}`);

  // 4. Log Expense to trigger WARNING status (13,000 BDT = 86.67% of 15,000 BDT)
  console.log('\n4. Logging Expense of 13,000 BDT to test dynamic status transition to WARNING...');
  const expRes = await client.post('/expenses', {
    amount: 13000,
    category: 'Food & Dining',
    paymentMethod: 'credit_card',
    date: new Date().toISOString(),
    description: 'Bulk grocery shopping for month',
  });
  if (expRes.status !== 201) {
    console.error('Expense logging failed');
    process.exit(1);
  }

  const updatedBudgetCheck = await client.get(`/budgets/${createdBudget._id}`);
  const updatedBudgetData = updatedBudgetCheck.data.data;
  console.log(`✓ Spent: ৳ ${updatedBudgetData.spent}, Remaining: ৳ ${updatedBudgetData.remaining}, Utilization: ${updatedBudgetData.utilization}%, Status: ${updatedBudgetData.status}`);

  if (updatedBudgetData.status !== 'WARNING' || updatedBudgetData.spent !== 13000) {
    console.error('Budget dynamic status recalculation failed!');
    process.exit(1);
  }
  console.log('✓ Dynamic budget recalculation from live expenses confirmed.');

  // 5. Create Savings Goal
  console.log('\n5. Creating Savings Goal: "Emergency Cushion" (100,000 BDT)...');
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 10); // 10 months

  const createGoalRes = await client.post('/savings-goals', {
    name: 'Emergency Cushion',
    targetAmount: 100000,
    deadline: targetDate.toISOString(),
    description: '10-month reserve in liquid account',
  });
  if (createGoalRes.status !== 201) {
    console.error('Goal creation failed');
    process.exit(1);
  }
  const createdGoal = createGoalRes.data.data;
  console.log(`✓ Savings Goal created: "${createdGoal.name}", Target: ৳ ${createdGoal.targetAmount}, Status: ${createdGoal.status}`);
  console.log(`✓ Initial Remaining: ৳ ${createdGoal.remainingAmount}, Required Monthly: ৳ ${createdGoal.requiredMonthlySavings}`);

  // 6. Record Contribution
  console.log('\n6. Recording Savings Contribution of 25,000 BDT...');
  const contribRes = await client.post(`/savings-goals/${createdGoal._id}/contributions`, {
    amount: 25000,
    date: new Date().toISOString(),
    description: 'First deposit from salary',
  });
  if (contribRes.status !== 201) {
    console.error('Contribution failed');
    process.exit(1);
  }
  const goalAfterContrib = contribRes.data.data.goal;
  console.log(`✓ Total Saved: ৳ ${goalAfterContrib.totalSaved}, Progress: ${goalAfterContrib.progressPercentage}%, Remaining: ৳ ${goalAfterContrib.remainingAmount}`);

  // 7. Verify Contribution History
  console.log('\n7. Verifying Contribution History...');
  const historyRes = await client.get(`/savings-goals/${createdGoal._id}/contributions`);
  if (historyRes.status !== 200 || historyRes.data.data.length !== 1) {
    console.error('Contribution history verification failed');
    process.exit(1);
  }
  console.log(`✓ Contribution history verified: ${historyRes.data.data.length} deposit record(s) found.`);

  // 8. Clean up
  console.log('\n8. Cleaning up test records...');
  await client.delete(`/budgets/${createdBudget._id}`);
  await client.delete(`/expenses/${expRes.data.data._id}`);
  await client.delete(`/savings-goals/${createdGoal._id}`);
  console.log('✓ Test cleanup complete.');

  console.log('\n============================================================');
  console.log('✓ ALL MODULE 2 FRONTEND INTEGRATION TESTS PASSED 100%!');
  console.log('============================================================\n');
}

runTests().catch((err) => {
  console.error('Unexpected test error:', err);
  process.exit(1);
});
