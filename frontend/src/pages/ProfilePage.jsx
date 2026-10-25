import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Lock,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/authService.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import notify from '../utils/notify.js';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await authService.getMe();
      if (response?.data?.user) {
        updateUser(response.data.user);
        notify.success('Profile information refreshed.');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to refresh profile.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      setCopiedId(true);
      notify.success('Account ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Member';

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal profile, credentials, and security preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            iconLeft={RefreshCw}
            className="text-xs text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </Button>

          <Link to="/change-password">
            <Button
              variant="primary"
              size="sm"
              iconLeft={KeyRound}
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm text-xs"
            >
              Update Password
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Identity & Quick Status */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="text-center p-6 border-slate-200/90 shadow-subtle">
            {/* Minimalist, refined avatar monogram */}
            <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto ring-4 ring-slate-100 mb-3 tracking-tight">
              {getInitials(user?.name)}
            </div>

            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {user?.name || 'Account Holder'}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>

            <div className="mt-3.5 flex items-center justify-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {user?.role || 'USER'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-left text-xs space-y-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Account Identifier
                </span>
                <div className="flex items-center justify-between mt-1 p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="font-mono text-[11px] text-slate-700 truncate mr-2 select-all">
                    {user?._id || '--'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                    title="Copy Account ID"
                    aria-label="Copy Account ID"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Member Since:
                </span>
                <span className="font-medium text-slate-700">{formattedDate}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Shield className="w-3.5 h-3.5" />
                  Session Status:
                </span>
                <span className="text-emerald-700 font-medium">Secured</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Profile Information & Security Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card
            title="Profile Details"
            subtitle="Your registered personal information and credentials"
            className="border-slate-200/90 shadow-subtle"
          >
            <div className="divide-y divide-slate-100 text-xs">
              {/* Full Name */}
              <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex items-center gap-2 text-slate-500 font-medium sm:w-1/3">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Full Name</span>
                </div>
                <div className="sm:w-2/3">
                  <span className="font-semibold text-slate-900 text-sm">
                    {user?.name || 'Not provided'}
                  </span>
                </div>
              </div>

              {/* Email Address */}
              <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex items-center gap-2 text-slate-500 font-medium sm:w-1/3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Email Address</span>
                </div>
                <div className="sm:w-2/3 flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-800">
                    {user?.email}
                  </span>
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Role & Privileges */}
              <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex items-center gap-2 text-slate-500 font-medium sm:w-1/3">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>System Role</span>
                </div>
                <div className="sm:w-2/3 flex items-center gap-2">
                  <span className="font-medium text-slate-800">
                    {user?.role === 'ADMIN' ? 'System Administrator' : 'Standard User'}
                  </span>
                  {user?.role === 'ADMIN' && (
                    <Badge variant="info" size="sm">
                      Full Admin Access
                    </Badge>
                  )}
                </div>
              </div>

              {/* Default Currency */}
              <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex items-center gap-2 text-slate-500 font-medium sm:w-1/3">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>Base Currency</span>
                </div>
                <div className="sm:w-2/3 flex items-center gap-2">
                  <span className="font-medium text-slate-800 font-mono">
                    BDT (৳)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Bangladeshi Taka
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Security & Authentication Panel */}
          <Card
            title="Security & Authentication"
            subtitle="Manage your password and active authentication protection"
            className="border-slate-200/90 shadow-subtle"
          >
            <div className="divide-y divide-slate-100 text-xs">
              {/* Password Setting Row */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Account Password</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Last updated during account setup. Use a strong, unique password.
                  </p>
                </div>
                <Link to="/change-password">
                  <Button
                    variant="outline"
                    size="sm"
                    iconLeft={KeyRound}
                    className="text-xs text-slate-700 whitespace-nowrap"
                  >
                    Change Password
                  </Button>
                </Link>
              </div>

              {/* Session Security Row */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>HTTP-Only Cookie Session</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Your authentication token is stored securely in an encrypted HTTP-only cookie to prevent XSS attacks.
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  Active & Encrypted
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
