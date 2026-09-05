import React, { useState } from 'react';
import { Sparkles, Shield, Lock, Database, ArrowRight, Brain, CheckCircle, AlertCircle } from 'lucide-react';

interface AuthLandingProps {
  onSignIn: () => Promise<any>;
  onOpenThreatModel: () => void;
  onOpenTestWalkthrough: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onSignIn,
  onOpenThreatModel,
  onOpenTestWalkthrough,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignInClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onSignIn();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Another sign-in window was already open.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-800 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Banner / Navigation */}
      <header className="border-b border-[#eef2f6] bg-white/80 backdrop-blur-xs px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">ReflectAI</span>
            <span className="ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Gemini 3.6 Flash
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="landing-security-specs-btn"
            onClick={onOpenThreatModel}
            className="text-xs text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Threat Model & Architecture</span>
          </button>
          <button
            id="landing-test-cases-btn"
            onClick={onOpenTestWalkthrough}
            className="text-xs text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Test Walkthrough</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 lg:py-20 flex flex-col items-center justify-center text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Zero-Knowledge Multi-Tenant Isolation • Cloud Firestore</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight max-w-3xl leading-[1.15]">
          Your Private Space for Mindful Reflections & Conversational AI
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Write multi-turn journal entries and engage in deep reflections, brainstorming, and automated syntheses with Gemini 3.6 Flash. Every thought is securely isolated in your private Firestore vault.
        </p>

        {/* Error Alert if sign-in fails */}
        {errorMessage && (
          <div
            id="auth-error-banner"
            className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm max-w-md w-full flex items-start gap-3 text-left shadow-2xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Authentication Notice</p>
              <p className="text-rose-600 text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Google Sign In CTA Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            id="google-signin-btn"
            onClick={handleSignInClick}
            disabled={isLoading}
            className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-5 h-5 bg-white rounded-full p-0.5 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
            )}
            <span>{isLoading ? 'Connecting Securely...' : 'Sign in with Google'}</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Federated OAuth identity. Passwords are never handled or stored.
        </p>

        {/* Feature Grid / Architectural Guarantees */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900">Multi-Turn AI Reflections</h3>
              <p className="mt-2 text-slate-600 text-xs leading-relaxed">
                Converse dynamically with Gemini 3.6 Flash. Request deep perspectives, structured brainstorms, emotional validation, or practical action steps.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-indigo-700 font-medium flex items-center gap-1.5">
              <span>Automatic title, tags & summaries</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900">User-Isolated Firestore</h3>
              <p className="mt-2 text-slate-600 text-xs leading-relaxed">
                Strict owner-bound security rules (<code className="text-[11px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">request.auth.uid == userId</code>). Your entries cannot be queried or read by other users.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <span>Real-time snapshot synchronization</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-slate-900">Zero Secret Leakage</h3>
              <p className="mt-2 text-slate-600 text-xs leading-relaxed">
                All Gemini API keys and sensitive credentials remain server-side in Secret Manager / Node backend proxies, strictly hidden from browser clients.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-blue-700 font-medium flex items-center gap-1.5">
              <span>Resilient fallback model ladder</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eef2f6] px-6 py-6 text-center text-xs text-slate-500 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>ReflectAI • Powered by Google AI Studio, Gemini 3.6 Flash & Cloud Firestore</p>
        <div className="flex items-center gap-4">
          <button onClick={onOpenThreatModel} className="hover:text-slate-800 underline">
            Threat Model
          </button>
          <button onClick={onOpenTestWalkthrough} className="hover:text-slate-800 underline">
            Test Plan
          </button>
        </div>
      </footer>
    </div>
  );
};
