import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Activity, WalletCards, Menu, X, ArrowRight, UserCheck, LayoutDashboard } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import useApiHealth from '../../hooks/useApiHealth.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { data, loading, error } = useApiHealth();
  const { isAuthenticated, user } = useAuth();

  const isHealthy = !loading && !error && data?.database?.connected;
  const isDegraded = !loading && !error && !data?.database?.connected;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <WalletCards className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  FinFlow
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    Academic
                  </span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Personal Finance System
                </p>
              </div>
            </Link>
          </div>

          {/* Center navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-600 bg-brand-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/health"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'text-brand-600 bg-brand-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Activity className="w-3.5 h-3.5" />
              API Diagnostics
            </NavLink>
          </nav>

          {/* Right section: System health badge & Auth actions */}
          <div className="flex items-center gap-3">
            <Link to="/health" className="hidden sm:inline-flex" title="Click to view detailed system health">
              {loading ? (
                <Badge variant="neutral" size="sm" dot>
                  Checking API...
                </Badge>
              ) : isHealthy ? (
                <Badge variant="success" size="sm" dot>
                  API & DB Online
                </Badge>
              ) : isDegraded ? (
                <Badge variant="warning" size="sm" dot>
                  API Up (DB Offline)
                </Badge>
              ) : (
                <Badge variant="error" size="sm" dot>
                  API Offline
                </Badge>
              )}
            </Link>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" iconRight={ArrowRight}>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
