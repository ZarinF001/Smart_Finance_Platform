import React from 'react';
import { Heart, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>Personal Finance Management System</span>
          <span>•</span>
          <span>University Academic Project</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/health"
            className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Status</span>
          </Link>
          <span>•</span>
          <span className="text-slate-400">Phase 1: Setup & Foundation</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
