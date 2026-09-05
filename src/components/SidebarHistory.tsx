import React, { useState, useMemo } from 'react';
import { JournalEntry } from '../types';
import { Search, Plus, Star, Trash2, Calendar, Sparkles, Filter, BookOpen, MapPin } from 'lucide-react';

interface SidebarHistoryProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
  onToggleFavorite: (entry: JournalEntry) => void;
}

export const SidebarHistory: React.FC<SidebarHistoryProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => {
      if (e.mood) tagSet.add(e.mood);
      if (Array.isArray(e.tags)) {
        e.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [entries]);

  // Filter entries based on search, tags, favorites
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (showFavoritesOnly && !entry.isFavorite) return false;

      if (selectedTag) {
        const hasTag =
          entry.mood === selectedTag || (entry.tags && entry.tags.includes(selectedTag));
        if (!hasTag) return false;
      }

      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const titleMatch = (entry.title || '').toLowerCase().includes(queryLower);
        const summaryMatch = (entry.summary || '').toLowerCase().includes(queryLower);
        const turnsMatch = (entry.turns || []).some((t) =>
          t.content.toLowerCase().includes(queryLower)
        );
        const tagsMatch = (entry.tags || []).some((t) =>
          t.toLowerCase().includes(queryLower)
        );
        const moodMatch = (entry.mood || '').toLowerCase().includes(queryLower);

        return titleMatch || summaryMatch || turnsMatch || tagsMatch || moodMatch;
      }

      return true;
    });
  }, [entries, searchQuery, selectedTag, showFavoritesOnly]);

  const formatEntryDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <aside
      id="sidebar-history-container"
      className="w-full md:w-80 lg:w-96 bg-white border-r border-[#eef2f6] flex flex-col h-full shrink-0"
    >
      {/* Sidebar Header & Search */}
      <div className="p-4 border-b border-[#eef2f6] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-sm text-slate-800">Journal Vault</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-entries-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections, keywords..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg pl-9 pr-7 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            id="filter-fav-btn"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 border transition shrink-0 ${
              showFavoritesOnly
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Star className={`w-3 h-3 ${showFavoritesOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>Favorites</span>
          </button>

          {allTags.slice(0, 6).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-1 rounded-md text-xs font-medium border transition shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div id="entries-list" className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#fcfcfc]">
        {filteredEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {entries.length === 0 ? 'No entries yet' : 'No matching entries found'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              {entries.length === 0
                ? 'Start your first mindful reflection with Gemini.'
                : 'Try adjusting your search or filter tags.'}
            </p>
            {entries.length === 0 && (
              <button
                id="sidebar-create-first-entry-btn"
                onClick={onNewEntry}
                className="mt-4 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Entry</span>
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            const turnCount = (entry.turns || []).length;
            const latestUserTurn = [...(entry.turns || [])]
              .reverse()
              .find((t) => t.role === 'user');
            const previewText =
              entry.summary ||
              (latestUserTurn ? latestUserTurn.content : 'Empty reflection...');

            return (
              <div
                key={entry.id}
                id={`entry-card-${entry.id}`}
                onClick={() => onSelectEntry(entry)}
                className={`group relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/60 border-indigo-400/80 shadow-xs ring-1 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Title and Favorite Button */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {entry.title || 'Untitled Reflection'}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`favorite-entry-${entry.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(entry);
                      }}
                      className="p-1 text-slate-400 hover:text-amber-500 transition"
                      title={entry.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          entry.isFavorite
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                    <button
                      id={`delete-entry-${entry.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntryToDelete(entry.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preview Snippet */}
                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {previewText}
                </p>

                {/* Metadata Footer: Date, Turns, Mood Tag, Location */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatEntryDate(entry.updatedAt || entry.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {entry.location && (
                      <span
                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/60 flex items-center gap-0.5 max-w-[80px] truncate"
                        title={entry.location.name}
                      >
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{entry.location.name}</span>
                      </span>
                    )}
                    {entry.mood && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-200/60">
                        {entry.mood}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                      {turnCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div
          id="delete-confirm-backdrop"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            id="delete-confirm-modal"
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full text-left shadow-2xl"
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900">Delete Journal Entry?</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This entry and all associated Gemini reflections will be permanently removed from your isolated Firestore collection. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                id="cancel-delete-btn"
                onClick={() => setEntryToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={() => {
                  onDeleteEntry(entryToDelete);
                  setEntryToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition shadow-xs"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
