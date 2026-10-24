import React from 'react';
import { Link } from 'react-router-dom';
import {
  WalletCards,
  ShieldCheck,
  Layers,
  ArrowRight,
  TrendingUp,
  PieChart,
  Target,
  BarChart3,
  CheckCircle2,
  Lock,
  Database,
  Activity,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-12">
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-navy-900 to-brand-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="info"
              size="md"
              dot
              className="bg-brand-500/20 text-brand-200 border-brand-400/30"
            >
              Academic Software Architecture
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              University Project • Full-Stack
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Personal Finance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-indigo-200 to-emerald-300">
              Management Platform
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            An academic full-stack platform designed to help students and individuals monitor cash flow, plan monthly budgets, set savings goals, and analyze spending patterns securely.
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
                    iconLeft={UserCheck}
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}

            <Link to="/health">
              <Button
                variant="ghost"
                size="lg"
                className="text-slate-300 hover:text-white hover:bg-white/5"
                iconLeft={Activity}
              >
                API Diagnostics
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      </section>

      {/* Development Status Highlights */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            Platform Capabilities & Current Progress
          </h2>
          <p className="text-xs text-slate-500">
            Current release status across the four development phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase 1 card */}
          <Card className="border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="success" size="sm" dot>
                Phase 1 Active
              </Badge>
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              System Architecture
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Express REST API, Mongoose ODM, Vite React, and centralized error handling.
            </p>
          </Card>

          {/* Phase 2 card */}
          <Card className="border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="success" size="sm" dot>
                Phase 2 Active
              </Badge>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Authentication & Roles
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bcrypt hashing, JWT generation, HTTP-only cookies, and profile management.
            </p>
          </Card>

          {/* Phase 3 card (Active) */}
          <Card className="border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="success" size="sm" dot>
                Phase 3 Active
              </Badge>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Financial Core (Modules 1 & 2)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Incomes, expenses, unified ledger, category budgets, and savings goals.
            </p>
          </Card>

          {/* Phase 4 card (Upcoming) */}
          <Card className="border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="neutral" size="sm">
                Phase 4 (Future)
              </Badge>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Analytics & Reports
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visual cash-flow graphs, category analytics, and exportable financial reports.
            </p>
          </Card>
        </div>
      </section>

      {/* Security & Data Integrity Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            HTTP-Only Cookie Sessions
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Authentication tokens never touch JavaScript local storage, ensuring strong defense against cross-site scripting (XSS) leaks.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Zod Schema Validation
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every incoming payload is validated against strict schemas, enforcing sanitized inputs and email normalization.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-subtle space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Role-Based Authorization
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Standard accounts are restricted to user-level operations, while admin functions require cryptographically verified role permissions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
