import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Shield,
  KeyRound,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpDown,
  PieChart,
  Target,
  Plus,
  Receipt,
  Scale,
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
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadFinancials = async () => {
      try {
        const [txRes, bSummaryRes, goalsRes] = await Promise.all([
          transactionService.getTransactions({
            limit: 5,
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
        // Fallback silently if unauthenticated or network hiccup
      } finally {
        if (isMounted) {
          setIsLoadingFinancials(false);
        }
      }
    };

    loadFinancials();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-brand-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="success"
              size="sm"
              className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
            >
              Modules 1 & 2 Active
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Session Verified
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Your personal finance system is fully operational. Manage incomes, track expenditures, enforce category budgets, and fund your savings goals.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/income">
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                iconLeft={ArrowDownLeft}
              >
                Incomes
              </Button>
            </Link>
            <Link to="/expenses">
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
                iconLeft={ArrowUpRight}
              >
                Expenses
              </Button>
            </Link>
            <Link to="/budgets">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-slate-600 hover:bg-white/10 text-xs"
                iconLeft={PieChart}
              >
                Budgets
              </Button>
            </Link>
            <Link to="/goals">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-slate-600 hover:bg-white/10 text-xs"
                iconLeft={Target}
              >
                Savings Goals
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative blur */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <Link to="/income" className="block group">
          <Card
            className="border-emerald-200/80 bg-gradient-to-br from-emerald-500/5 via-white to-white group-hover:border-emerald-400 transition-all shadow-subtle group-hover:shadow-card-hover"
            title="Total Inflows"
            subtitle="Recorded revenue"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-emerald-600">
                  {formatBDT(summary.totalIncome)}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-emerald-700 font-medium">
                  View streams
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Outflow */}
        <Link to="/expenses" className="block group">
          <Card
            className="border-rose-200/80 bg-gradient-to-br from-rose-500/5 via-white to-white group-hover:border-rose-400 transition-all shadow-subtle group-hover:shadow-card-hover"
            title="Total Outflows"
            subtitle="Recorded expenses"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-rose-600">
                  {formatBDT(summary.totalExpense)}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-rose-700 font-medium">
                  Review spending
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Net Balance */}
        <Link to="/transactions" className="block group">
          <Card
            className={`border-slate-200/80 bg-gradient-to-br transition-all shadow-subtle group-hover:shadow-card-hover ${
              summary.netBalance >= 0
                ? 'from-brand-500/5 via-white to-white group-hover:border-brand-400'
                : 'from-rose-500/5 via-white to-white group-hover:border-rose-400'
            }`}
            title="Net Cash Flow"
            subtitle="Earnings minus spending"
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-2xl font-black ${
                    summary.netBalance >= 0 ? 'text-brand-600' : 'text-rose-600'
                  }`}
                >
                  {formatBDT(summary.netBalance, { showSign: true })}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-brand-700 font-medium">
                  Ledger feed
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  summary.netBalance >= 0
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                <Scale className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Active Budgets Health */}
        <Link to="/budgets" className="block group">
          <Card
            className="border-indigo-200/80 bg-gradient-to-br from-indigo-500/5 via-white to-white group-hover:border-indigo-400 transition-all shadow-subtle group-hover:shadow-card-hover"
            title="Monthly Budget"
            subtitle={`${budgetSummary.totalBudgets} Active categories`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">
                  {budgetSummary.overallUtilization}%
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-indigo-700 font-medium">
                  {budgetSummary.totalBudgetLimit > 0
                    ? `${formatBDT(budgetSummary.totalRemaining)} left`
                    : 'Set a budget'}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Split: Recent Activity & Savings Goals Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Activity & Savings Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card
            title="Recent Activity"
            subtitle="Latest transactions recorded across all accounts"
            action={
              <Link
                to="/transactions"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            bodyClassName="p-0"
          >
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No transactions recorded yet</p>
                <p className="text-slate-500 mt-0.5 mb-4">
                  Add your first income or expense to populate your financial feed.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Link to="/income">
                    <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-200">
                      Add Income
                    </Button>
                  </Link>
                  <Link to="/expenses">
                    <Button size="sm" variant="outline" className="text-rose-700 border-rose-200">
                      Add Expense
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <div
                      key={`${tx.type}-${tx._id}`}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                              <span className="italic">{isIncome ? 'Income' : 'Expense'} record</span>
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
                            ? formatBDT(tx.amount, { showSign: true })
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

          {/* Savings Goals Spotlight */}
          <Card
            title="Active Savings Targets"
            subtitle="Progress toward your key financial milestones"
            action={
              <Link
                to="/goals"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                All Goals ({savingsGoals.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {savingsGoals.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <Target className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No savings goals created</p>
                <p className="text-slate-500 mt-0.5 mb-3">
                  Define milestone targets to save for emergencies, education, or travel.
                </p>
                <Link to="/goals">
                  <Button size="sm" variant="outline" iconLeft={Plus} className="text-xs">
                    Create Goal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {savingsGoals.map((g) => (
                  <Link
                    key={g._id}
                    to="/goals"
                    className="p-3.5 rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-slate-50/50 transition-all block group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                        {g.name}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600">
                        {g.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 my-2 overflow-hidden">
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
        </div>

        {/* Right Column: Quick Navigation & Roadmap */}
        <div className="space-y-6">
          <Card
            title="Module Navigation"
            subtitle="Direct shortcuts to all financial tools"
          >
            <div className="space-y-2 text-xs">
              <Link
                to="/income"
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Income Management</p>
                    <p className="text-slate-400 text-[10px]">Filter & record earnings</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform" />
              </Link>

              <Link
                to="/expenses"
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Expense Management</p>
                    <p className="text-slate-400 text-[10px]">Log spending & methods</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-transform" />
              </Link>

              <Link
                to="/transactions"
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Combined Ledger</p>
                    <p className="text-slate-400 text-[10px]">Full transaction history</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-transform" />
              </Link>

              <Link
                to="/budgets"
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <PieChart className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Monthly Budgets</p>
                    <p className="text-slate-400 text-[10px]">Category limits & alerts</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform" />
              </Link>

              <Link
                to="/goals"
                className="p-2.5 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Savings Goals</p>
                    <p className="text-slate-400 text-[10px]">Targets & monthly plans</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform" />
              </Link>
            </div>
          </Card>

          <Card
            title="System Roadmap"
            subtitle="Project sprint progression"
          >
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 font-semibold">
                    Module 1 & 2 Completed
                  </strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Transactions, Incomes, Expenses, Budgets & Savings Goals fully operational.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold">
                    Module 3: Reports & Visualizations (Next)
                  </strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Interactive cash flow analytics, breakdown charts, and statement export.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
