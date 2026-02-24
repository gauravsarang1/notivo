/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LogOut, Plus, Search, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Auth from './components/Auth';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { cn } from './lib/utils';

export interface User {
  id: number;
  username: string;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  updated_at: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('note_app_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem('note_app_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('note_app_user');
    }
  }, [user]);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-black/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <StickyNote size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight hidden sm:block">Notivo</h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/5 border-none rounded-xl focus:ring-2 focus:ring-black/10 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-black/60 hidden md:block">
              {user.username}
            </span>
            <button
              onClick={() => setUser(null)}
              className="p-2.5 hover:bg-black/5 rounded-xl transition-colors text-black/60 hover:text-black"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <NoteList 
          userId={user.id} 
          searchQuery={searchQuery}
          onEdit={(note) => {
            setEditingNote(note);
            setIsEditorOpen(true);
          }}
        />
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingNote(null);
          setIsEditorOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <NoteEditor
            userId={user.id}
            note={editingNote}
            onClose={() => setIsEditorOpen(false)}
            onSave={() => {
              setIsEditorOpen(false);
              // NoteList will refresh via its own effect or we could pass a refresh trigger
              window.dispatchEvent(new CustomEvent('refresh-notes'));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

