import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  User,
  KeyRound,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Badge from '../common/Badge.jsx';

export const DashboardNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      case '/income':
        return 'Income Management';
      case '/expenses':
        return 'Expense Management';
      case '/transactions':
        return 'Transaction Ledger';
      case '/budgets':
        return 'Monthly Budgets';
      case '/goals':
        return 'Savings Goals';
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

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/90">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left section: Hamburger button & Page Title */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right section: Profile menu */}
          <div className="flex items-center gap-3">
            {/* User Profile Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100/70 focus:outline-none transition-colors group"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center text-xs font-semibold">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden md:block text-left min-w-[65px]">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user?.name || 'Account'}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize leading-tight">
                    {user?.role?.toLowerCase() || 'user'}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform duration-150 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-md bg-white border border-slate-200/90 shadow-dropdown py-1 z-50 text-xs">
                  {/* User summary header */}
                  <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="font-semibold text-slate-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Badge variant="neutral" size="sm">
                        {user?.role || 'USER'}
                      </Badge>
                      <Badge variant="success" size="sm" dot>
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
