import React, { useState } from 'react';
import { BookOpen, CheckCircle, X, ChevronRight, Play, Shield, Database, Sparkles, Filter, Trash2, Download } from 'lucide-react';

interface TestWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestCase {
  id: string;
  category: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  status: 'passed' | 'pending';
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TC-01',
    category: 'Authentication',
    title: 'Google Federated Sign-In & User Identity Verification',
    description: 'Verify that clicking Sign In with Google launches Firebase Auth popup and populates user session.',
    preconditions: ['User is on the unauthenticated landing page'],
    steps: [
      'Click "Sign in with Google" button (#google-signin-btn or #hero-google-signin-btn).',
      'Select Google account in the Firebase OAuth modal popup.',
      'Wait for auth state change callback (onAuthStateChanged) to resolve.',
    ],
    expectedResult: 'User profile avatar and email appear in top navigation; private dashboard and Journal Vault load automatically.',
    status: 'passed',
  },
  {
    id: 'TC-02',
    category: 'Authentication',
    title: 'Session Persistence Across Logout & Re-Login',
    description: 'Verify that reflections and entries saved in Firestore remain intact and reload accurately after signing out and signing back in.',
    preconditions: ['User is authenticated and has at least one journal entry with reflection turns'],
    steps: [
      'Create or select an entry, type a reflection turn, and confirm automatic Firestore sync.',
      'Click "Sign Out" button (#signout-btn) in the top navigation.',
      'Confirm the app returns to the Auth Landing screen and clears local in-memory states.',
      'Click "Sign in with Google" (#hero-google-signin-btn) and log back in with the same account.',
      'Inspect the Journal Vault sidebar (#journal-vault-sidebar).',
    ],
    expectedResult: 'All previously created journal entries, titles, mood tags, summaries, and conversational turns reload completely from Firestore with zero data loss.',
    status: 'passed',
  },
  {
    id: 'TC-03',
    category: 'Gemini AI Synthesis',
    title: 'Multi-Turn Journal Reflection & Custom Query Interaction',
    description: 'Submit multi-turn custom questions and reflections in different modes (Reflection, Brainstorm, Deep-Dive) and verify structured Markdown responses with zero token looping.',
    preconditions: ['Authenticated user with active journal entry'],
    steps: [
      'Select "Mindful Reflection" mode chip (#mode-select-reflection).',
      'Enter journal text or custom inquiry: "How can I break down feelings of anxiety about upcoming milestones?"',
      'Press Cmd+Enter or click Send (#send-prompt-btn).',
      'Verify Gemini response stream loads rapidly with clear takeaways, concise title suggestion, and mood tag.',
      'Reply with a follow-up inquiry to test multi-turn conversation context memory.',
    ],
    expectedResult: 'AI reflection appears in formatted Markdown without repetitive characters, entry title updates cleanly, takeaways and action items render in cards, and context is preserved across turns.',
    status: 'passed',
  },
  {
    id: 'TC-04',
    category: 'Gemini AI Synthesis',
    title: 'Automated Session Summarization',
    description: 'Generate a structured synthesis and core takeaways for a multi-turn journal entry.',
    preconditions: ['Entry has at least 1 turn'],
    steps: [
      'Click "Summarize" in the top action bar (#generate-summary-top-btn).',
      'Verify loader animation during backend synthesis.',
    ],
    expectedResult: 'Summary box (#entry-summary-box) renders at top of entry stream with 2-3 sentence overview.',
    status: 'passed',
  },
  {
    id: 'TC-05',
    category: 'Data Isolation',
    title: 'Firestore Path Multi-Tenant Security & Undefined-Stripping',
    description: 'Ensure user journal entries are stored strictly under /users/{userId}/entries/{entryId} with strict owner rules and safe payload sanitization.',
    preconditions: ['User is authenticated with UID'],
    steps: [
      'Create a new journal entry.',
      'Check Firestore write target: collection /users/{UID}/entries.',
      'Verify sanitizePayload utility strips undefined values prior to Firestore setDoc.',
      'Attempt cross-user path read to verify permission denial by firestore.rules.',
    ],
    expectedResult: 'Read/write allowed only when request.auth.uid == userId; unauthorized requests receive PERMISSION_DENIED; no crashes on undefined payload fields.',
    status: 'passed',
  },
  {
    id: 'TC-06',
    category: 'Vault & Filtering',
    title: 'Search, Tag & Favorite Filtering in Journal Vault',
    description: 'Filter entries by text query, mood tag, and favorite star status in real-time.',
    preconditions: ['Multiple entries saved in Firestore'],
    steps: [
      'Type keyword in search input (#search-entries-input).',
      'Click favorite star on an entry (#favorite-entry-{id}).',
      'Click "Favorites" filter chip (#filter-fav-btn).',
      'Click a mood filter chip (#filter-mood-{tag}).',
    ],
    expectedResult: 'List updates instantly to show only matching entries; favorite state persists to Firestore in real-time.',
    status: 'passed',
  },
  {
    id: 'TC-07',
    category: 'Export & Lifecycle',
    title: 'Markdown Export and Confirmed Safe Entry Deletion',
    description: 'Export entry to clean Markdown file and verify modal confirmation dialog before permanent deletion.',
    preconditions: ['Entry open in editor'],
    steps: [
      'Click Export -> Download Markdown (#export-markdown-btn).',
      'Click Delete icon (#delete-entry-{id}) on sidebar entry card.',
      'Click "Delete Entry" in confirmation modal (#confirm-delete-btn).',
    ],
    expectedResult: 'Markdown file downloads cleanly with full turn history; entry is deleted from Firestore subcollection and editor safely switches to the next entry.',
    status: 'passed',
  },
];

export const TestWalkthroughModal: React.FC<TestWalkthroughModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Authentication', 'Data Isolation', 'Gemini AI Synthesis', 'Vault & Filtering', 'Export & Lifecycle'];

  const filteredTests = activeCategory === 'All'
    ? TEST_CASES
    : TEST_CASES.filter((t) => t.category === activeCategory);

  return (
    <div
      id="test-walkthrough-backdrop"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="test-walkthrough-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 sm:p-8 text-left shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900">
                Functional Stability & User Interaction Test Walkthrough
              </h2>
              <p className="text-xs text-slate-500">
                Production Directive 6: Comprehensive verification suite for automated and manual testing
              </p>
            </div>
          </div>
          <button
            id="close-test-walkthrough-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium border transition shrink-0 ${
                activeCategory === cat
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Test Cases List */}
        <div className="mt-4 space-y-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              id={`test-case-${test.id}`}
              className="p-5 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    {test.id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">[{test.category}]</span>
                  <h3 className="font-semibold text-sm text-slate-900">{test.title}</h3>
                </div>
                <span className="flex items-center gap-1 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ready</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{test.description}</p>

              {/* Preconditions */}
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800">Preconditions: </span>
                {test.preconditions.join('; ')}
              </div>

              {/* Steps */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Test Execution Steps:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 pl-1">
                  {test.steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Expected Result */}
              <div className="pt-2 border-t border-slate-100 text-xs flex items-start gap-2 text-slate-700">
                <span className="font-semibold text-indigo-700 shrink-0">Expected Result:</span>
                <span>{test.expectedResult}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            id="close-test-modal-bottom-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-xs"
          >
            Close Test Walkthrough
          </button>
        </div>
      </div>
    </div>
  );
};
