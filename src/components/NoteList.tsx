import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Note } from '../App';
import NoteCard from './NoteCard';

interface NoteListProps {
  userId: number;
  searchQuery: string;
  onEdit: (note: Note) => void;
}

export default function NoteList({ userId, searchQuery, onEdit }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?userId=${userId}`);
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    const handleRefresh = () => fetchNotes();
    window.addEventListener('refresh-notes', handleRefresh);
    return () => window.removeEventListener('refresh-notes', handleRefresh);
  }, [userId]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-48 bg-black/5 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-black/20">
        <p className="text-xl font-medium">No notes found</p>
        <p className="text-sm">Start by creating your first note</p>
      </div>
    );
  }

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const otherNotes = filteredNotes.filter(n => !n.is_pinned);

  return (
    <div className="space-y-10">
      {pinnedNotes.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-6 ml-1">Pinned</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={onEdit} onRefresh={fetchNotes} />
            ))}
          </div>
        </section>
      )}

      {otherNotes.length > 0 && (
        <section>
          {pinnedNotes.length > 0 && (
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-6 ml-1">Others</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherNotes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={onEdit} onRefresh={fetchNotes} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
