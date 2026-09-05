import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { JournalEntry, JournalTurn, ReflectionMode } from '../types';
import {
  Sparkles,
  Send,
  Lightbulb,
  CheckCircle,
  FileText,
  Copy,
  Check,
  Star,
  Download,
  Printer,
  Compass,
  ListTodo,
  Layers,
  AlertCircle,
  RefreshCw,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface JournalEditorProps {
  entry: JournalEntry;
  onUpdateEntry: (updated: JournalEntry) => Promise<void>;
  onGenerateSummary: () => Promise<void>;
  isGeneratingAI: boolean;
  onSendPrompt: (prompt: string, mode: ReflectionMode) => Promise<void>;
  lastAiError: string | null;
  onRetryLastPrompt?: () => void;
  onOpenLocationPicker?: () => void;
}

const REFLECTION_MODES: Array<{
  id: ReflectionMode;
  label: string;
  icon: any;
  desc: string;
}> = [
  {
    id: 'reflection',
    label: 'Mindful Reflection',
    icon: Sparkles,
    desc: 'Empathetic validation & perspective inquiry',
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm Ideas',
    icon: Lightbulb,
    desc: 'Creative solutions & alternative angles',
  },
  {
    id: 'summary',
    label: 'Structured Summary',
    icon: Layers,
    desc: 'Synthesize core patterns and themes',
  },
  {
    id: 'deep_dive',
    label: 'Root Deep-Dive',
    icon: Compass,
    desc: 'Unpack underlying beliefs and values',
  },
  {
    id: 'action_plan',
    label: 'Action Plan',
    icon: ListTodo,
    desc: 'Concrete, small actionable micro-steps',
  },
];

const THOUGHT_STARTERS = [
  { text: 'Unpack a decision I am wrestling with right now.', mode: 'deep_dive' as ReflectionMode },
  { text: 'Reflect on a challenge from today and what it taught me.', mode: 'reflection' as ReflectionMode },
  { text: 'Brainstorm 3 fresh approaches to an obstacle I am facing.', mode: 'brainstorm' as ReflectionMode },
  { text: 'What am I feeling grateful for, and why does it matter?', mode: 'reflection' as ReflectionMode },
  { text: 'Synthesize my current thoughts into a clear 3-step action plan.', mode: 'action_plan' as ReflectionMode },
];

/**
 * Defensive sanitizer to prevent any raw JSON artifacts from ever showing in turn content.
 */
function cleanTurnDisplayContent(content: string): string {
  if (!content) return '';
  const trimmed = content.trim();
  if (trimmed.startsWith('{') && (trimmed.includes('"reply"') || trimmed.includes('reply:'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed.reply === 'string') {
        return parsed.reply;
      }
    } catch {
      const KNOWN_SCHEMA_KEYS = '(?:suggestedTitle|moodTag|detectedTags|keyTakeaways|actionItems|modelUsed)';
      const regex = new RegExp(`"reply"\\s*:\\s*"([\\s\\S]*?)"\\s*(?:,\\s*"${KNOWN_SCHEMA_KEYS}"\\s*:|\\}\\s*$)`, 's');
      const match = trimmed.match(regex) || trimmed.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
      if (match && match[1]) {
        try {
          return JSON.parse(`"${match[1]}"`);
        } catch {
          return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }
    }
  }
  return trimmed;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onUpdateEntry,
  onGenerateSummary,
  isGeneratingAI,
  onSendPrompt,
  lastAiError,
  onRetryLastPrompt,
  onOpenLocationPicker,
}) => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState<ReflectionMode>('reflection');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(entry.title || '');
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitleInput(entry.title || '');
  }, [entry.id, entry.title]);

  // Scroll to bottom of conversation stream when turns update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry.turns, isGeneratingAI]);

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    const cleanTitle = titleInput.trim() || 'Untitled Reflection';
    if (cleanTitle !== entry.title) {
      await onUpdateEntry({
        ...entry,
        title: cleanTitle,
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim() || isGeneratingAI) return;

    const textToSend = currentPrompt;
    setCurrentPrompt('');
    await onSendPrompt(textToSend, selectedMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const copyToClipboard = (text: string, turnId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTurnId(turnId);
    setTimeout(() => setCopiedTurnId(null), 2000);
  };

  const exportAsMarkdown = () => {
    let mdContent = `# ${entry.title || 'Journal Entry'}\n\n`;
    mdContent += `**Date:** ${new Date(entry.createdAt).toLocaleDateString()} ${new Date(
      entry.createdAt
    ).toLocaleTimeString()}\n`;
    if (entry.mood) mdContent += `**Mood:** ${entry.mood}\n`;
    if (entry.tags && entry.tags.length) mdContent += `**Tags:** ${entry.tags.join(', ')}\n`;
    if (entry.location) {
      mdContent += `**Mindful Sanctuary / Address:** ${entry.location.name}${entry.location.address ? ` — ${entry.location.address}` : ''}\n`;
    }
    if (entry.summary) mdContent += `\n## Summary\n${entry.summary}\n`;
    mdContent += `\n## Conversation & Reflections\n\n`;

    (entry.turns || []).forEach((turn) => {
      const speaker = turn.role === 'user' ? '👤 **You**' : '✨ **Gemini Reflection**';
      mdContent += `${speaker} (${new Date(turn.timestamp).toLocaleTimeString()}):\n\n${cleanTurnDisplayContent(turn.content)}\n\n---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(entry.title || 'reflection').replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const printEntry = () => {
    window.print();
    setShowExportMenu(false);
  };

  const totalWords = (entry.turns || []).reduce((acc, t) => {
    return acc + (t.content.trim().split(/\s+/).filter(Boolean).length || 0);
  }, 0);

  return (
    <div id="journal-editor-container" className="flex-1 flex flex-col h-full bg-[#fcfcfc] overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-[#eef2f6] bg-white/95 backdrop-blur-xs flex items-center justify-between gap-4">
        {/* Title & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                id="entry-title-input"
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                }}
                autoFocus
                className="font-bold text-lg sm:text-xl text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-indigo-500 focus:outline-none w-full max-w-lg shadow-2xs"
              />
            ) : (
              <h1
                id="entry-title-heading"
                onClick={() => setIsEditingTitle(true)}
                className="font-bold text-lg sm:text-xl text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition flex items-center gap-2"
                title="Click to edit title"
              >
                <span>{entry.title || 'Untitled Reflection'}</span>
                <span className="text-xs font-sans text-slate-400 font-normal">✏️</span>
              </h1>
            )}

            {entry.isFavorite && (
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span>{new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span>{totalWords} words</span>
            {entry.mood && (
              <>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[11px] font-medium">
                  Mood: {entry.mood}
                </span>
              </>
            )}
            {entry.tags && entry.tags.map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                #{t}
              </span>
            ))}
            {entry.location && (
              <>
                <span>•</span>
                <a
                  href={entry.location.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.location.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium hover:bg-emerald-100 transition"
                  title={`${entry.location.name}: ${entry.location.address || 'Pinned Location'}`}
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span className="max-w-[200px] sm:max-w-[320px] truncate">{entry.location.name}{entry.location.address ? ` • ${entry.location.address}` : ''}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Location Pin Button */}
          <button
            id="pin-location-header-btn"
            onClick={onOpenLocationPicker}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition shadow-2xs ${
              entry.location
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={entry.location ? `Pinned: ${entry.location.name}` : 'Pin a Location (Google Maps)'}
          >
            <MapPin className={`w-3.5 h-3.5 ${entry.location ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{entry.location ? 'Location Pinned' : 'Pin Place'}</span>
          </button>

          {/* Summary button */}
          <button
            id="generate-summary-top-btn"
            onClick={onGenerateSummary}
            disabled={isGeneratingAI || (entry.turns || []).length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition shadow-2xs disabled:opacity-40"
            title="Generate structured summary of this entry"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Summarize</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="export-menu-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition shadow-2xs"
              title="Export entry"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-xs text-slate-700">
                <button
                  id="export-markdown-btn"
                  onClick={exportAsMarkdown}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download Markdown</span>
                </button>
                <button
                  id="export-print-btn"
                  onClick={printEntry}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div id="conversation-stream" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Entry Summary Card if generated */}
        {entry.summary && (
          <div
            id="entry-summary-box"
            className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 text-slate-800 relative overflow-hidden shadow-2xs"
          >
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Session Synthesis & Summary</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{entry.summary}</p>
          </div>
        )}

        {/* Turns list */}
        {(!entry.turns || entry.turns.length === 0) ? (
          <div className="py-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-bold text-2xl text-slate-900">Begin Your Mindful Reflection</h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Reflect on your day, explore feelings, brainstorm creative ideas, or work through a dilemma. Gemini 3.6 Flash will respond with empathy, wisdom, and clarity.
              </p>
            </div>

            {/* Prompt Starters */}
            <div className="w-full space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                Thought Starters
              </p>
              <div className="grid grid-cols-1 gap-2 text-left">
                {THOUGHT_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    id={`thought-starter-${idx}`}
                    onClick={() => {
                      setSelectedMode(starter.mode);
                      setCurrentPrompt(starter.text);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs text-slate-700 transition flex items-center justify-between group shadow-2xs"
                  >
                    <span>{starter.text}</span>
                    <span className="text-[10px] text-indigo-600 uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                      {starter.mode.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          entry.turns.map((turn, index) => {
            const isUser = turn.role === 'user';
            const isCopied = copiedTurnId === turn.id;
            const latestAiIndex = (entry.turns || []).map((t) => t.role).lastIndexOf('gemini');
            const isLatestAiTurn = !isUser && index === latestAiIndex;
            const displayContent = cleanTurnDisplayContent(turn.content);

            return (
              <div
                key={turn.id}
                id={`turn-item-${turn.id}`}
                className={`flex gap-3 sm:gap-4 max-w-4xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`group relative rounded-2xl p-4 sm:p-5 max-w-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#f1f5f9] border border-slate-200/90 text-slate-900 rounded-tr-xs shadow-2xs'
                      : 'bg-[#ffffff] border border-[#eef2f6] text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {/* Turn Header */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">
                        {isUser ? 'You' : 'Gemini Reflection'}
                      </span>
                      {turn.mode && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
                          {turn.mode.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">
                        {new Date(turn.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        id={`copy-turn-${turn.id}`}
                        onClick={() => copyToClipboard(displayContent, turn.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition p-0.5"
                        title="Copy content"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Content body */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-slate-800">{displayContent}</p>
                  ) : (
                    <div className="markdown-body prose max-w-none text-slate-800 text-sm leading-relaxed">
                      <Markdown>{displayContent}</Markdown>
                    </div>
                  )}

                  {/* Key Takeaways / Action items if present in entry (rendered on latest AI turn) */}
                  {isLatestAiTurn && entry.keyTakeaways && entry.keyTakeaways.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                      <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" /> Core Takeaways
                      </p>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {entry.keyTakeaways.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-600 shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                    Me
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* AI Thinking Spinner */}
        {isGeneratingAI && (
          <div className="flex gap-3 sm:gap-4 max-w-4xl mx-auto justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 animate-pulse shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white border border-indigo-200 rounded-2xl rounded-tl-xs p-4 text-slate-700 flex items-center gap-3 shadow-xs">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-indigo-700 font-medium">
                Reflecting with Gemini 3.6 Flash...
              </span>
            </div>
          </div>
        )}

        {/* Last AI Error Alert */}
        {lastAiError && (
          <div
            id="ai-error-banner"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 max-w-4xl mx-auto shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{lastAiError}</span>
            </div>
            {onRetryLastPrompt && (
              <button
                onClick={onRetryLastPrompt}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 underline font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mode Selector & Input Area */}
      <div className="p-4 sm:p-5 border-t border-[#eef2f6] bg-white/90 backdrop-blur-xs max-w-5xl mx-auto w-full">
        {/* Reflection Mode Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-xs scrollbar-none">
          <span className="text-slate-400 text-[11px] font-medium mr-1 hidden sm:inline">
            Mode:
          </span>
          {REFLECTION_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                id={`mode-select-${mode.id}`}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-semibold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={mode.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="relative flex flex-col gap-2">
          <div className="relative">
            <textarea
              id="journal-input-textarea"
              ref={textareaRef}
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Write your reflections or ask Gemini (${selectedMode.replace('_', ' ')} mode)...`}
              rows={3}
              disabled={isGeneratingAI}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3.5 pr-28 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition resize-none disabled:opacity-50 shadow-2xs"
            />

            {/* Submit Button */}
            <div className="absolute right-2.5 bottom-3.5 flex items-center gap-2">
              <button
                id="send-prompt-btn"
                type="submit"
                disabled={!currentPrompt.trim() || isGeneratingAI}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs transition shadow-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {isGeneratingAI ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">⌘</kbd> +{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">Enter</kbd> to submit
            </span>
            <span>{currentPrompt.length} characters</span>
          </div>
        </form>
      </div>
    </div>
  );
};
