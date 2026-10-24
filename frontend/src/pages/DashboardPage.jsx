import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-brand-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="info"
              size="sm"
              className="bg-brand-500/20 text-brand-200 border-brand-400/30"
            >
              Phase 2 Active
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Session Verified
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Your authenticated session is active and secured via HTTP-only JWT cookies. The user management foundation is operational.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/profile">
              <Button
                variant="primary"
                size="sm"
                className="bg-brand-500 hover:bg-brand-400"
                iconRight={ArrowRight}
              >
                View Profile
              </Button>
            </Link>
            <Link to="/health">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-slate-600 hover:bg-white/10"
                iconLeft={Activity}
              >
                System Diagnostics
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative blur */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Account Role Card */}
        <Card title="Account Identity" subtitle="System authorization level">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-slate-900">
                {user?.role || 'USER'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.role === 'ADMIN'
                  ? 'Full administrative access'
                  : 'Standard user privileges'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Account Status Card */}
        <Card title="Account Health" subtitle="Current status in database">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-emerald-600 capitalize">
                {user?.status || 'Active'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Session verified against backend
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Security State Card */}
        <Card title="Security Mode" subtitle="Token delivery mechanism">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-slate-900">
                HTTP-Only
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Protected against XSS token leakage
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Project Sprint & Roadmap Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current State Info */}
        <Card
          title="Module Status & Roadmap"
          subtitle="University full-stack project development phases"
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900 font-semibold">
                  Phase 1 & 2: Architecture & Authentication (Completed)
                </strong>
                <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
                  Express API, MongoDB connectivity, React + Vite frontend, and full user authentication (registration, login, profile, password changes) are fully operational.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 font-semibold">
                  Phase 3: Financial Core (Upcoming Sprint)
                </strong>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Income tracking, expense categorization, transaction history, monthly budgets, and savings goals will be implemented in the next sprint.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 font-semibold">
                  Phase 4: Visualizations & Analytics (Future)
                </strong>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Interactive cash-flow graphs, category spending breakdowns, and PDF statement exports.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Management Shortcuts */}
        <Card
          title="Account Shortcuts"
          subtitle="Quick access to active account settings"
        >
          <div className="space-y-3 text-xs">
            <Link
              to="/profile"
              className="p-3 rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-100 text-slate-600 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Review Profile</p>
                  <p className="text-slate-500 text-[11px]">
                    Inspect live attributes verified from backend
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/change-password"
              className="p-3 rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-100 text-slate-600 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Change Password
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Update your account login credentials
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/health"
              className="p-3 rounded-xl border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-100 text-slate-600 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    API & Database Diagnostics
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Verify MongoDB connectivity and latency
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
