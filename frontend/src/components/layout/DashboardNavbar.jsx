import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  KeyRound,
  Activity,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../common/Badge.jsx';
import useApiHealth from '../../hooks/useApiHealth.js';

export const DashboardNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error } = useApiHealth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Financial Overview';
      case '/profile':
        return 'User Profile';
      case '/change-password':
        return 'Security & Password';
      case '/health':
        return 'System & API Diagnostics';
      default:
        return 'Personal Finance Management';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isHealthy = !loading && !error && data?.database?.connected;
  const isDegraded = !loading && !error && !data?.database?.connected;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Hamburger button & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {getPageTitle()}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Personal Finance Platform • Phase 2 Authenticated Session
              </p>
            </div>
          </div>

          {/* Right section: System health pill & Profile menu */}
          <div className="flex items-center gap-3">
            {/* Live API & DB health pill */}
            <Link to="/health" className="hidden sm:inline-flex" title="View API Diagnostics">
              {loading ? (
                <Badge variant="neutral" size="sm" dot>
                  Checking API...
                </Badge>
              ) : isHealthy ? (
                <Badge variant="success" size="sm" dot>
                  System Healthy
                </Badge>
              ) : isDegraded ? (
                <Badge variant="warning" size="sm" dot>
                  API Online (DB Offline)
                </Badge>
              ) : (
                <Badge variant="error" size="sm" dot>
                  API Offline
                </Badge>
              )}
            </Link>

            {/* User Profile Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 focus:outline-none transition-colors group"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden md:block text-left min-w-[70px]">
                  <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                    {user?.name || 'Account'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">
                    {user?.role?.toLowerCase() || 'user'}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200/90 shadow-card-hover py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User summary header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="font-semibold text-slate-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge variant="info" size="sm">
                        {user?.role || 'USER'}
                      </Badge>
                      <Badge variant="success" size="sm">
                        {user?.status || 'active'}
                      </Badge>
                    </div>
                  </div>

                  {/* Nav links */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/change-password"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      <span>Change Password</span>
                    </Link>

                    <Link
                      to="/health"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span>API Diagnostics</span>
                    </Link>
                  </div>

                  {/* Logout divider and action */}
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
