import React, { useState, useEffect } from 'react';
import { Campaign, CampaignStatus, User } from '../../types/index.ts';
import { apiRequest } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { KanbanBoard } from '../tasks/KanbanBoard.tsx';
import {
  Flag,
  Plus,
  Search,
  Calendar,
  MapPin,
  CircleDollarSign,
  Users,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

const STATUS_BADGES: Record<CampaignStatus, string> = {
  Active: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  Planned: 'bg-blue-950 text-blue-400 border-blue-800',
  Draft: 'bg-slate-800 text-slate-400 border-slate-700',
  Paused: 'bg-amber-950 text-amber-400 border-amber-800',
  Completed: 'bg-purple-950 text-purple-400 border-purple-800',
  Archived: 'bg-slate-900 text-slate-500 border-slate-800'
};

export const CampaignsView: React.FC = () => {
  const { user, canManageCampaigns } = useAuth();
  const { showToast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'budget'>('overview');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('Planned');
  const [budgetAllocated, setBudgetAllocated] = useState('50000');
  const [managerId, setManagerId] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Campaign[]>(`/api/campaigns?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`);
      setCampaigns(data);
      // Auto select first if none selected
      if (!selectedCampaignId && data.length > 0) {
        setSelectedCampaignId(data[0].id);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetail = async (id: string) => {
    try {
      const data = await apiRequest(`/api/campaigns/${id}`);
      setCampaignDetail(data);
    } catch (e: any) {
      showToast(e.message || 'Failed to load campaign details', 'error');
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
    fetchCampaigns();
    fetchUsers();
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    if (selectedCampaignId) {
      fetchCampaignDetail(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const handleOpenCreateModal = (c?: Campaign) => {
    if (c) {
      setEditingCampaign(c);
      setTitle(c.title);
      setDescription(c.description || '');
      setObjectives(c.objectives || '');
      setStartDate(c.start_date);
      setEndDate(c.end_date);
      setLocation(c.location || '');
      setStatus(c.status);
      setBudgetAllocated(String(c.budget_allocated));
      setManagerId(c.manager_id || user?.id || '');
    } else {
      setEditingCampaign(null);
      setTitle('');
      setDescription('');
      setObjectives('1. Mobilize community volunteers\n2. Host regional town halls\n3. Engage municipal leadership');
      const now = new Date();
      setStartDate(now.toISOString().split('T')[0]);
      const end = new Date(Date.now() + 90 * 86400000);
      setEndDate(end.toISOString().split('T')[0]);
      setLocation('Metro North & Central Districts');
      setStatus('Planned');
      setBudgetAllocated('45000');
      setManagerId(user?.id || '');
    }
    setIsCreateModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCampaign) {
        await apiRequest(`/api/campaigns/${editingCampaign.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title,
            description,
            objectives,
            start_date: startDate,
            end_date: endDate,
            location,
            status,
            manager_id: managerId,
            budget_allocated: budgetAllocated
          })
        });
        showToast(`Campaign "${title}" updated`, 'success');
      } else {
        const res = await apiRequest('/api/campaigns', {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            objectives,
            start_date: startDate,
            end_date: endDate,
            location,
            status,
            manager_id: managerId,
            budget_allocated: budgetAllocated
          })
        });
        showToast(`Campaign "${title}" created successfully!`, 'success');
        setSelectedCampaignId(res.id);
      }
      setIsCreateModalOpen(false);
      fetchCampaigns();
    } catch (e: any) {
      showToast(e.message || 'Error saving campaign', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id: string, campTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete campaign "${campTitle}" and its associated tasks?`)) return;
    try {
      await apiRequest(`/api/campaigns/${id}`, { method: 'DELETE' });
      showToast(`Campaign "${campTitle}" deleted`, 'warning');
      setSelectedCampaignId(null);
      fetchCampaigns();
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    }
  };

  const selected = campaignDetail?.campaign;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flag className="w-5 h-5 text-blue-500" />
            Campaign Operations & Field Strategy
          </h2>
          <p className="text-xs text-slate-400">
            Deploy grassroots initiatives, manage Kanban tasks, track team milestones and budget allocations.
          </p>
        </div>

        {canManageCampaigns && (
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left Campaign Master List, Right Detail & Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Campaigns List & Filters */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-1 pb-1">
            {['all', 'Active', 'Planned', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Campaigns list */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {campaigns.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No campaigns match your filters
              </div>
            ) : (
              campaigns.map((c) => {
                const isSelected = selectedCampaignId === c.id;
                const totalTasks = c.task_count || 0;
                const doneTasks = c.completed_task_count || 0;
                const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCampaignId(c.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${STATUS_BADGES[c.status] || ''}`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        ${c.budget_allocated.toLocaleString()}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1 leading-snug line-clamp-1">{c.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{c.location || 'Multiple Regions'}</span>
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Tasks: {doneTasks}/{totalTasks}</span>
                        <span className="font-semibold text-slate-300">{progressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Campaign Details & Kanban Board */}
        <div className="lg:col-span-8 space-y-4">
          {selected ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              {/* Campaign Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${STATUS_BADGES[selected.status as CampaignStatus] || ''}`}>
                      {selected.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {selected.start_date} to {selected.end_date}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{selected.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{selected.location || 'Jurisdiction Wide'}</span>
                    <span className="mx-1">•</span>
                    <span>Lead: <strong className="text-slate-200">{selected.manager_name || 'Central Director'}</strong></span>
                  </p>
                </div>

                {canManageCampaigns && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenCreateModal(selected)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit campaign"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(selected.id, selected.title)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 transition-colors cursor-pointer"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Detail Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: 'overview', label: 'Overview & Objectives', icon: FileText },
                  { id: 'tasks', label: `Kanban Tasks (${campaignDetail.tasks?.length || 0})`, icon: Clock },
                  { id: 'team', label: `Assigned Personnel (${campaignDetail.members?.length || 0})`, icon: Users },
                  { id: 'budget', label: `Financials & Expenses (${campaignDetail.expenses?.length || 0})`, icon: CircleDollarSign }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Description</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      {selected.description || 'No detailed description provided for this operational initiative.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Strategic Objectives</h4>
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {selected.objectives || '1. Mobilize grassroots volunteers\n2. Establish field offices\n3. Engage municipal leadership'}
                    </div>
                  </div>

                  {/* Quick KPI stats */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Allocated Budget</span>
                      <p className="text-base font-bold text-white font-mono mt-0.5">${selected.budget_allocated?.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Spent to Date</span>
                      <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">${selected.spent_amount?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Tasks Completed</span>
                      <p className="text-base font-bold text-blue-400 font-mono mt-0.5">
                        {selected.completed_task_count || 0} / {selected.task_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <KanbanBoard
                  campaignId={selected.id}
                  tasks={campaignDetail.tasks || []}
                  teamMembers={campaignDetail.members || []}
                  onTasksChanged={() => fetchCampaignDetail(selected.id)}
                />
              )}

              {activeTab === 'team' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300">Operational Personnel Assigned</h4>
                    <span className="text-xs text-slate-500 font-mono">{campaignDetail.members?.length || 0} members</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {campaignDetail.members?.map((m: any) => (
                      <div key={m.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{m.full_name}</p>
                          <p className="text-[11px] text-blue-400">{m.role_in_campaign}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{m.email}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'budget' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300">Campaign Expense Ledger</h4>
                    <span className="text-xs text-emerald-400 font-bold font-mono">
                      Spent: ${selected.spent_amount?.toLocaleString() || 0} / ${selected.budget_allocated?.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {campaignDetail.expenses?.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl">
                        No recorded expenses yet for this campaign.
                      </div>
                    ) : (
                      campaignDetail.expenses?.map((e: any) => (
                        <div key={e.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{e.title}</span>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                                e.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                                e.status === 'Rejected' ? 'bg-red-950 text-red-400 border-red-800' :
                                'bg-amber-950 text-amber-400 border-amber-800'
                              }`}>
                                {e.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {e.category} • {e.transaction_date} • Submitted by {e.submitter_name}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-white font-mono">
                            ${e.amount?.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Select a campaign on the left to view operational details and Kanban board
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-4">
              {editingCampaign ? 'Edit Campaign Initiative' : 'Create New Campaign'}
            </h3>

            <form onSubmit={handleSaveCampaign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clean River & Watershed Initiative 2026"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of campaign scope..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Strategic Objectives
                </label>
                <textarea
                  rows={3}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="1. Target metric\n2. Key milestone..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Territory / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. River Valley & Coastal Region"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Planned">Planned</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Allocated Budget ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={budgetAllocated}
                    onChange={(e) => setBudgetAllocated(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Manager</label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
