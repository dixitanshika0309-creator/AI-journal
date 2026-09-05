import React from 'react';
import { UserProfile } from '../types';
import {
  Sparkles,
  Shield,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Plus,
  BookOpen,
  AlertCircle,
  Activity,
  Bell,
  MapPin,
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  onSignOut: () => void;
  onNewEntry: () => void;
  syncStatus: 'synced' | 'saving' | 'error';
  onRetrySync?: () => void;
  onOpenThreatModel: () => void;
  onOpenTestWalkthrough: () => void;
  onOpenAdminDashboard: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onNewEntry,
  syncStatus,
  onRetrySync,
  onOpenThreatModel,
  onOpenTestWalkthrough,
  onOpenAdminDashboard,
  onOpenNotifications,
}) => {
  return (
    <header id="app-header" className="bg-white/95 backdrop-blur-xs text-slate-800 border-b border-[#eef2f6] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 tracking-tight">ReflectAI</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Private Journal & Reflection Companion</p>
          </div>
        </div>

        {/* Center Actions / Status */}
        <div className="flex items-center gap-3">
          {/* Firestore Sync Indicator */}
          <div
            id="sync-status-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-slate-200/90 bg-slate-50"
            title="Cloud Firestore Isolated Storage Status"
          >
            {syncStatus === 'synced' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-600 text-[11px] hidden md:inline">Synced to Firestore</span>
              </>
            )}
            {syncStatus === 'saving' && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span className="text-slate-600 text-[11px] hidden md:inline">Saving...</span>
              </>
            )}
            {syncStatus === 'error' && (
              <button
                id="retry-sync-btn"
                onClick={onRetrySync}
                className="flex items-center gap-1 text-rose-600 hover:text-rose-700 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] underline font-medium">Retry Save</span>
              </button>
            )}
          </div>

          {/* New Entry Button */}
          <button
            id="new-entry-navbar-btn"
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-xs hover:shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-semibold">New Entry</span>
          </button>
        </div>

        {/* Right Section: Admin, Webhooks, Security, Tests, User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Admin Dashboard & Telemetry Trigger */}
          <button
            id="open-admin-dashboard-btn"
            onClick={onOpenAdminDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition border border-slate-200 bg-white shadow-2xs"
            title="Admin Console, RBAC & Observability Telemetry"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xl:inline font-medium">Admin & RBAC</span>
          </button>

          {/* External Webhooks Trigger */}
          <button
            id="open-notifications-btn"
            onClick={onOpenNotifications}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:text-amber-600 hover:bg-amber-50/60 transition border border-slate-200 bg-white shadow-2xs"
            title="External Notifications & Webhooks (Slack/Discord)"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xl:inline font-medium">Webhooks</span>
          </button>

          {/* Threat Model Modal Trigger */}
          <button
            id="open-threat-model-btn"
            onClick={onOpenThreatModel}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
            title="View Threat Model & Security Specifications"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline">Security</span>
          </button>

          {/* Test Walkthrough Modal Trigger */}
          <button
            id="open-test-walkthrough-btn"
            onClick={onOpenTestWalkthrough}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
            title="View Test Walkthrough & Verification Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden lg:inline">Walkthrough</span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User Avatar'}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-2xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="hidden 2xl:block text-left">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[110px]">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{user.email}</p>
            </div>

            {/* Sign Out Button */}
            <button
              id="sign-out-btn"
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

