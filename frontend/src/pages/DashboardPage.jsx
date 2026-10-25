import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  ArrowRight,
  Receipt,
  User,
  Calendar,
  Plus,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import IncomeFormModal from '../components/transactions/IncomeFormModal.jsx';
import ExpenseFormModal from '../components/transactions/ExpenseFormModal.jsx';
import transactionService from '../services/transactionService.js';
import budgetService from '../services/budgetService.js';
import savingsGoalService from '../services/savingsGoalService.js';
import { formatBDT, formatDate } from '../utils/currency.js';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudgets: 0,
    totalBudgetLimit: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallUtilization: 0,
  });
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState('ALL');

  // Direct modal trigger states
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const loadFinancials = useCallback(async () => {
    try {
      const [txRes, bSummaryRes, bListRes, goalsRes] = await Promise.all([
        transactionService.getTransactions({
          limit: 6,
          sortBy: 'date',
          sortOrder: 'desc',
        }),
        budgetService.getBudgetSummary(),
        budgetService.getBudgets(),
        savingsGoalService.getGoals({ limit: 3 }),
      ]);

      setSummary(txRes.meta?.summary || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
      setRecentTransactions(txRes.items || []);
      setBudgetSummary(
        bSummaryRes || {
          totalBudgets: 0,
          totalBudgetLimit: 0,
          totalSpent: 0,
          totalRemaining: 0,
          overallUtilization: 0,
        }
      );
      setBudgets(bListRes?.items || []);
      setSavingsGoals(goalsRes?.items || []);
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinancials();
  }, [loadFinancials]);

  // Filter transactions on dashboard
  const filteredTransactions = useMemo(() => {
    if (transactionFilter === 'ALL') return recentTransactions;
    return recentTransactions.filter((tx) => tx.type === transactionFilter);
  }, [recentTransactions, transactionFilter]);

  const savingsRate = useMemo(() => {
    if (!summary.totalIncome || summary.totalIncome <= 0) return 0;
    const rate = Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100);
    return Math.max(0, rate);
  }, [summary.totalIncome, summary.totalExpense]);

  const expenseRatio = useMemo(() => {
    if (!summary.totalIncome || summary.totalIncome <= 0) return 0;
    return Math.min(100, Math.round((summary.totalExpense / summary.totalIncome) * 100));
  }, [summary.totalIncome, summary.totalExpense]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Hero Balance & Cash Flow Command Bar */}
      <section className="bg-white border border-slate-200/90 rounded-card p-5 sm:p-6 shadow-subtle space-y-5">
        {/* Top Tier: Available Net Balance & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                Available Net Balance
              </span>
              <Badge
                variant={summary.netBalance >= 0 ? 'success' : 'error'}
                size="sm"
                dot
              >
                {summary.netBalance >= 0 ? 'Positive Net Flow' : 'Deficit'}
              </Badge>
            </div>

            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums ${
                  summary.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}
              >
                {formatBDT(summary.netBalance, { showSign: true })}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Across all recorded earnings and expenses
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              iconLeft={ArrowDownLeft}
              onClick={() => setIsIncomeModalOpen(true)}
              className="text-emerald-700 border-slate-200 hover:bg-emerald-50/50 text-xs font-medium"
            >
              Add Income
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconLeft={ArrowUpRight}
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-sm"
            >
              Log Expense
            </Button>
          </div>
        </div>

        {/* Lower Tier: Clean 3-Column Financial Metrics Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {/* Total Inflow */}
          <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Inflow
            </span>
            <p className="text-base font-bold text-emerald-600 tabular-nums mt-0.5">
              +{formatBDT(summary.totalIncome)}
            </p>
            <Link
              to="/income"
              className="text-[11px] text-slate-500 hover:text-emerald-700 transition-colors inline-flex items-center gap-0.5 mt-1"
            >
              Income streams <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Total Outflow */}
          <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Outflow
            </span>
            <p className="text-base font-bold text-rose-600 tabular-nums mt-0.5">
              −{formatBDT(summary.totalExpense)}
            </p>
            <Link
              to="/expenses"
              className="text-[11px] text-slate-500 hover:text-rose-700 transition-colors inline-flex items-center gap-0.5 mt-1"
            >
              Expense log <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Budget Utilization Meter */}
          <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Budget Spent</span>
              <span className="text-slate-700 font-mono">
                {budgetSummary.overallUtilization}%
              </span>
            </div>
            <div className="w-full bg-slate-200/70 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetSummary.overallUtilization > 100
                    ? 'bg-rose-500'
                    : budgetSummary.overallUtilization >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(budgetSummary.overallUtilization, 100)}%`,
                }}
              />
            </div>
            <Link
              to="/budgets"
              className="text-[11px] text-slate-500 hover:text-brand-700 transition-colors inline-flex items-center gap-0.5 mt-1"
            >
              {budgetSummary.totalBudgetLimit > 0
                ? `${formatBDT(budgetSummary.totalRemaining)} remaining`
                : 'Configure budgets'}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Main Two-Column Architectural Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Ledger & Category Budgets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Transaction Ledger */}
          <Card
            title="Recent Transactions"
            subtitle="Latest activity across your accounts"
            action={
              <div className="flex items-center gap-2">
                {/* Unobtrusive Type Filter Pills */}
                <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-[11px]">
                  {['ALL', 'INCOME', 'EXPENSE'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTransactionFilter(f)}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        transactionFilter === f
                          ? 'bg-white text-slate-900 shadow-subtle font-semibold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {f === 'ALL' ? 'All' : f === 'INCOME' ? 'Income' : 'Expenses'}
                    </button>
                  ))}
                </div>

                <Link
                  to="/transactions"
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-0.5 pl-2"
                >
                  Full Ledger <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            }
            bodyClassName="p-0"
          >
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading transactions...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Receipt className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No transactions recorded</p>
                <p className="text-slate-400 mt-0.5 mb-3 text-[11px]">
                  {transactionFilter === 'ALL'
                    ? 'Get started by logging your first income or expense.'
                    : `No ${transactionFilter.toLowerCase()} entries found.`}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsIncomeModalOpen(true)}
                    className="text-xs text-emerald-700"
                  >
                    Add Income
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="text-xs text-rose-700"
                  >
                    Log Expense
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <div
                      key={`${tx.type}-${tx._id}`}
                      className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Transaction Icon */}
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {tx.description || tx.category}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-medium text-slate-600">
                              {tx.category}
                            </span>
                            <span>•</span>
                            <span>{formatDate(tx.date)}</span>
                            {tx.paymentMethod && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-3">
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            isIncome ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {isIncome
                            ? `+${formatBDT(tx.amount)}`
                            : `−${formatBDT(tx.amount)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Monthly Budget Allocations */}
          <Card
            title="Monthly Category Budgets"
            subtitle="Current spending vs planned monthly limits"
            action={
              <Link
                to="/budgets"
                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
              >
                Manage Budgets <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {budgets.length === 0 ? (
              <div className="py-5 text-center text-slate-400 text-xs">
                <PieChart className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                <p className="font-semibold text-slate-700">No category budgets defined</p>
                <p className="text-slate-400 mt-0.5 mb-3 text-[11px]">
                  Establish monthly targets for Food, Utilities, or Transport.
                </p>
                <Link to="/budgets">
                  <Button size="sm" variant="outline" className="text-xs">
                    Configure Budgets
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {budgets.slice(0, 4).map((b) => {
                  const spent = b.spent || 0;
                  const limit = b.limit || 1;
                  const pct = Math.round((spent / limit) * 100);
                  const isExceeded = pct > 100;
                  const isWarning = pct >= 80 && !isExceeded;

                  return (
                    <div key={b._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">
                          {b.category?.name || b.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 tabular-nums">
                            {formatBDT(spent)} of {formatBDT(limit)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                              isExceeded
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isWarning
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isExceeded
                              ? 'bg-rose-500'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-brand-600'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1/3): Savings Goals & Financial Health */}
        <div className="space-y-6">
          {/* Active Savings Goals */}
          <Card
            title="Savings Milestones"
            subtitle="Target progress and monthly plan"
            action={
              <Link
                to="/goals"
                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
              >
                All Goals <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {savingsGoals.length === 0 ? (
              <div className="text-center py-5 text-slate-400 text-xs">
                <Target className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                <p className="font-semibold text-slate-700">No active savings targets</p>
                <p className="text-slate-400 mt-0.5 mb-3 text-[11px]">
                  Track progress toward emergency funds or milestones.
                </p>
                <Link to="/goals">
                  <Button size="sm" variant="outline" iconLeft={Plus} className="text-xs">
                    New Savings Goal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savingsGoals.map((g) => (
                  <Link
                    key={g._id}
                    to="/goals"
                    className="p-3 rounded-md border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50 transition-colors block"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-900 truncate">
                        {g.name}
                      </span>
                      <span className="font-bold text-emerald-700 text-[11px] tabular-nums">
                        {g.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 my-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                      <span>{formatBDT(g.totalSaved || 0)}</span>
                      <span>Target: {formatBDT(g.targetAmount)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Financial Health & Ratio Summary */}
          <Card
            title="Financial Health"
            subtitle="Cash flow efficiency & savings rate"
          >
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Monthly Savings Rate
                  </span>
                  <span className="text-xl font-bold text-slate-900 tabular-nums">
                    {savingsRate}%
                  </span>
                </div>
                <Badge variant={savingsRate >= 20 ? 'success' : 'neutral'} size="sm">
                  {savingsRate >= 20 ? 'Healthy Margin' : 'Balanced'}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Expense to Inflow Ratio</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{expenseRatio}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      expenseRatio > 85
                        ? 'bg-rose-500'
                        : expenseRatio > 60
                        ? 'bg-amber-500'
                        : 'bg-brand-600'
                    }`}
                    style={{ width: `${expenseRatio}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link to="/transactions" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Ledger
                  </Button>
                </Link>
                <Link to="/reports" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Direct Transaction Modals Triggered From Dashboard */}
      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSuccess={() => {
          setIsIncomeModalOpen(false);
          loadFinancials();
        }}
      />

      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => {
          setIsExpenseModalOpen(false);
          loadFinancials();
        }}
      />
    </div>
  );
};

export default DashboardPage;
