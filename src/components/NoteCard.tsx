import React from 'react';
import { motion } from 'motion/react';
import { Pin, Trash2, Edit3 } from 'lucide-react';
import { Note } from '../App';
import { cn } from '../lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onRefresh: () => void | Promise<void>;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onRefresh }) => {
  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/notes/${note.id}/pin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: !note.is_pinned }),
    });
    onRefresh();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={() => onEdit(note)}
      className="group relative bg-white rounded-[32px] p-8 border border-black/5 hover:border-black/10 hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer flex flex-col h-full min-h-[200px]"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold leading-tight tracking-tight pr-8">
          {note.title || 'Untitled'}
        </h3>
        <button
          onClick={handlePin}
          className={cn(
            "p-2 rounded-xl transition-colors",
            note.is_pinned 
              ? "bg-black text-white" 
              : "text-black/20 hover:text-black hover:bg-black/5"
          )}
        >
          <Pin size={16} className={note.is_pinned ? "fill-current" : ""} />
        </button>
      </div>

      <p className="text-black/60 text-sm leading-relaxed line-clamp-4 flex-grow">
        {note.content || 'No content'}
      </p>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-black/5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-black/20">
          {new Date(note.updated_at).toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-2 text-black/40 hover:text-black hover:bg-black/5 rounded-lg transition-all"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
