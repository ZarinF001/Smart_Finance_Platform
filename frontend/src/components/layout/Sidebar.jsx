import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  ArrowUpDown,
  PieChart,
  Target,
  BarChart3,
  Settings,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';
import Badge from '../common/Badge.jsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      name: 'Overview',
      path: '/',
      icon: LayoutDashboard,
      activeExact: true,
      enabled: true,
    },
    {
      name: 'API Health Check',
      path: '/health',
      icon: Activity,
      enabled: true,
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: ArrowUpDown,
      badge: 'Phase 2',
      enabled: false,
    },
    {
      name: 'Budgets',
      path: '/budgets',
      icon: PieChart,
      badge: 'Phase 3',
      enabled: false,
    },
    {
      name: 'Savings Goals',
      path: '/goals',
      icon: Target,
      badge: 'Phase 3',
      enabled: false,
    },
    {
      name: 'Analytics & Reports',
      path: '/analytics',
      icon: BarChart3,
      badge: 'Phase 4',
      enabled: false,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Platform Modules
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                if (!item.enabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2 text-sm text-slate-400 rounded-lg cursor-not-allowed select-none hover:bg-slate-50"
                      title="This module will be developed in future phases"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-300" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold border-l-2 border-brand-600 pl-2.5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="info" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-brand-50/40 border border-slate-200/70 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Phase 1 Architecture</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Foundation layer with Express, MongoDB, Vite React, and Tailwind CSS.
            </p>
          </div>
        </div>

        {/* University Academic Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                University Project
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                Full-Stack Architecture
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
