import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl font-black text-slate-200">404</span>
      <h1 className="text-xl font-bold text-slate-800 mt-2">
        Page Not Found
      </h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The route you requested could not be located in the personal finance application.
      </p>
      <Link to="/">
        <Button variant="primary" size="sm" iconLeft={ArrowLeft}>
          Return to Overview
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
