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
  Clock,
  Sparkles,
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await authService.getMe();
      if (response?.data?.user) {
        updateUser(response.data.user);
        notify.success('Profile information updated from backend.');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to refresh profile.');
    } finally {
      setRefreshing(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

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
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              User Profile
            </h1>
            <Badge variant="info" size="sm">
              Live API Data
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Account identity, system permissions, and authentication metadata.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            iconLeft={RefreshCw}
          >
            Refresh Profile
          </Button>

          <Link to="/change-password">
            <Button variant="primary" size="sm" iconLeft={KeyRound}>
              Change Password
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Avatar */}
        <Card className="text-center p-6 lg:col-span-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-extrabold mx-auto shadow-md shadow-brand-500/20 mb-4">
            {getInitials(user?.name)}
          </div>

          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {user?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="info" size="sm">
              {user?.role || 'USER'}
            </Badge>
            <Badge variant="success" size="sm" dot>
              {user?.status || 'active'}
            </Badge>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-left text-xs text-slate-500 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account ID:</span>
              <span className="font-mono text-[11px] text-slate-700 truncate max-w-[130px]">
                {user?._id || '--'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Security Mode:</span>
              <span className="text-emerald-600 font-medium">HTTP-only Cookie</span>
            </div>
          </div>
        </Card>

        {/* Detailed Profile Attributes */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Profile Details"
            subtitle="Verified credentials currently stored in MongoDB"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-500">Full Name</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                </div>

                {/* Email Address */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-500">Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Role */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Shield className="w-4 h-4 text-brand-600" />
                    <span className="font-medium text-slate-500">System Role</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    {user?.role}
                    {user?.role === 'ADMIN' && (
                      <span className="text-[10px] text-brand-600 font-bold px-1.5 py-0.5 rounded bg-brand-50 border border-brand-200">
                        Admin Privileges
                      </span>
                    )}
                  </p>
                </div>

                {/* Account Status */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-slate-500">Account Status</span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700 capitalize">
                    {user?.status}
                  </p>
                </div>
              </div>

              {/* Registration Timestamp */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Member Since
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Initial account registration date
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-medium text-slate-700">
                  {formattedDate}
                </span>
              </div>
            </div>
          </Card>

          {/* Backend Security Notice Card */}
          <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200/70 flex items-start gap-3 text-xs text-brand-900">
            <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-brand-800">
                Security & Role Information
              </p>
              <p className="text-brand-700 leading-relaxed">
                Roles and account status are strictly governed by the backend. System administrators can be provisioned through the server seed script (<code className="bg-brand-100 px-1 py-0.5 rounded font-mono text-[11px]">npm run seed:admin</code>).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
