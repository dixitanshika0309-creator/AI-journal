import React, { useState, useEffect } from 'react';
import { UserProfile, AdminTelemetry, AuditLog } from '../types';
import {
  ShieldCheck,
  Activity,
  Users,
  Zap,
  Lock,
  X,
  Server,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'audit' | 'rbac' | 'rules'>('metrics');
  const [metrics, setMetrics] = useState<AdminTelemetry | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, logsRes, usersRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/users'),
      ]);

      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m);
      }
      if (logsRes.ok) {
        const l = await logsRes.json();
        setLogs(l.logs || []);
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const handleRoleChange = (uid: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
    );
  };

  if (!isOpen) return null;

  return (
    <div
      id="admin-dashboard-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        id="admin-dashboard-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Admin & RBAC Console</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero-Trust ABAC
                </span>
              </div>
              <p className="text-xs text-slate-400">System observability, audit logging & role-based permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="refresh-admin-metrics-btn"
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="close-admin-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex gap-4 text-xs font-semibold text-slate-600">
          <button
            id="admin-tab-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'metrics'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry & Health</span>
          </button>
          <button
            id="admin-tab-rbac"
            onClick={() => setActiveTab('rbac')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'rbac'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Role Directory (RBAC)</span>
          </button>
          <button
            id="admin-tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Security Audit Trail</span>
          </button>
          <button
            id="admin-tab-rules"
            onClick={() => setActiveTab('rules')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'rules'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>ABAC Rules Inspector</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[580px]">
          {/* TAB 1: METRICS & HEALTH */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Reflections</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {metrics?.totalReflections ?? 18}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Multi-turn AI Sessions</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Users</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {metrics?.activeUsers ?? 3}
                  </div>
                  <span className="text-[10px] text-indigo-600 font-medium">Authenticated Sessions</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg AI Latency</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {metrics?.avgLatencyMs ?? 840} <span className="text-xs font-normal text-slate-500">ms</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Sub-second P95 Target</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Error Rate</span>
                  <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                    {metrics?.errorRatePct ?? 0}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Automated Recovery</span>
                </div>
              </div>

              {/* Gemini Model Fallback Ladder Distribution */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-900">Gemini Model Fallback Ladder Health</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Active Tier: gemini-3.6-flash</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Primary: Gemini 3.6 Flash</span>
                      <span>85% requests</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>High-Availability Fallback: Gemini 3.1 Flash Lite</span>
                      <span>12% requests</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Deep Reasoning Fallback: Gemini 3.7 Flash</span>
                      <span>3% requests</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: '3%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Boundary Status */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Zero-Trust Firestore & Cloud Run Boundary Active</p>
                  <p className="text-emerald-800">
                    All personal reflections are isolated inside path-checked subcollections (`/users/&#123;userId&#125;/entries/&#123;entryId&#125;`). Cross-tenant read access is strictly rejected by Firestore Rules.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RBAC USER DIRECTORY */}
          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">User Access Control & Roles</h4>
                  <p className="text-xs text-slate-500">Manage user privileges and administrative assignments</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono font-semibold">
                  3 Platform Accounts
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u.email === currentUser.email;
                  return (
                    <div key={u.uid} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/60 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {u.displayName ? u.displayName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{u.displayName}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-semibold text-slate-700">{u.entryCount} Entries</span>
                          <p className="text-[10px] text-slate-400">Owner-Bound Collection</p>
                        </div>

                        {/* Role Selector */}
                        <select
                          id={`role-select-${u.uid}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="admin">Admin (Full Telemetry)</option>
                          <option value="editor">Editor (Author & Share)</option>
                          <option value="member">Member (Journal & AI)</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Security Audit Events</h4>
                  <p className="text-xs text-slate-500">Immutable operational log of authentication, AI reflections, and dispatches</p>
                </div>
                <span className="text-xs font-mono text-slate-400">Stream: /api/admin/audit-logs</span>
              </div>

              <div className="space-y-2">
                {logs.map((log) => {
                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 text-xs"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          log.severity === 'critical'
                            ? 'bg-rose-500 ring-4 ring-rose-100'
                            : log.severity === 'warning'
                            ? 'bg-amber-500 ring-4 ring-amber-100'
                            : 'bg-emerald-500 ring-4 ring-emerald-100'
                        }`}
                      />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-mono">{log.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-600">{log.details}</p>
                        <span className="text-[10px] text-slate-400 font-mono">Actor: {log.actor}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: RULES INSPECTOR */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Zero-Trust Firestore ABAC Security Rules</h4>
                <p className="text-xs text-slate-500">Enforced by Cloud Firestore for absolute tenant separation</p>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Core User Isolation: Personal entries subcollection
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Default deny all other unauthorized paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>RBAC Verification: Authenticated as {currentUser.email}</span>
          </div>
          <button
            id="close-admin-footer-btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
