import React, { useState, useEffect } from 'react';
import { EventItem, LogisticsItem, User } from '../../types/index.ts';
import { apiRequest } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  CalendarDays,
  Plus,
  MapPin,
  Users,
  Clock,
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle,
  CircleDollarSign,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Rally');
  const [dateTime, setDateTime] = useState('');
  const [venue, setVenue] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [expectedAttendance, setExpectedAttendance] = useState('500');
  const [actualAttendance, setActualAttendance] = useState('0');
  const [budget, setBudget] = useState('5000');
  const [status, setStatus] = useState<EventItem['status']>('Upcoming');
  const [logisticsList, setLogisticsList] = useState<LogisticsItem[]>([
    { id: '1', item: 'Audio-visual system & public address microphone', done: true },
    { id: '2', item: 'Volunteer briefing table & registration tablets', done: false },
    { id: '3', item: 'Emergency first-aid medical station staffed', done: false }
  ]);
  const [newLogisticsText, setNewLogisticsText] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<EventItem[]>('/api/events');
      setEvents(data);
      if (!selectedEventId && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await apiRequest<User[]>('/api/volunteers');
      setAllUsers(users);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const openCreateModal = (evt?: EventItem) => {
    if (evt) {
      setEditingEvent(evt);
      setTitle(evt.title);
      setDescription(evt.description || '');
      setCategory(evt.category);
      setDateTime(evt.date_time.replace(' ', 'T').substring(0, 16));
      setVenue(evt.venue);
      setCoordinatorId(evt.coordinator_id || user?.id || '');
      setExpectedAttendance(String(evt.expected_attendance));
      setActualAttendance(String(evt.actual_attendance));
      setBudget(String(evt.budget));
      setStatus(evt.status);
      setLogisticsList(evt.logistics_checklist || []);
    } else {
      setEditingEvent(null);
      setTitle('');
      setDescription('');
      setCategory('Rally');
      const now = new Date(Date.now() + 14 * 86400000);
      setDateTime(now.toISOString().substring(0, 16));
      setVenue('Civic Auditorium, Main Square');
      setCoordinatorId(user?.id || '');
      setExpectedAttendance('500');
      setActualAttendance('0');
      setBudget('7500');
      setStatus('Upcoming');
      setLogisticsList([
        { id: '1', item: 'Public address sound system and stage microphones', done: false },
        { id: '2', item: 'Volunteer check-in desk and security wristbands', done: false },
        { id: '3', item: 'Hydration and first-aid response team confirmed', done: false }
      ]);
    }
    setIsModalOpen(true);
  };

  const handleToggleLogisticsItem = async (eventId: string, itemId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedChecklist = event.logistics_checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );

    try {
      await apiRequest(`/api/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...event,
          logistics_checklist: updatedChecklist
        })
      });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, logistics_checklist: updatedChecklist } : e));
      showToast('Logistics checklist updated', 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to update checklist', 'error');
    }
  };

  const handleAddLogisticsInModal = () => {
    if (!newLogisticsText.trim()) return;
    setLogisticsList(prev => [
      ...prev,
      { id: String(Date.now()), item: newLogisticsText.trim(), done: false }
    ]);
    setNewLogisticsText('');
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateTime || !venue) return;

    setSubmitting(true);
    try {
      if (editingEvent) {
        await apiRequest(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title,
            description,
            category,
            date_time: dateTime.replace('T', ' ') + ':00',
            venue,
            coordinator_id: coordinatorId,
            expected_attendance: expectedAttendance,
            actual_attendance: actualAttendance,
            budget,
            status,
            logistics_checklist: logisticsList
          })
        });
        showToast(`Event "${title}" updated`, 'success');
      } else {
        const res = await apiRequest('/api/events', {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            category,
            date_time: dateTime.replace('T', ' ') + ':00',
            venue,
            coordinator_id: coordinatorId,
            expected_attendance: expectedAttendance,
            actual_attendance: 0,
            budget,
            status,
            logistics_checklist: logisticsList
          })
        });
        showToast(`Event "${title}" scheduled successfully`, 'success');
        setSelectedEventId(res.id);
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (e: any) {
      showToast(e.message || 'Error saving event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string, eventTitle: string) => {
    if (!confirm(`Cancel and delete event "${eventTitle}"?`)) return;
    try {
      await apiRequest(`/api/events/${id}`, { method: 'DELETE' });
      showToast('Event removed', 'warning');
      setSelectedEventId(null);
      fetchEvents();
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    }
  };

  const selected = events.find(e => e.id === selectedEventId) || events[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-400" />
            Events, Rallies & Logistics Management
          </h2>
          <p className="text-xs text-slate-400">
            Conventions, public town halls, rallies, logistics checklists, and volunteer deployment.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex items-center text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly View
            </button>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Events Master List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white">Upcoming & Completed Party Events</span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {events.length} Events
            </span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {events.map((e) => {
              const isSelected = selectedEventId === e.id;
              const dateStr = new Date(e.date_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = new Date(e.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const doneItems = e.logistics_checklist?.filter(i => i.done).length || 0;
              const totalItems = e.logistics_checklist?.length || 0;

              return (
                <div
                  key={e.id}
                  onClick={() => setSelectedEventId(e.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
                      {e.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      e.status === 'Upcoming' ? 'bg-blue-950 text-blue-400 border-blue-800' :
                      e.status === 'Ongoing' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      e.status === 'Completed' ? 'bg-purple-950 text-purple-400 border-purple-800' :
                      'bg-red-950 text-red-400 border-red-800'
                    }`}>
                      {e.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">{e.title}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{dateStr} at {timeStr}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 line-clamp-1 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{e.venue}</span>
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Users className="w-3 h-3 text-slate-500" />
                      Expected: {e.expected_attendance}
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      Checklist: {doneItems}/{totalItems} done
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Event Detail & Logistics Checklist Manager */}
        <div className="lg:col-span-7 space-y-4">
          {selected ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">
                      {selected.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(selected.date_time).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{selected.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{selected.venue}</span>
                    <span className="mx-1">•</span>
                    <span>Coordinator: <strong className="text-slate-200">{selected.coordinator_name || 'State Directorate'}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openCreateModal(selected)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit event"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selected.id, selected.title)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 transition-colors cursor-pointer"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Expected Attendance</span>
                  <p className="text-xl font-black text-white font-mono mt-0.5">{selected.expected_attendance}</p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Actual Attendance</span>
                  <p className="text-xl font-black text-amber-400 font-mono mt-0.5">{selected.actual_attendance || '--'}</p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Allocated Budget</span>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">${selected.budget?.toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Overview & Briefing</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    {selected.description}
                  </p>
                </div>
              )}

              {/* Interactive Logistics Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Operational Logistics Checklist ({selected.logistics_checklist?.filter(i => i.done).length || 0}/{selected.logistics_checklist?.length || 0})</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">Click item to toggle status</span>
                </div>

                <div className="space-y-2">
                  {selected.logistics_checklist?.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleLogisticsItem(selected.id, item.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        item.done
                          ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      {item.done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className={`text-xs ${item.done ? 'line-through opacity-80' : 'font-medium'}`}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Select an event to view venue logistics, checklist, and attendance reports.
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-white mb-2">
              {editingEvent ? 'Edit Event Details' : 'Schedule Party Event'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Town Hall on Environmental & River Safety"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Agenda, keynote speakers, instructions for attendees..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Rally">Rally</option>
                    <option value="Town Hall">Town Hall</option>
                    <option value="Convention">Convention</option>
                    <option value="Volunteer Training">Volunteer Training</option>
                    <option value="Press Conference">Press Conference</option>
                    <option value="Fundraiser">Fundraiser</option>
                    <option value="Community Outreach">Community Outreach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Venue / Physical Address *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Green Valley Community Pavilion, River Valley"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Attendance</label>
                  <input
                    type="number"
                    min="0"
                    value={expectedAttendance}
                    onChange={(e) => setExpectedAttendance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Attendance</label>
                  <input
                    type="number"
                    min="0"
                    value={actualAttendance}
                    onChange={(e) => setActualAttendance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Coordinator</label>
                  <select
                    value={coordinatorId}
                    onChange={(e) => setCoordinatorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Logistics Checklist Builder in Modal */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Logistics Items
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLogisticsText}
                    onChange={(e) => setNewLogisticsText(e.target.value)}
                    placeholder="Add checklist item..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddLogisticsInModal}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                  {logisticsList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs">
                      <span className="text-slate-300">{item.item}</span>
                      <button
                        type="button"
                        onClick={() => setLogisticsList(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
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
                  {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
