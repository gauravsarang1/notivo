import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, Trash2 } from 'lucide-react';
import { Note } from '../App';

interface NoteEditorProps {
  userId: number;
  note: Note | null;
  onClose: () => void;
  onSave: () => void;
}

export default function NoteEditor({ userId, note, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title && !content) return;
    setLoading(true);

    try {
      const method = note ? 'PUT' : 'POST';
      const endpoint = note ? `/api/notes/${note.id}` : '/api/notes';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, content }),
      });

      if (response.ok) {
        onSave();
      }
    } catch (err) {
      console.error('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black/40">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-2xl font-semibold hover:bg-black/90 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-black/5 rounded-2xl text-black/40 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold tracking-tight border-none outline-none placeholder:text-black/10"
          />
          <textarea
            placeholder="Start typing your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[300px] text-lg leading-relaxed border-none outline-none resize-none placeholder:text-black/10"
          />
        </div>

        <div className="px-8 py-4 bg-black/[0.02] border-t border-black/5 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/20">
            {note ? `Last updated ${new Date(note.updated_at).toLocaleString()}` : 'Draft'}
          </span>
          {note && (
            <button
              onClick={async () => {
                if (confirm('Delete this note?')) {
                  await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
                  onSave();
                }
              }}
              className="p-2 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
