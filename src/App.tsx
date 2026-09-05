import React, { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
  subscribeToUserEntries,
  saveJournalEntry,
  deleteJournalEntry,
} from './lib/firebase';
import {
  JournalEntry,
  JournalTurn,
  UserProfile,
  ReflectionMode,
  ReflectionResponsePayload,
  JournalLocation,
  WebhookConfig,
} from './types';
import { Navbar } from './components/Navbar';
import { AuthLanding } from './components/AuthLanding';
import { SidebarHistory } from './components/SidebarHistory';
import { JournalEditor } from './components/JournalEditor';
import { ThreatModelModal } from './components/ThreatModelModal';
import { TestWalkthroughModal } from './components/TestWalkthroughModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [lastAiError, setLastAiError] = useState<string | null>(null);
  const [lastPromptAttempt, setLastPromptAttempt] = useState<{ prompt: string; mode: ReflectionMode } | null>(null);

  // Modals
  const [isThreatModelOpen, setIsThreatModelOpen] = useState(false);
  const [isTestWalkthroughOpen, setIsTestWalkthroughOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Webhook configuration stored in local storage
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>(() => {
    try {
      const saved = localStorage.getItem('reflectai_webhook_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      platform: 'slack',
      enabled: false,
      notifyOnMilestones: true,
      notifyOnActionPlans: true,
      notifyOnDailyReflect: true,
    };
  });

  const handleSaveWebhookConfig = (cfg: WebhookConfig) => {
    setWebhookConfig(cfg);
    try {
      localStorage.setItem('reflectai_webhook_config', JSON.stringify(cfg));
    } catch {}
  };

  // 1. Auth Subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuth((fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setCurrentUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });
      } else {
        setCurrentUser(null);
        setEntries([]);
        setSelectedEntryId(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Entries Subscription
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUserEntries(
      currentUser.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        // Automatically select the first entry if none is selected
        if (fetchedEntries.length > 0) {
          setSelectedEntryId((prev) => {
            if (!prev || !fetchedEntries.some((e) => e.id === prev)) {
              return fetchedEntries[0].id;
            }
            return prev;
          });
        }
      },
      (err) => {
        console.error('Firestore entries subscription error:', err);
        setSyncStatus('error');
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Selected Entry Object
  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || null;

  // Create New Journal Entry
  const handleCreateNewEntry = useCallback(async () => {
    if (!currentUser?.uid) return;

    const newId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntry: JournalEntry = {
      id: newId,
      userId: currentUser.uid,
      title: 'New Reflection',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      turns: [],
      isFavorite: false,
    };

    setSyncStatus('saving');
    try {
      await saveJournalEntry(currentUser.uid, newEntry);
      setSelectedEntryId(newId);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to create new entry:', err);
      setSyncStatus('error');
    }
  }, [currentUser?.uid]);

  // Update existing entry
  const handleUpdateEntry = async (updated: JournalEntry) => {
    if (!currentUser?.uid) return;
    setSyncStatus('saving');
    try {
      await saveJournalEntry(currentUser.uid, updated);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to save entry:', err);
      setSyncStatus('error');
    }
  };

  // Location select handler
  const handleSelectLocation = async (loc: JournalLocation | undefined) => {
    if (!selectedEntry || !currentUser?.uid) return;
    const updated: JournalEntry = {
      ...selectedEntry,
      location: loc,
      updatedAt: Date.now(),
    };
    await handleUpdateEntry(updated);
  };

  // Delete Entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteJournalEntry(currentUser.uid, entryId);
      if (selectedEntryId === entryId) {
        const remaining = entries.filter((e) => e.id !== entryId);
        setSelectedEntryId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (entry: JournalEntry) => {
    if (!currentUser?.uid) return;
    const updated = { ...entry, isFavorite: !entry.isFavorite };
    await handleUpdateEntry(updated);
  };

  // Send Prompt to Gemini & Append Multi-turn
  const handleSendPrompt = async (prompt: string, mode: ReflectionMode) => {
    if (!currentUser?.uid) return;

    // If no entry exists yet, create one first
    let currentActiveEntry = selectedEntry;
    if (!currentActiveEntry) {
      const newId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      currentActiveEntry = {
        id: newId,
        userId: currentUser.uid,
        title: 'New Reflection',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        turns: [],
      };
      setSelectedEntryId(newId);
    }

    // 1. Append User Turn immediately
    const userTurn: JournalTurn = {
      id: `turn_${Date.now()}_user`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      mode,
    };

    const updatedWithUserTurn: JournalEntry = {
      ...currentActiveEntry,
      turns: [...(currentActiveEntry.turns || []), userTurn],
      updatedAt: Date.now(),
    };

    setSyncStatus('saving');
    setIsGeneratingAI(true);
    setLastAiError(null);
    setLastPromptAttempt({ prompt, mode });

    try {
      // Save user turn to Firestore
      await saveJournalEntry(currentUser.uid, updatedWithUserTurn);
      setSyncStatus('synced');

      // Prepare context history for Gemini
      const contextHistory = (updatedWithUserTurn.turns || []).slice(0, -1).map((t) => ({
        role: t.role === 'gemini' ? ('model' as const) : ('user' as const),
        text: t.content,
      }));

      // Call Gemini Reflect endpoint
      const response = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode,
          contextHistory,
          currentTitle: currentActiveEntry.title,
        }),
      });

      const responseText = await response.text();
      let aiData: ReflectionResponsePayload;

      if (!response.ok) {
        let errMessage = `Server error (${response.status})`;
        try {
          const errData = JSON.parse(responseText);
          if (errData.error) errMessage = errData.error;
        } catch {
          if (responseText && !responseText.trim().startsWith('<')) {
            errMessage = responseText;
          }
        }
        throw new Error(errMessage);
      }

      if (!responseText || responseText.trim().startsWith('<')) {
        throw new Error('Received unexpected response from server. Please verify your GEMINI_API_KEY and try again.');
      }

      try {
        aiData = JSON.parse(responseText);
      } catch {
        throw new Error('Unable to parse reflection response from AI service.');
      }

      if (aiData.error) {
        throw new Error(aiData.error);
      }

      // 2. Append Gemini Reflection Turn
      const geminiTurn: JournalTurn = {
        id: `turn_${Date.now()}_gemini`,
        role: 'gemini',
        content: aiData.reply,
        timestamp: Date.now(),
        mode,
      };

      const finalUpdatedEntry: JournalEntry = {
        ...updatedWithUserTurn,
        title:
          currentActiveEntry.title === 'New Reflection' || !currentActiveEntry.title
            ? aiData.suggestedTitle || currentActiveEntry.title
            : currentActiveEntry.title,
        mood: aiData.moodTag || currentActiveEntry.mood,
        tags: Array.from(new Set([...(currentActiveEntry.tags || []), ...(aiData.detectedTags || [])])),
        keyTakeaways: aiData.keyTakeaways && aiData.keyTakeaways.length > 0 ? aiData.keyTakeaways : currentActiveEntry.keyTakeaways,
        actionItems: aiData.actionItems && aiData.actionItems.length > 0 ? aiData.actionItems : currentActiveEntry.actionItems,
        turns: [...updatedWithUserTurn.turns, geminiTurn],
        updatedAt: Date.now(),
      };

      // Guaranteed save to Firestore
      await saveJournalEntry(currentUser.uid, finalUpdatedEntry);
      setSyncStatus('synced');
    } catch (err: any) {
      console.error('Error during AI reflection:', err);
      setLastAiError(err.message || 'Failed to generate reflection.');
      setSyncStatus('error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Dedicated Summarization
  const handleGenerateSummary = async () => {
    if (!currentUser?.uid || !selectedEntry || (selectedEntry.turns || []).length === 0) return;

    setIsGeneratingAI(true);
    setLastAiError(null);

    const fullConversationText = (selectedEntry.turns || [])
      .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
      .join('\n\n');

    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullConversationText }),
      });

      const resText = await response.text();
      if (!response.ok) {
        let errMessage = 'Failed to generate summary';
        try {
          const errData = JSON.parse(resText);
          if (errData.error) errMessage = errData.error;
        } catch {
          if (resText && !resText.trim().startsWith('<')) errMessage = resText;
        }
        throw new Error(errMessage);
      }

      if (!resText || resText.trim().startsWith('<')) {
        throw new Error('Received unexpected response from summary service.');
      }

      let data: any;
      try {
        data = JSON.parse(resText);
      } catch {
        throw new Error('Invalid summary format from server.');
      }

      const updated: JournalEntry = {
        ...selectedEntry,
        summary: data.summary,
        updatedAt: Date.now(),
      };

      await handleUpdateEntry(updated);
    } catch (err: any) {
      console.error('Summary error:', err);
      setLastAiError(err.message || 'Failed to generate summary');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center text-slate-800">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading your secure session...</p>
      </div>
    );
  }

  // Unauthenticated Landing View
  if (!currentUser) {
    return (
      <>
        <AuthLanding
          onSignIn={signInWithGoogle}
          onOpenThreatModel={() => setIsThreatModelOpen(true)}
          onOpenTestWalkthrough={() => setIsTestWalkthroughOpen(true)}
        />
        <ThreatModelModal
          isOpen={isThreatModelOpen}
          onClose={() => setIsThreatModelOpen(false)}
        />
        <TestWalkthroughModal
          isOpen={isTestWalkthroughOpen}
          onClose={() => setIsTestWalkthroughOpen(false)}
        />
      </>
    );
  }

  // Authenticated Private Dashboard
  return (
    <div id="app-root-container" className="h-screen flex flex-col bg-[#fcfcfc] text-slate-800 overflow-hidden font-sans">
      {/* Top Header */}
      <Navbar
        user={currentUser}
        onSignOut={signOutUser}
        onNewEntry={handleCreateNewEntry}
        syncStatus={syncStatus}
        onRetrySync={async () => {
          if (selectedEntry && currentUser.uid) {
            setSyncStatus('saving');
            try {
              await saveJournalEntry(currentUser.uid, selectedEntry);
              setSyncStatus('synced');
            } catch {
              setSyncStatus('error');
            }
          }
        }}
        onOpenThreatModel={() => setIsThreatModelOpen(true)}
        onOpenTestWalkthrough={() => setIsTestWalkthroughOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Workspace: Sidebar Vault + Active Editor */}
      <main id="main-workspace" className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-[#fcfcfc]">
        <SidebarHistory
          entries={entries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
          onNewEntry={handleCreateNewEntry}
          onDeleteEntry={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
        />

        {selectedEntry ? (
          <JournalEditor
            key={selectedEntry.id}
            entry={selectedEntry}
            onUpdateEntry={handleUpdateEntry}
            onGenerateSummary={handleGenerateSummary}
            isGeneratingAI={isGeneratingAI}
            onSendPrompt={handleSendPrompt}
            lastAiError={lastAiError}
            onRetryLastPrompt={() => {
              if (lastPromptAttempt) {
                handleSendPrompt(lastPromptAttempt.prompt, lastPromptAttempt.mode);
              }
            }}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fcfcfc] text-slate-600">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
              <span className="text-xl">✨</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">No Entry Selected</h2>
            <p className="mt-2 text-xs text-slate-500 max-w-sm leading-relaxed">
              Select an existing entry from your vault on the left, or create a new reflection to converse with Gemini.
            </p>
            <button
              onClick={handleCreateNewEntry}
              className="mt-6 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition"
            >
              + Create New Reflection
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <ThreatModelModal
        isOpen={isThreatModelOpen}
        onClose={() => setIsThreatModelOpen(false)}
      />
      <TestWalkthroughModal
        isOpen={isTestWalkthroughOpen}
        onClose={() => setIsTestWalkthroughOpen(false)}
      />
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentLocation={selectedEntry?.location}
        onSelectLocation={handleSelectLocation}
      />
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        currentUser={currentUser}
      />
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        config={webhookConfig}
        onSaveConfig={handleSaveWebhookConfig}
      />
    </div>
  );
}

