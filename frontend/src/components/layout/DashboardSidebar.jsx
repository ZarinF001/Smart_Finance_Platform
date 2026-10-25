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
      label: 'Overview',
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
          name: 'Profile',
          path: '/profile',
          icon: User,
        },
        {
          name: 'Security & Password',
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
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Compact, refined sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-60 bg-white text-slate-700 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-slate-200/90 lg:translate-x-0',
          isOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        )}
      >
        <div>
          {/* Brand header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center text-white shadow-subtle group-hover:bg-brand-700 transition-colors">
                <WalletCards className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                  Split Easy
                  {user?.role === 'ADMIN' && (
                    <span className="text-[9px] uppercase font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                      Admin
                    </span>
                  )}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                  Personal Finance
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation sections */}
          <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-7.5rem)]">
            {navItems.map((section) => (
              <div key={section.label}>
                <p className="px-2.5 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {section.label}
                </p>
                <nav className="space-y-0.5">
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
                            'flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-brand-600 pl-2'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          )
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0 opacity-80" />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* User Mini Profile in Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-white transition-colors">
            <Link
              to="/profile"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-2 min-w-0 group"
              title="View profile"
            >
              <div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight group-hover:text-brand-600 transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                  {user?.email || 'Account'}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors flex-shrink-0"
              title="Sign out of Split Easy"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
