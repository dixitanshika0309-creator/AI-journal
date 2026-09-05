import React, { useState } from 'react';
import { WebhookConfig } from '../types';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Radio,
  Clock,
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WebhookConfig;
  onSaveConfig: (config: WebhookConfig) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [platform, setPlatform] = useState<'slack' | 'discord' | 'custom' | 'email'>(config.platform || 'slack');
  const [enabled, setEnabled] = useState(config.enabled ?? true);
  const [notifyMilestones, setNotifyMilestones] = useState(config.notifyOnMilestones ?? true);
  const [notifyActionPlans, setNotifyActionPlans] = useState(config.notifyOnActionPlans ?? true);
  const [notifyDaily, setNotifyDaily] = useState(config.notifyOnDailyReflect ?? true);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status?: number;
    message?: string;
    error?: string;
    dispatchedAt?: number;
  } | null>(null);

  const handleTestDispatch = async () => {
    if (!url.trim()) {
      setTestResult({
        success: false,
        error: 'Please enter a webhook URL first (e.g. Slack or Discord webhook).',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          platform,
          eventType: 'MILIESTONE_REFLECTION',
          samplePayload: {
            event: 'MILIESTONE_REFLECTION',
            timestamp: new Date().toISOString(),
            app: 'ReflectAI Journal',
            entryTitle: 'Finding Calm in Daily Challenges',
            mood: 'Grateful & Grounded',
            keyTakeaway: 'Breaking overwhelming goals into 5-minute micro steps restores focus.',
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult({
          success: true,
          status: data.status,
          message: data.message || 'Webhook verified and received.',
          dispatchedAt: data.dispatchedAt,
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || 'Webhook test delivery failed.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Network error attempting webhook dispatch.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      url: url.trim(),
      platform,
      enabled,
      notifyOnMilestones: notifyMilestones,
      notifyOnActionPlans: notifyActionPlans,
      notifyOnDailyReflect: notifyDaily,
      lastDispatchedAt: testResult?.dispatchedAt || config.lastDispatchedAt,
      lastStatus: testResult?.status || config.lastStatus,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="notifications-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        id="notifications-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">External Notifications & Webhooks</h3>
              <p className="text-xs text-slate-500">Dispatch journal milestones to Slack, Discord, or custom endpoints</p>
            </div>
          </div>
          <button
            id="close-notifications-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Service Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Destination Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slack', 'discord', 'custom'] as const).map((p) => (
                <button
                  key={p}
                  id={`platform-select-${p}`}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition flex items-center justify-center gap-2 ${
                    platform === p
                      ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${platform === p ? 'text-amber-600' : 'text-slate-300'}`} />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Webhook URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Webhook Endpoint URL
              </label>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                SSRF-Protected
              </span>
            </div>
            <input
              id="webhook-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                platform === 'slack'
                  ? 'https://hooks.slack.com/services/...'
                  : platform === 'discord'
                  ? 'https://discord.com/api/webhooks/...'
                  : 'https://api.yourdomain.com/webhook'
              }
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono text-slate-800 transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Private subnets, local loopbacks, and cloud metadata IPs are automatically blocked.
            </p>
          </div>

          {/* Trigger Toggles */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Event Trigger Rules
            </span>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer transition">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800">Milestone Breakthroughs</span>
                <p className="text-[11px] text-slate-500">Notify when Gemini detects high emotional clarity or major life decisions</p>
              </div>
              <input
                id="toggle-notify-milestones"
                type="checkbox"
                checked={notifyMilestones}
                onChange={(e) => setNotifyMilestones(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer transition">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800">Action Items Extracted</span>
                <p className="text-[11px] text-slate-500">Notify when 2+ practical next steps are synthesized from an entry</p>
              </div>
              <input
                id="toggle-notify-action-plans"
                type="checkbox"
                checked={notifyActionPlans}
                onChange={(e) => setNotifyActionPlans(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer transition">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800">Daily Reflection Wrap-up</span>
                <p className="text-[11px] text-slate-500">Send an evening digest summary of today's key insights</p>
              </div>
              <input
                id="toggle-notify-daily"
                type="checkbox"
                checked={notifyDaily}
                onChange={(e) => setNotifyDaily(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
            </label>
          </div>

          {/* Test Dispatch Button */}
          <div className="pt-2">
            <button
              id="test-webhook-dispatch-btn"
              type="button"
              onClick={handleTestDispatch}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Dispatching Test Payload...' : 'Send Test Webhook Payload'}</span>
            </button>

            {testResult && (
              <div
                className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {testResult.success ? 'Test Successful' : 'Delivery Error'}
                  </p>
                  <p>{testResult.message || testResult.error}</p>
                  {testResult.dispatchedAt && (
                    <span className="text-[10px] text-emerald-700 font-mono block">
                      Dispatched at {new Date(testResult.dispatchedAt).toLocaleTimeString()} (HTTP {testResult.status})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Encrypted local client configuration</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="cancel-notifications-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              id="save-notifications-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
