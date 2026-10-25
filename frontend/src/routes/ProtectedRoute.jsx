import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2, ShieldAlert } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

/**
 * Route guard for authenticated users with optional role checking
 * @param {{ requiredRole?: 'USER' | 'ADMIN' }} props
 */
export const ProtectedRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-xs text-slate-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login, preserving intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based permission if specified
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 border-rose-200">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            This page requires <span className="font-semibold">{requiredRole}</span> privileges. Your current role is <span className="font-semibold">{user.role}</span>.
          </p>
          <Button variant="primary" size="sm" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
