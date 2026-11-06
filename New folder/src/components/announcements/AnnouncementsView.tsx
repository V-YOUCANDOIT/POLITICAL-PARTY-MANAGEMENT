import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types/index.ts';
import { apiRequest } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Megaphone,
  Plus,
  AlertTriangle,
  Bell,
  Clock,
  Send,
  Users,
  ShieldAlert
} from 'lucide-react';

const PRIORITY_BADGES = {
  Urgent: 'bg-red-950 text-red-400 border-red-800',
  Important: 'bg-amber-950 text-amber-400 border-amber-800',
  Normal: 'bg-blue-950 text-blue-400 border-blue-800'
};

export const AnnouncementsView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal');
  const [targetType, setTargetType] = useState<'All' | 'Department' | 'Unit' | 'Volunteers'>('All');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Announcement[]>('/api/announcements');
      setAnnouncements(data);
    } catch (e: any) {
      showToast(e.message || 'Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await apiRequest('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title,
          content,
          priority,
          target_type: targetType
        })
      });
      showToast(`Announcement "${title}" broadcast successfully`, 'success');
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (e: any) {
      showToast(e.message || 'Failed to post announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            Internal Party Communications & Bulletins
          </h2>
          <p className="text-xs text-slate-400">
            Official party directives, meeting notices, volunteer alerts, and departmental announcements.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No official party announcements posted yet.
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_BADGES[a.priority] || ''}`}>
                    {a.priority}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                    Audience: {a.target_type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(a.created_at).toLocaleString()}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white">{a.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                {a.content}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dispatched by <strong className="text-slate-300">{a.author_name}</strong> ({a.author_role})</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400">Verified Internal Bulletin</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Publish Official Announcement</h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bulletin Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2026 Annual Party Convention Notice & Delegate Registration"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Group</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Party Members</option>
                    <option value="Department">State & District Coordinators</option>
                    <option value="Volunteers">Field Volunteers Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Message *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the official text of the party directive..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Broadcast Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
