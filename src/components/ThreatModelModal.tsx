import React from 'react';
import { Shield, Lock, Database, Key, Server, Cpu, X, CheckCircle2 } from 'lucide-react';

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="threat-model-backdrop"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="threat-model-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 sm:p-8 text-left shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900">
                Agentic Threat Model & Security Review
              </h2>
              <p className="text-xs text-slate-500">
                OWASP Top 10 (Web/LLM) Architectural Defense Matrix
              </p>
            </div>
          </div>
          <button
            id="close-threat-model-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. The 5 Threat Zones Summary Table */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>The 5 Threat Zones: Risk & Countermeasure Mapping</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="p-3 w-1/5">Threat Zone</th>
                  <th className="p-3 w-2/5">Identified Risk / Attack Vector</th>
                  <th className="p-3 w-2/5">Implemented Production Countermeasure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-indigo-700">1. Input Surfaces</td>
                  <td className="p-3">
                    Malformed payloads, unvalidated strings, oversized bodies, prompt injection via journal text (OWASP LLM01/LLM02).
                  </td>
                  <td className="p-3">
                    Top-level body parser limit (10MB), null-safe destructuring, strict string trimming, system instruction isolation with structured JSON schema outputs.
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-indigo-700">2. Planning & Reasoning</td>
                  <td className="p-3">
                    System instruction bypass, behavioral drift, hallucinated schema formats.
                  </td>
                  <td className="p-3">
                    Enforced static Gemini system instructions; Gemini structured outputs via <code className="text-indigo-600 font-mono">responseSchema</code> with defensive fallback parsers.
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-indigo-700">3. Tool Execution</td>
                  <td className="p-3">
                    Server-Side Request Forgery (SSRF), privilege escalation, dynamic script evaluation.
                  </td>
                  <td className="p-3">
                    Zero arbitrary eval or shell execution in runtime; backend API boundaries restrict calls solely to official Google GenAI endpoints.
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-indigo-700">4. Memory & State</td>
                  <td className="p-3">
                    Cross-tenant data leakage, session hijacking, unauthenticated Firestore queries, null pointer crashes on save (OWASP A01).
                  </td>
                  <td className="p-3">
                    Owner-bound Firestore path security (<code className="text-indigo-600 font-mono">request.auth.uid == userId</code>), zero insecure defaults, strict undefined-stripping utility (<code className="text-indigo-600 font-mono">sanitizePayload</code>).
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-indigo-700">5. Inter-System Comm</td>
                  <td className="p-3">
                    Exposure of API secrets in client browser bundles, unrotated long-lived tokens.
                  </td>
                  <td className="p-3">
                    Zero client-side Gemini keys; all AI synthesis routed through backend Express proxy; Secret Manager / environment variable separation.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Security Rules Specifications */}
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Deployed Firestore Security Rules (<code className="text-emerald-700 font-mono text-xs">firestore.rules</code>)</span>
          </h3>
          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed shadow-2xs">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}
          </pre>
        </div>

        {/* 3. Model Fallback Ladder */}
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Resilient Gemini Model Fallback Ladder</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-indigo-600 font-bold block mb-1">1. Primary</span>
              <span className="font-mono text-slate-800 font-medium">gemini-3.6-flash</span>
              <p className="text-[11px] text-slate-500 mt-1">High-speed conversational reflection</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-blue-600 font-bold block mb-1">2. High-Availability</span>
              <span className="font-mono text-slate-800 font-medium">gemini-3.1-flash-lite</span>
              <p className="text-[11px] text-slate-500 mt-1">Lightweight fallback for fast response</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-purple-600 font-bold block mb-1">3. Dynamic Alias</span>
              <span className="font-mono text-slate-800 font-medium">gemini-flash-latest</span>
              <p className="text-[11px] text-slate-500 mt-1">Latest stable production model</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-emerald-600 font-bold block mb-1">4. Deep Reasoning</span>
              <span className="font-mono text-slate-800 font-medium">gemini-3.7-flash</span>
              <p className="text-[11px] text-slate-500 mt-1">Complex synthesis fallback</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            id="close-threat-modal-bottom-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-xs"
          >
            Close Threat Model
          </button>
        </div>
      </div>
    </div>
  );
};
