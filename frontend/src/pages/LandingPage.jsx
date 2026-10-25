import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  PieChart,
  Target,
  ShieldCheck,
  ArrowUpDown,
  CheckCircle2,
  Lock,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-12 py-4">
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-brand-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-medium">
            <Wallet className="w-3.5 h-3.5" />
            <span>Smart Personal Finance Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Take control of your money with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-indigo-200 to-emerald-300">
              Split Easy
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Effortlessly monitor your daily cash flow, plan monthly category budgets, record incremental savings contributions, and reach your financial milestones with confidence.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 font-semibold"
                  iconRight={ArrowRight}
                >
                  Enter Dashboard ({user?.name})
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 font-semibold"
                    iconRight={ArrowRight}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-white border-slate-700 hover:bg-white/10 font-semibold"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      </section>

      {/* Core Feature Pillars */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Designed for simple, stress-free money management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Everything you need to track spending, stay within limits, and build lasting financial habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Income & Expense Tracking
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log daily earnings and expenditures with category tags and payment methods. Keep your transaction ledger organized and searchable.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Category Budgets
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Set monthly spending caps for dining, groceries, utilities, and transport. Automatic gauges alert you before you overspend.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Savings Targets
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Plan for emergencies, travel, or large purchases. Record deposit contributions and calculate exact required monthly savings.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Private & Secure
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your financial records belong exclusively to you. Secured with HTTP-only session cookies and strict tenant data isolation.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Data Security Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            HTTP-Only Cookie Sessions
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Authentication tokens never touch JavaScript local storage, ensuring strong protection against cross-site scripting (XSS) vulnerabilities.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Validated Calculations
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All budgets, remaining amounts, and ledger totals are dynamically computed directly by backend pipelines rather than trusted from the client.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Strict Data Isolation
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every record is strictly associated with your user ID. Unauthorized queries or cross-account access attempts are immediately rejected.
          </p>
        </div>
      </section>

      {/* Call to action card */}
      {!isAuthenticated && (
        <section className="p-8 sm:p-10 rounded-3xl bg-slate-100 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Ready to take charge of your personal finances?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Create your free account today and start tracking your income, expenses, and savings.
            </p>
          </div>
          <Link to="/register" className="flex-shrink-0">
            <Button variant="primary" size="lg" className="bg-brand-600 hover:bg-brand-500 text-white font-semibold">
              Get Started in Seconds
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
