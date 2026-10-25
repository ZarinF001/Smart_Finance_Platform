import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpDown,
  PieChart,
  Target,
  User,
  KeyRound,
  LogOut,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';

export const DashboardSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Main',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'Finances',
      items: [
        {
          name: 'Income',
          path: '/income',
          icon: ArrowDownLeft,
        },
        {
          name: 'Expenses',
          path: '/expenses',
          icon: ArrowUpRight,
        },
        {
          name: 'Transactions',
          path: '/transactions',
          icon: ArrowUpDown,
        },
        {
          name: 'Budgets',
          path: '/budgets',
          icon: PieChart,
        },
        {
          name: 'Savings Goals',
          path: '/goals',
          icon: Target,
        },
      ],
    },
    {
      label: 'Account',
      items: [
        {
          name: 'My Profile',
          path: '/profile',
          icon: User,
        },
        {
          name: 'Change Password',
          path: '/change-password',
          icon: KeyRound,
        },
      ],
    },
  ];

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
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-xl lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top brand header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <WalletCards className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Split Easy
                  {user?.role === 'ADMIN' && (
                    <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      Admin
                    </span>
                  )}
                </span>
                <p className="text-[10px] text-slate-400 font-medium leading-none">
                  Personal Finance
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation sections */}
          <div className="p-3.5 space-y-5 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
            {navItems.map((section) => (
              <div key={section.label}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                            isActive
                              ? 'bg-brand-600 text-white font-semibold shadow-sm shadow-brand-600/30'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          )
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Mini Profile & Logout in Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <Link
              to="/profile"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-2.5 min-w-0 group"
              title="View my profile"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-brand-300 transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'authenticated'}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
              title="Sign out of Split Easy"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
