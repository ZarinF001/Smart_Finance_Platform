import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import GuestRoute from './GuestRoute.jsx';

// Pages
import LandingPage from '../pages/LandingPage.jsx';
import HealthCheckPage from '../pages/HealthCheckPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import IncomePage from '../pages/IncomePage.jsx';
import ExpensePage from '../pages/ExpensePage.jsx';
import TransactionsPage from '../pages/TransactionsPage.jsx';
import BudgetsPage from '../pages/BudgetsPage.jsx';
import SavingsGoalsPage from '../pages/SavingsGoalsPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import ChangePasswordPage from '../pages/ChangePasswordPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Visitor Layout Routes */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/health" element={<HealthCheckPage />} />
      </Route>

      {/* 2. Guest-Only Routes (Redirects to /dashboard if logged in) */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* 3. Protected Authenticated Application Routes (Requires login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/goals" element={<SavingsGoalsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      {/* 4. Fallback 404 Route */}
      <Route element={<RootLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
