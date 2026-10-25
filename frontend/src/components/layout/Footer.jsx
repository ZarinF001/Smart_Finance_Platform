import React from 'react';
import { WalletCards } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto py-5 border-t border-slate-200/70 bg-white text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <div className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center text-white">
            <WalletCards className="w-3 h-3" />
          </div>
          <span>Split Easy</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-normal">Personal Finance</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span>&copy; {new Date().getFullYear()} Split Easy. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
