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
  Plus,
  Receipt,
  Scale,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import transactionService from '../services/transactionService.js';
import { formatBDT, formatDate } from '../utils/currency.js';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoadingFinancials, setIsLoadingFinancials] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadFinancials = async () => {
      try {
        const res = await transactionService.getTransactions({
          limit: 5,
          sortBy: 'date',
          sortOrder: 'desc',
        });
        if (isMounted) {
          setSummary(res.meta?.summary || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
          setRecentTransactions(res.items || []);
        }
      } catch (err) {
        // Fallback silently if unauthenticated or error
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
              Module 1 Active
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Session Verified
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Your financial transaction management system is online. You can record incomes, track daily expenses, and analyze your net cash flow in real-time.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/income">
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                iconLeft={ArrowDownLeft}
              >
                Manage Incomes
              </Button>
            </Link>
            <Link to="/expenses">
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white"
                iconLeft={ArrowUpRight}
              >
                Manage Expenses
              </Button>
            </Link>
            <Link to="/transactions">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-slate-600 hover:bg-white/10"
                iconLeft={ArrowUpDown}
              >
                Unified Ledger
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative blur */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Inflow */}
        <Link to="/income" className="block group">
          <Card
            className="border-emerald-200/80 bg-gradient-to-br from-emerald-500/5 via-white to-white group-hover:border-emerald-400 transition-all shadow-subtle group-hover:shadow-card-hover"
            title="Total Inflows"
            subtitle="Recorded revenue & income"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-emerald-600">
                  {formatBDT(summary.totalIncome)}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-emerald-700 font-medium">
                  View income streams
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Total Outflow */}
        <Link to="/expenses" className="block group">
          <Card
            className="border-rose-200/80 bg-gradient-to-br from-rose-500/5 via-white to-white group-hover:border-rose-400 transition-all shadow-subtle group-hover:shadow-card-hover"
            title="Total Outflows"
            subtitle="Recorded expenses & bills"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-rose-600">
                  {formatBDT(summary.totalExpense)}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 group-hover:text-rose-700 font-medium">
                  Review expenditures
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
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
            subtitle="Total earnings minus spending"
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
                  Open full transaction ledger
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  summary.netBalance >= 0
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                <Scale className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions list */}
        <div className="lg:col-span-2">
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
        </div>

        {/* Quick Financial Shortcuts */}
        <div className="space-y-6">
          <Card
            title="Module Navigation"
            subtitle="Direct shortcuts to financial pages"
          >
            <div className="space-y-2.5 text-xs">
              <Link
                to="/income"
                className="p-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Income Ledger</p>
                    <p className="text-slate-500 text-[11px]">
                      Filter, edit and log income streams
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/expenses"
                className="p-3 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Expense Ledger</p>
                    <p className="text-slate-500 text-[11px]">
                      Log expenses and payment modes
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/transactions"
                className="p-3 rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Combined Ledger</p>
                    <p className="text-slate-500 text-[11px]">
                      Unified chronological financial feed
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </Card>

          <Card
            title="System Roadmap"
            subtitle="Project sprint progression"
          >
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 font-semibold">
                    Module 1: Financial Transactions (Done)
                  </strong>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Full CRUD for Incomes, Expenses, and Unified Ledger with BDT formatting.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-semibold">
                    Module 2: Budgets & Goals (Next)
                  </strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Category spending limits and target savings progress tracking.
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
