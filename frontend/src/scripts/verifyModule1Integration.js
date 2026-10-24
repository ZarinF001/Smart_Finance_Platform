import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Module 1 Frontend-Backend End-to-End Verification ---');

  // Create an axios instance with cookie jar simulation
  let cookieHeader = '';

  const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    validateStatus: () => true, // Don't throw on error status codes
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

  // 1. Authenticate with a test account
  const testUser = {
    name: 'Module 1 Tester',
    email: `m1_tester_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  console.log(`\n1. Registering test user: ${testUser.email}...`);
  const regRes = await client.post('/auth/register', testUser);
  if (regRes.status !== 201) {
    console.error('Registration failed:', regRes.status, regRes.data);
    process.exit(1);
  }
  console.log('✓ User registered and authenticated via cookie session.');

  // 2. Fetch categories
  console.log('\n2. Fetching categories for INCOME and EXPENSE...');
  const catIncomeRes = await client.get('/categories?type=INCOME');
  const catExpenseRes = await client.get('/categories?type=EXPENSE');

  if (catIncomeRes.status !== 200 || catExpenseRes.status !== 200) {
    console.error('Failed to get categories');
    process.exit(1);
  }

  const incomeCategories = catIncomeRes.data.data.map((c) => c.name);
  const expenseCategories = catExpenseRes.data.data.map((c) => c.name);
  console.log(`✓ Fetched ${incomeCategories.length} income categories:`, incomeCategories);
  console.log(`✓ Fetched ${expenseCategories.length} expense categories:`, expenseCategories);

  // 3. Create Income record
  console.log('\n3. Creating Income record: 75,000 BDT from "Salary"...');
  const incomePayload = {
    amount: 75000,
    category: 'Salary',
    date: new Date().toISOString(),
    description: 'Monthly Senior Engineer Salary',
  };

  const createIncRes = await client.post('/incomes', incomePayload);
  if (createIncRes.status !== 201) {
    console.error('Failed to create income:', createIncRes.status, createIncRes.data);
    process.exit(1);
  }
  const createdIncome = createIncRes.data.data;
  console.log(`✓ Income created: ID ${createdIncome._id}, Amount: ৳ ${createdIncome.amount}`);

  // 4. Update Income record
  console.log('\n4. Updating Income record to 80,000 BDT...');
  const updateIncRes = await client.patch(`/incomes/${createdIncome._id}`, {
    amount: 80000,
    description: 'Monthly Senior Engineer Salary + Performance Bonus',
  });
  if (updateIncRes.status !== 200 || updateIncRes.data.data.amount !== 80000) {
    console.error('Failed to update income:', updateIncRes.status, updateIncRes.data);
    process.exit(1);
  }
  console.log('✓ Income updated successfully. New Amount: ৳ 80,000');

  // 5. Query Incomes with pagination & summary
  console.log('\n5. Querying Incomes (GET /api/incomes)...');
  const listIncRes = await client.get('/incomes?page=1&limit=10');
  if (listIncRes.status !== 200 || listIncRes.data.data.length !== 1) {
    console.error('Failed to list incomes:', listIncRes.status, listIncRes.data);
    process.exit(1);
  }
  console.log(`✓ Incomes returned: ${listIncRes.data.data.length} item(s). Summary Total Income: ৳ ${listIncRes.data.meta.summary.totalIncome}`);

  // 6. Create Expense records with payment methods
  console.log('\n6. Creating Expense records (Food & Dining via card, Utilities via mobile)...');
  const exp1Res = await client.post('/expenses', {
    amount: 3500,
    category: 'Food & Dining',
    paymentMethod: 'credit_card',
    date: new Date().toISOString(),
    description: 'Grocery shopping at Shwapno',
  });
  const exp2Res = await client.post('/expenses', {
    amount: 1500,
    category: 'Bills & Utilities',
    paymentMethod: 'mobile_payment',
    date: new Date().toISOString(),
    description: 'Electricity bill payment via bKash',
  });

  if (exp1Res.status !== 201 || exp2Res.status !== 201) {
    console.error('Failed to create expenses');
    process.exit(1);
  }
  const exp1 = exp1Res.data.data;
  const exp2 = exp2Res.data.data;
  console.log(`✓ Created Expense 1: ৳ ${exp1.amount} (${exp1.category}, ${exp1.paymentMethod})`);
  console.log(`✓ Created Expense 2: ৳ ${exp2.amount} (${exp2.category}, ${exp2.paymentMethod})`);

  // 7. Update Expense record
  console.log('\n7. Updating Expense 1 amount to 3,800 BDT...');
  const updateExpRes = await client.patch(`/expenses/${exp1._id}`, {
    amount: 3800,
  });
  if (updateExpRes.status !== 200 || updateExpRes.data.data.amount !== 3800) {
    console.error('Failed to update expense:', updateExpRes.status, updateExpRes.data);
    process.exit(1);
  }
  console.log('✓ Expense updated successfully. New Amount: ৳ 3,800');

  // 8. Query Expenses list
  console.log('\n8. Querying Expenses (GET /api/expenses)...');
  const listExpRes = await client.get('/expenses');
  if (listExpRes.status !== 200 || listExpRes.data.data.length !== 2) {
    console.error('Failed to list expenses');
    process.exit(1);
  }
  console.log(`✓ Total Expenses: ৳ ${listExpRes.data.meta.summary.totalExpense} across ${listExpRes.data.data.length} records.`);

  // 9. Query Combined Transactions Ledger
  console.log('\n9. Querying Combined Ledger (GET /api/transactions)...');
  const txAllRes = await client.get('/transactions');
  if (txAllRes.status !== 200 || txAllRes.data.data.length !== 3) {
    console.error('Failed to get transactions:', txAllRes.status, txAllRes.data);
    process.exit(1);
  }
  const summary = txAllRes.data.meta.summary;
  console.log(`✓ Combined records count: ${txAllRes.data.data.length}`);
  console.log(`✓ Summary: Total Income: ৳ ${summary.totalIncome}, Total Expense: ৳ ${summary.totalExpense}, Net Balance: ৳ ${summary.netBalance}`);

  if (summary.totalIncome !== 80000 || summary.totalExpense !== 5300 || summary.netBalance !== 74700) {
    console.error('Transaction summary mismatch! Expected 80000, 5300, 74700. Got:', summary);
    process.exit(1);
  }
  console.log('✓ Accurate calculation of Net Balance confirmed (80,000 - 5,300 = 74,700).');

  // 10. Test filter by type
  console.log('\n10. Testing transaction type filter (type=EXPENSE)...');
  const txExpOnly = await client.get('/transactions?type=EXPENSE');
  if (txExpOnly.status !== 200 || txExpOnly.data.data.length !== 2) {
    console.error('Type filter failed');
    process.exit(1);
  }
  console.log(`✓ Correctly filtered to ${txExpOnly.data.data.length} expense-only records.`);

  // 11. Test search filter
  console.log('\n11. Testing search filter (search=Shwapno)...');
  const txSearch = await client.get('/transactions?search=Shwapno');
  if (txSearch.status !== 200 || txSearch.data.data.length !== 1) {
    console.error('Search filter failed');
    process.exit(1);
  }
  console.log(`✓ Correctly matched description: "${txSearch.data.data[0].description}"`);

  // 12. Delete records
  console.log('\n12. Deleting records to verify cleanup...');
  const delInc = await client.delete(`/incomes/${createdIncome._id}`);
  const delExp1 = await client.delete(`/expenses/${exp1._id}`);
  const delExp2 = await client.delete(`/expenses/${exp2._id}`);

  if (delInc.status !== 200 || delExp1.status !== 200 || delExp2.status !== 200) {
    console.error('Deletion failed');
    process.exit(1);
  }
  console.log('✓ Incomes and expenses deleted successfully.');

  // Verify empty ledger
  const txEmpty = await client.get('/transactions');
  if (txEmpty.data.data.length !== 0) {
    console.error('Records still exist after deletion!');
    process.exit(1);
  }
  console.log('✓ Verified empty ledger after deletion.');

  console.log('\n============================================================');
  console.log('✓ ALL MODULE 1 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('============================================================\n');
}

runTests().catch((err) => {
  console.error('Unexpected failure during verification:', err);
  process.exit(1);
});
