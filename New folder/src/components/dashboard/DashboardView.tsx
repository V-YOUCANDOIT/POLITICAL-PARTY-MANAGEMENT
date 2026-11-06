import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Users,
  Flag,
  CalendarDays,
  ClipboardList,
  Building2,
  CircleDollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  metrics: {
    totalMembers: number;
    activeVolunteers: number;
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    upcomingEvents: number;
    totalSurveys: number;
    totalResponses: number;
    totalUnits: number;
    pendingTasks: number;
    totalApprovedExpenditure: number;
    totalAllocatedBudget: number;
    pendingApprovalsCount: number;
  };
  charts: {
    campaignBudgets: { id: string; title: string; budget_allocated: number; spent: number }[];
    taskStats: { status: string; count: number }[];
    eventStats: { month: string; count: number }[];
  };
  recentActivities: {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: string;
    created_at: string;
    user_name: string;
  }[];
  nextEvents: {
    id: string;
    title: string;
    category: string;
    date_time: string;
    venue: string;
    expected_attendance: number;
  }[];
  pendingExpenses: {
    id: string;
    title: string;
    amount: number;
    category: string;
    transaction_date: string;
    submitter_name: string;
    campaign_title: string;
  }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export const DashboardView: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { user, canManageFinances } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<DashboardStats>('/api/dashboard/stats');
      setData(res);
    } catch (e: any) {
      showToast(e.message || 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickApproveExpense = async (id: string, title: string) => {
    try {
      await apiRequest(`/api/expenses/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Approved', approval_notes: 'Approved via Executive Dashboard' })
      });
      showToast(`Expense "${title}" approved successfully`, 'success');
      fetchStats();
    } catch (e: any) {
      showToast(e.message || 'Approval failed', 'error');
    }
  };

  const handleQuickRejectExpense = async (id: string, title: string) => {
    try {
      await apiRequest(`/api/expenses/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Rejected', approval_notes: 'Rejected via Executive Dashboard' })
      });
      showToast(`Expense "${title}" rejected`, 'warning');
      fetchStats();
    } catch (e: any) {
      showToast(e.message || 'Rejection failed', 'error');
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading SQLite analytics from local engine...</p>
        </div>
      </div>
    );
  }

  const m = data?.metrics || {
    totalMembers: 0,
    activeVolunteers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    upcomingEvents: 0,
    totalSurveys: 0,
    totalResponses: 0,
    totalUnits: 0,
    pendingTasks: 0,
    totalApprovedExpenditure: 0,
    totalAllocatedBudget: 0,
    pendingApprovalsCount: 0
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-800">
              {user?.role}
            </span>
            <span className="text-xs text-slate-400">Territory: {user?.unit?.name || 'National Secretariat'}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Greetings, {user?.full_name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Centralized monitoring for Party organizational units, field campaigns, community surveys, and budget ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('campaigns')}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Manage Campaigns</span>
          </button>
          <button
            onClick={() => onNavigate('finances')}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Treasury</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (11 Required Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Members</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{m.totalMembers}</p>
          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>●</span> {m.activeVolunteers} active volunteers
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Campaigns</span>
            <Flag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{m.totalCampaigns}</p>
          <p className="text-[10px] text-blue-400 mt-1 font-medium">
            {m.activeCampaigns} ongoing • {m.completedCampaigns} done
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Upcoming Events</span>
            <CalendarDays className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{m.upcomingEvents}</p>
          <p className="text-[10px] text-slate-400 mt-1">Conventions & rallies</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Survey Feedback</span>
            <ClipboardList className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{m.totalResponses}</p>
          <p className="text-[10px] text-cyan-400 mt-1 font-medium">
            Across {m.totalSurveys} public surveys
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Units & Teams</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{m.totalUnits}</p>
          <p className="text-[10px] text-purple-400 mt-1 font-medium">3 States • 6 Districts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Approved Spend</span>
            <CircleDollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ${(m.totalApprovedExpenditure / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            of ${(m.totalAllocatedBudget / 1000).toFixed(1)}k allocated
          </p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campaign Budgets & Spend (Bar Chart) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Campaign Budget vs. Actual Expenditure
              </h3>
              <p className="text-xs text-slate-400">Real-time expenditure tracking by campaign</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/80 px-2 py-0.5 rounded">
              Audited in SQLite
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.charts.campaignBudgets.map(c => ({
                  name: c.title.length > 20 ? c.title.substring(0, 18) + '...' : c.title,
                  Allocated: c.budget_allocated,
                  Spent: c.spent
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, '']}
                />
                <Bar dataKey="Allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Allocated Budget</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Approved Expenditure</span>
          </div>
        </div>

        {/* Task Status Distribution (Donut Chart) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Operational Tasks
              </h3>
              <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {m.pendingTasks} Pending
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Kanban workflow distribution</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts.taskStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {data?.charts.taskStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
            {data?.charts.taskStats.map((item, idx) => (
              <div key={item.status} className="flex items-center justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.status}
                </span>
                <span className="font-bold text-white font-mono">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Pending Financial Approvals & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Financial Approvals (Immediate action for central admin) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-emerald-400" />
                Pending Expense Approvals
              </h3>
              <p className="text-xs text-slate-400">Claims awaiting Central Administrator review</p>
            </div>
            <button
              onClick={() => onNavigate('finances')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {(!data?.pendingExpenses || data.pendingExpenses.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg">
                Zero pending expense claims. All accounts reconciled.
              </div>
            ) : (
              data.pendingExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{exp.title}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                        {exp.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submitted by <strong className="text-slate-300">{exp.submitter_name}</strong> • {exp.campaign_title || 'General Fund'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>

                    {canManageFinances ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickApproveExpense(exp.id, exp.title)}
                          title="Approve expense"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleQuickRejectExpense(exp.id, exp.title)}
                          title="Reject expense"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-300 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-400 bg-amber-950/50 border border-amber-900 px-2 py-0.5 rounded">
                        Pending Admin
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Recent System Activity
              </h3>
              <p className="text-xs text-slate-400">Immutable SQLite audit records</p>
            </div>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Full Log</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {data?.recentActivities.map((act) => (
              <div key={act.id} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-200">{act.action.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  <span className="text-blue-400">{act.user_name || 'System Engine'}</span> performed on {act.entity_type} ({act.entity_id || 'Global'})
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
