import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark as BookmarkIcon, FileText, Trash2, Edit3, Loader2 } from 'lucide-react';

import { toast } from 'sonner';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/bookmarks`);
      setBookmarks(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/bookmarks/${id}`, { note: editNoteText });
      setBookmarks(prev => prev.map(b => b.id === id ? { ...b, note: editNoteText } : b));
      setEditingNoteId(null);
      toast.success('Note updated');
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this bookmark?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/bookmarks/${id}`);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      toast.success('Bookmark removed');
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
            <BookmarkIcon size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Saved Standards</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
            <BookmarkIcon className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No saved standards</h3>
            <p className="text-slate-500 max-w-sm">Bookmark clauses from any AI response to build your library.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookmarks.map(bookmark => (
              <div key={bookmark.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div 
                    className="cursor-pointer group"
                    onClick={() => {
                      if(bookmark.pdf_path) {
                        const filename = bookmark.pdf_path.split('/').pop().split('\\').pop();
                        window.open(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:8000'}/pdfs/${filename}`, '_blank');
                      }
                    }}
                  >
                    <h3 className="text-lg font-bold text-blue-700 group-hover:underline flex items-center gap-2">
                      <FileText size={18} />
                      {bookmark.standard_ref}
                    </h3>
                    {bookmark.page_number && <span className="text-xs text-slate-500 font-medium ml-6">Page {bookmark.page_number}</span>}
                  </div>
                  <button 
                    onClick={() => handleDelete(bookmark.id)}
                    className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{bookmark.clause_text}</p>
                </div>
                
                {editingNoteId === bookmark.id ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-blue-300 focus:ring-2 focus:ring-blue-500 rounded-lg text-sm outline-none"
                      placeholder="Add a note..."
                    />
                    <button 
                      onClick={() => handleUpdateNote(bookmark.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingNoteId(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Note: </span>
                      {bookmark.note || <span className="italic text-slate-400">None</span>}
                    </p>
                    <button 
                      onClick={() => {
                        setEditingNoteId(bookmark.id);
                        setEditNoteText(bookmark.note || '');
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
