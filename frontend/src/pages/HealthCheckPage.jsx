import React, { useState } from 'react';
import { Activity, RefreshCw, Database, Server, Clock, Cpu, CheckCircle2, AlertCircle, XCircle, Zap, Code, BellRing, HelpCircle, } from 'lucide-react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import useApiHealth from '../hooks/useApiHealth.js';
import notify from '../utils/notify.js';

export const HealthCheckPage = () => {
  const { data, loading, error, latency, lastChecked, refetch } = useApiHealth(true);
  const [showRawJson, setShowRawJson] = useState(false);

  const isConnectedToApi = !loading && !error && data;
  const isDbConnected = data?.database?.connected;

  const handleManualRefresh = async () => {
    try {
      await refetch();
      notify.success('Health check refreshed successfully');
    } catch (err) {
      notify.error('Failed to contact backend API');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              API & Database Diagnostics
            </h1>
            <Badge variant="info" size="sm">
              Dev Tools
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time verification of frontend-to-backend communication and database connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            loading={loading}
            iconLeft={RefreshCw}
          >
            Recheck Connection
          </Button>
        </div>
      </div>

      {/* Main Status Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend API Status */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Express API</p>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {loading ? 'Checking...' : isConnectedToApi ? 'Operational' : 'Unavailable'}
              </h4>
            </div>
            <div
              className={`p-2 rounded-xl ${loading
                  ? 'bg-slate-100 text-slate-500'
                  : isConnectedToApi
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
            >
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Endpoint:</span>
            <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
              GET /api/health
            </code>
          </div>
        </Card>

        {/* Database Status */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">MongoDB Database</p>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {loading
                  ? 'Checking...'
                  : isDbConnected
                    ? 'Connected'
                    : 'Disconnected'}
              </h4>
            </div>
            <div
              className={`p-2 rounded-xl ${loading
                  ? 'bg-slate-100 text-slate-500'
                  : isDbConnected
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
            >
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">State:</span>
            <Badge
              variant={isDbConnected ? 'success' : 'warning'}
              size="sm"
              dot
            >
              {data?.database?.status || 'offline'}
            </Badge>
          </div>
        </Card>

        {/* Network Latency */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Round-trip Latency</p>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {latency !== null ? `${latency} ms` : '--'}
              </h4>
            </div>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Axios Client:</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </Card>

        {/* Server Uptime */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Server Uptime</p>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {data?.uptime || '--'}
              </h4>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Node Env:</span>
            <span className="font-mono text-slate-700 capitalize">
              {data?.environment || 'development'}
            </span>
          </div>
        </Card>
      </div>

      {/* Database Connection Note & Guidance */}
      {!isDbConnected && !loading && isConnectedToApi && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-amber-800">
              MongoDB server is currently offline or unreachable.
            </p>
            <p className="text-amber-700 leading-relaxed">
              The Express backend and health check endpoint are operating normally. To connect a database:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800/90 pl-1 font-mono text-[11px]">
              <li>Local MongoDB: Run <code className="bg-amber-100 px-1 py-0.5 rounded">mongod</code> or start the MongoDB service.</li>
              <li>MongoDB Atlas: Set <code className="bg-amber-100 px-1 py-0.5 rounded">MONGODB_URI=mongodb+srv://&lt;user&gt;:&lt;password&gt;@...</code> in <code className="bg-amber-100 px-1 py-0.5 rounded">backend/.env</code>.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Deep Diagnostic Breakdown & Notification Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System & Runtime Metadata */}
        <Card title="System Runtime Details" subtitle="Backend environment variables & specs">
          {isConnectedToApi ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Service Name</span>
                <span className="font-medium text-slate-900">{data.service}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">API Version</span>
                <span className="font-mono text-slate-900">v{data.version}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Node.js Version</span>
                <span className="font-mono text-slate-900">{data.system?.nodeVersion}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Host Platform</span>
                <span className="font-mono text-slate-900">{data.system?.platform}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Memory RSS / Heap</span>
                <span className="font-mono text-slate-900">
                  {data.system?.memoryUsage?.rss} / {data.system?.memoryUsage?.heapUsed}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Last Verified</span>
                <span className="text-slate-700">
                  {lastChecked ? lastChecked.toLocaleTimeString() : '--'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              {loading ? 'Fetching diagnostics...' : 'Backend is not reachable.'}
            </div>
          )}
        </Card>

        {/* Sonner Notification Testing Sandbox */}
        <Card
          title="Notification System (Sonner)"
          subtitle="Interactive test sandbox for application feedback"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify that the Sonner notification provider is fully configured with proper color tokens and positions.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="emerald"
                size="sm"
                onClick={() =>
                  notify.success('Income transaction created successfully!')
                }
              >
                Trigger Success
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  notify.error('Database connection timed out. Please retry.')
                }
              >
                Trigger Error
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  notify.warning('Monthly budget limit reached (92% spent).')
                }
              >
                Trigger Warning
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  notify.info('New financial report generated for October.')
                }
              >
                Trigger Info
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Raw Response Accordion */}
      <Card
        title="Raw Health Response Payload"
        subtitle="Live JSON returned by backend"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRawJson(!showRawJson)}
            iconLeft={Code}
          >
            {showRawJson ? 'Hide JSON' : 'Show JSON'}
          </Button>
        }
      >
        {showRawJson ? (
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed max-h-72">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Click &quot;Show JSON&quot; above to inspect the exact payload received from Axios.
          </div>
        )}
      </Card>
    </div>
  );
};

export default HealthCheckPage;
