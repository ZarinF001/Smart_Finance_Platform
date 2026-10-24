import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Layers,
  Database,
  Shield,
  Palette,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  Wallet,
} from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import notify from '../utils/notify.js';

export const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-navy-900 to-brand-900 text-white p-8 sm:p-10 shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <Badge variant="info" size="md" dot className="bg-brand-500/20 text-brand-200 border-brand-400/30">
            Phase 1: Project Setup & Architecture
          </Badge>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Personal Finance Management System
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Welcome to the foundational release of our university full-stack project. The Express.js backend, MongoDB database layer, Vite React frontend, and financial UI design system are successfully initialized and connected.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/health">
              <Button
                variant="primary"
                size="md"
                className="bg-brand-500 hover:bg-brand-400 shadow-md"
                iconRight={ArrowRight}
              >
                Test Live Backend Health
              </Button>
            </Link>

            <Button
              variant="outline"
              size="md"
              className="text-white border-slate-600 hover:bg-white/10"
              iconLeft={BellRing}
              onClick={() => notify.success('Notification system (Sonner) is operational!')}
            >
              Test Notification
            </Button>
          </div>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Aesthetic Design System Foundation Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-600" />
              Design System & Color Tokens
            </h2>
            <p className="text-xs text-slate-500">
              Established financial color tokens, typography, and card hierarchy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Positive Financial Value Card */}
          <Card
            title="Positive Financial Flow"
            subtitle="Income & Net Assets Token"
            className="border-emerald-100 hover:border-emerald-200"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-emerald-600 tracking-tight">
                  +$12,450.00
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Positive values use emerald-600
                </p>
              </div>
              <Badge variant="success" size="sm" dot>
                Surplus
              </Badge>
            </div>
          </Card>

          {/* Negative Financial Value Card */}
          <Card
            title="Expense & Liabilities"
            subtitle="Debit & Outflow Token"
            className="border-rose-100 hover:border-rose-200"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-rose-600 tracking-tight">
                  -$4,120.50
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500 rotate-180" />
                  Expenses use rose/red-600
                </p>
              </div>
              <Badge variant="error" size="sm" dot>
                Outflow
              </Badge>
            </div>
          </Card>

          {/* Warning / Budget Threshold Card */}
          <Card
            title="Budget Threshold"
            subtitle="Warning & Alert Token"
            className="border-amber-100 hover:border-amber-200"
          >
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-600 tracking-tight">
                  85% Utilized
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Warnings use amber-500/600
                </p>
              </div>
              <Badge variant="warning" size="sm" dot>
                Near Limit
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Architecture Overview Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-brand-600" />
          Technical Stack & Architecture Foundation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Backend Stack */}
          <Card
            title="Backend Stack (Node.js & Express)"
            subtitle="Independent REST API service"
          >
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Express.js (ES Modules):</strong> Native ES6 imports with clean route separation and controller pattern.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">MongoDB & Mongoose:</strong> Connection lifecycle manager with automatic reconnect and readyState polling.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Zod & Dotenv:</strong> Type-safe environment validation and robust request schema parsing.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Error & 404 Handlers:</strong> Centralized error formatting for production safety.
                </div>
              </li>
            </ul>
          </Card>

          {/* Frontend Stack */}
          <Card
            title="Frontend Stack (React & Vite)"
            subtitle="Single Page Application client"
          >
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">React.js + Vite:</strong> Rapid hot module reloading with standard JavaScript (ES6+).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Tailwind CSS:</strong> Curated color tokens (Navy primary, Emerald positive, Amber warning).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Centralized Axios:</strong> Pre-configured instance with baseURL interceptor and uniform error handling.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Sonner Notifications & Lucide Icons:</strong> Consistent feedback toasts and cohesive iconography.
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
