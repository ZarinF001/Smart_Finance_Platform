import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart,
  Target,
  ArrowRight,
  Receipt,
  User,
  KeyRound,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
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
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    const loadFinancials = async () => {
      try {
        const [txRes, bSummaryRes, goalsRes] = await Promise.all([
          transactionService.getTransactions({
            limit: 8,
            sortBy: 'date',
            sortOrder: 'desc',
          }),
          budgetService.getBudgetSummary(),
          savingsGoalService.getGoals({ limit: 4 }),
        ]);

        if (isMounted) {
          setSummary(txRes.meta?.summary || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
          setRecentTransactions(txRes.items || []);
          setBudgetSummary(bSummaryRes || {
            totalBudgets: 0,
            totalBudgetLimit: 0,
            totalSpent: 0,
            totalRemaining: 0,
            overallUtilization: 0,
          });
          setSavingsGoals(goalsRes.items || []);
        }
      } catch (err) {
        // Silently handle if network or unauthenticated
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFinancials();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter recent transactions on the dashboard directly
  const filteredRecentTransactions = useMemo(() => {
    if (transactionFilter === 'ALL') return recentTransactions;
    return recentTransactions.filter((tx) => tx.type === transactionFilter);
  }, [recentTransactions, transactionFilter]);

  const memberDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Compact Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here is your financial summary and recent account activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/income">
            <Button
              variant="outline"
              size="sm"
              iconLeft={ArrowDownLeft}
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs font-semibold"
            >
              Add Income
            </Button>
          </Link>

          <Link to="/expenses">
            <Button
              variant="primary"
              size="sm"
              iconLeft={ArrowUpRight}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
            >
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Cash Flow / Balance */}
        <Link to="/transactions" className="block group">
          <Card
            className={`border-slate-200/90 transition-all shadow-subtle group-hover:shadow-card-hover group-hover:border-slate-300 ${
              summary.netBalance >= 0 ? 'bg-gradient-to-br from-brand-50/30 to-white' : 'bg-gradient-to-br from-rose-50/30 to-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Balance
                </p>
                <p
                  className={`text-2xl font-extrabold mt-1 tracking-tight ${
                    summary.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
                  }`}
                >
                  {formatBDT(summary.netBalance, { showSign: true })}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-brand-600 transition-colors">
                  View full ledger
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  summary.netBalance >= 0
                    ? 'bg-brand-50 text-brand-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                <Scale className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Income */}
        <Link to="/income" className="block group">
          <Card className="border-slate-200/90 bg-gradient-to-br from-emerald-50/30 to-white transition-all shadow-subtle group-hover:shadow-card-hover group-hover:border-emerald-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Income
                </p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1 tracking-tight">
                  {formatBDT(summary.totalIncome)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
                  View income streams
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Expenses */}
        <Link to="/expenses" className="block group">
          <Card className="border-slate-200/90 bg-gradient-to-br from-rose-50/30 to-white transition-all shadow-subtle group-hover:shadow-card-hover group-hover:border-rose-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Expenses
                </p>
                <p className="text-2xl font-extrabold text-rose-600 mt-1 tracking-tight">
                  {formatBDT(summary.totalExpense)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-rose-700 transition-colors">
                  View expense log
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Monthly Budget Health */}
        <Link to="/budgets" className="block group">
          <Card className="border-slate-200/90 bg-gradient-to-br from-indigo-50/30 to-white transition-all shadow-subtle group-hover:shadow-card-hover group-hover:border-indigo-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Budget Utilization
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {budgetSummary.overallUtilization}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-indigo-700 transition-colors">
                  {budgetSummary.totalBudgetLimit > 0
                    ? `${formatBDT(budgetSummary.totalRemaining)} left`
                    : 'Configure budgets'}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Two Columns: Recent Transactions & Monthly Budget Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Transactions with Functional Filter Tabs */}
          <Card
            title="Recent Transactions"
            subtitle="Latest financial activity across your accounts"
            action={
              <div className="flex items-center gap-2">
                {/* Type Filter Buttons */}
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px]">
                  {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTransactionFilter(t)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        transactionFilter === t
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {t === 'ALL' ? 'All' : t === 'INCOME' ? 'Income' : 'Expenses'}
                    </button>
                  ))}
                </div>

                <Link
                  to="/transactions"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hidden sm:flex items-center gap-1 pl-1"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            }
            bodyClassName="p-0"
          >
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading transactions...
              </div>
            ) : filteredRecentTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No transactions found</p>
                <p className="text-slate-500 mt-0.5 mb-4">
                  {transactionFilter === 'ALL'
                    ? 'Start tracking by logging your first income or expense.'
                    : `No ${transactionFilter.toLowerCase()} transactions recorded.`}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Link to="/income">
                    <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300 text-xs">
                      Add Income
                    </Button>
                  </Link>
                  <Link to="/expenses">
                    <Button size="sm" variant="outline" className="text-rose-700 border-rose-300 text-xs">
                      Add Expense
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRecentTransactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <div
                      key={`${tx.type}-${tx._id}`}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {tx.category}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">
                            {tx.description || (
                              <span className="italic">{isIncome ? 'Income' : 'Expense'}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs font-bold ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome
                            ? `+${formatBDT(tx.amount)}`
                            : `-${formatBDT(tx.amount)}`}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Monthly Budget Summary Progress */}
          <Card
            title="Monthly Budget Health"
            subtitle="Overall category spending compared to your allocated limits"
            action={
              <Link
                to="/budgets"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Manage Budgets
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {budgetSummary.totalBudgets === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <PieChart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No monthly budgets configured</p>
                <p className="text-slate-500 mt-0.5 mb-3">
                  Assign limits to expense categories to monitor your spending habits.
                </p>
                <Link to="/budgets">
                  <Button size="sm" variant="outline" className="text-xs">
                    Create Budget
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-700">
                      Overall Spending ({budgetSummary.overallUtilization}%)
                    </span>
                    <span
                      className={
                        budgetSummary.overallUtilization > 100
                          ? 'text-rose-600'
                          : budgetSummary.overallUtilization >= 80
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }
                    >
                      {budgetSummary.overallUtilization > 100
                        ? 'Exceeded Limit'
                        : budgetSummary.overallUtilization >= 80
                        ? 'Near Limit'
                        : 'On Track'}
                    </span>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
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
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Limit</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {formatBDT(budgetSummary.totalBudgetLimit)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Spent</p>
                    <p className="text-xs font-bold text-rose-600 mt-0.5">
                      {formatBDT(budgetSummary.totalSpent)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</p>
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        budgetSummary.totalRemaining >= 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {formatBDT(budgetSummary.totalRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right One Column: Savings Goals & Account Snapshot */}
        <div className="space-y-6">
          {/* Active Savings Goals Card */}
          <Card
            title="Savings Goals"
            subtitle="Progress toward milestones"
            action={
              <Link
                to="/goals"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                All ({savingsGoals.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {savingsGoals.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <Target className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No goals set yet</p>
                <p className="text-slate-500 mt-0.5 mb-3">
                  Set milestones for emergency funds, education, or travel.
                </p>
                <Link to="/goals">
                  <Button size="sm" variant="outline" iconLeft={Plus} className="text-xs">
                    Create Goal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savingsGoals.slice(0, 3).map((g) => (
                  <Link
                    key={g._id}
                    to="/goals"
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-slate-50/50 transition-all block group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                        {g.name}
                      </span>
                      <span className="font-bold text-emerald-600 text-[11px]">
                        {g.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 my-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{formatBDT(g.totalSaved || 0)}</span>
                      <span>Target: {formatBDT(g.targetAmount)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Account Profile Snapshot */}
          <Card
            title="Account Snapshot"
            subtitle="Identity and credentials overview"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 font-medium">{user?.name}</span>
                </div>
                <Badge variant="info" size="sm">
                  {user?.role || 'User'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-700 font-mono truncate text-[11px]">
                    {user?.email}
                  </span>
                </div>
              </div>

              {memberDate && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Member Since:</span>
                  </div>
                  <span className="text-slate-700 font-medium">{memberDate}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <Link to="/profile" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    My Profile
                  </Button>
                </Link>
                <Link to="/change-password" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Password
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
