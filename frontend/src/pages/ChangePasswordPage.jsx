import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import authService from '../services/authService.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import notify from '../utils/notify.js';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.currentPassword) {
      setErrorMessage('Current password is required.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setErrorMessage('New password must be different from your current password.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      notify.success('Your password has been changed successfully.');
      setSuccessMessage('Password changed successfully! Your session is up to date.');

      // Clear input fields
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to update password. Please verify your current password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isNewPasswordLongEnough = formData.newPassword.length >= 6;
  const isDifferentFromCurrent =
    formData.newPassword.length > 0 &&
    formData.newPassword !== formData.currentPassword;
  const doNewPasswordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.newPassword === formData.confirmPassword;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Security & Password
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Update your login password to maintain high account security.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{errorMessage}</p>
        </div>
      )}

      <Card
        title="Change Account Password"
        subtitle="Enter your current password and choose a new secure password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 placeholder:text-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 placeholder:text-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showNew ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your new password"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 placeholder:text-slate-400 transition-colors"
              />
            </div>

            {/* Live Password Rules Feedback */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px]">
              <span
                className={`flex items-center gap-1 ${
                  isNewPasswordLongEnough ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Min 6 characters
              </span>
              <span
                className={`flex items-center gap-1 ${
                  isDifferentFromCurrent ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Differs from current
              </span>
              <span
                className={`flex items-center gap-1 ${
                  doNewPasswordsMatch ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Passwords match
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              loading={submitting}
              iconRight={ArrowRight}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
