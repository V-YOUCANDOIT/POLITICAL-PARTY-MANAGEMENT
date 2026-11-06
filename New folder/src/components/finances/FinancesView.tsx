import React, { useState, useEffect } from 'react';
import { Expense, Campaign } from '../../types/index.ts';
import { apiRequest } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  CircleDollarSign,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Clock,
  Filter,
  Search,
  Paperclip,
  Check,
  X,
  AlertTriangle,
  Receipt
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

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const FinancesView: React.FC = () => {
  const { user, canManageFinances } = useAuth();
  const { showToast } = useToast();

  const [overview, setOverview] = useState<any | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Submit Expense Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Logistics');
  const [amount, setAmount] = useState('1250');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [campaignId, setCampaignId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Review (Approve/Reject) Modal
  const [reviewingExpense, setReviewingExpense] = useState<Expense | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const [overviewData, expensesData, campaignsData] = await Promise.all([
        apiRequest('/api/finances/overview'),
        apiRequest<Expense[]>(`/api/expenses?status=${statusFilter}&category=${categoryFilter}`),
        apiRequest<Campaign[]>('/api/campaigns')
      ]);
      setOverview(overviewData);
      setExpenses(expensesData);
      setCampaigns(campaignsData);
      if (campaignsData.length > 0 && !campaignId) {
        setCampaignId(campaignsData[0].id);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load financial records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, [statusFilter, categoryFilter]);

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('amount', amount);
      formData.append('transaction_date', transactionDate);
      if (campaignId) formData.append('campaign_id', campaignId);
      if (receiptFile) formData.append('receipt', receiptFile);

      await apiRequest('/api/expenses', {
        method: 'POST',
        body: formData
      });

      showToast(`Expense claim for $${amount} submitted for approval`, 'success');
      setIsSubmitModalOpen(false);
      fetchFinancials();
    } catch (e: any) {
      showToast(e.message || 'Failed to submit expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewDecision = async (status: 'Approved' | 'Rejected') => {
    if (!reviewingExpense) return;

    try {
      await apiRequest(`/api/expenses/${reviewingExpense.id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          approval_notes: approvalNotes
        })
      });
      showToast(`Expense claim marked as ${status}`, status === 'Approved' ? 'success' : 'warning');
      setReviewingExpense(null);
      setApprovalNotes('');
      fetchFinancials();
    } catch (e: any) {
      showToast(e.message || 'Review action failed', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-emerald-400" />
            Party Treasury, Budgets & Expense Audit
          </h2>
          <p className="text-xs text-slate-400">
            Appropriations, multi-tier expense approvals, receipt document audits, and real-time ledger verification.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setDescription('');
            setAmount('1250');
            setCategory('Logistics');
            setReceiptFile(null);
            setIsSubmitModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Expense Claim</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Allocated Budget</span>
          <p className="text-2xl font-black text-white font-mono mt-1">
            ${overview?.totalAllocated ? Number(overview.totalAllocated).toLocaleString() : '0'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Fiscal Year 2026</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Approved Expenditure</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ${overview?.totalApproved ? Number(overview.totalApproved).toLocaleString() : '0'}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">
            {overview?.utilizationRate || 0}% budget utilized
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Approval</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            ${overview?.totalPending ? Number(overview.totalPending).toLocaleString() : '0'}
          </p>
          <p className="text-[10px] text-amber-400 font-semibold mt-1">Requires review</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Remaining Reserves</span>
          <p className="text-2xl font-black text-blue-400 font-mono mt-1">
            ${overview?.remaining ? Number(overview.remaining).toLocaleString() : '0'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Unencumbered funds</p>
        </div>
      </div>

      {/* Visual Charts: Expenditure by Category & Monthly Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (Donut) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Expenditure by Operational Category
          </h3>
          <p className="text-xs text-slate-400 mb-2">Approved financial disbursements</p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview?.byCategory || []}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {(overview?.byCategory || []).map((_: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Spent']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
            {(overview?.byCategory || []).slice(0, 6).map((c: any, idx: number) => (
              <div key={c.category} className="flex items-center justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="flex items-center gap-1.5 text-slate-300 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                  <span className="truncate">{c.category}</span>
                </span>
                <span className="font-bold text-white font-mono">${c.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend (Bar) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Monthly Expenditure Trend (2026)
          </h3>
          <p className="text-xs text-slate-400 mb-3">Disbursements logged in SQLite treasury ledger</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.monthlyExpenses || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Disbursed']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table with Approvals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Expense Claims Ledger ({expenses.length})
            </h3>
            <p className="text-[11px] text-slate-400">Complete transaction history and approval status</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Travel">Travel</option>
              <option value="Media & Advertising">Media & Advertising</option>
              <option value="Venue & Rentals">Venue & Rentals</option>
              <option value="Printing & Materials">Printing & Materials</option>
              <option value="Catering">Catering</option>
              <option value="Logistics">Logistics</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-xs">{exp.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Submitted by <strong className="text-slate-300">{exp.submitter_name}</strong>
                    </div>
                    {exp.receipt_url && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-400">
                        <Paperclip className="w-3 h-3" />
                        <span>Receipt Document Attached</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {exp.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {exp.campaign_title || 'General Headquarters Fund'}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                    ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {exp.transaction_date}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      exp.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      exp.status === 'Rejected' ? 'bg-red-950 text-red-400 border-red-800' :
                      'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {exp.status}
                    </span>
                    {exp.approval_notes && (
                      <p className="text-[9px] text-slate-500 italic mt-0.5 line-clamp-1">{exp.approval_notes}</p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {canManageFinances && exp.status === 'Pending' ? (
                      <button
                        onClick={() => {
                          setReviewingExpense(exp);
                          setApprovalNotes('');
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                      >
                        Review Claim
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {exp.status === 'Pending' ? 'Awaiting Review' : `Audited`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Approve / Reject Modal */}
      {reviewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Review Expense Requisition</h3>
              <button
                onClick={() => setReviewingExpense(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <p className="text-xs font-bold text-white">{reviewingExpense.title}</p>
              <p className="text-sm font-bold text-emerald-400 font-mono">${reviewingExpense.amount.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">
                Submitted by {reviewingExpense.submitter_name} • {reviewingExpense.category} • {reviewingExpense.transaction_date}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Auditor Approval Notes / Resolution
              </label>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="e.g. Verified against invoice #88921. Certified under FY2026 operations."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleReviewDecision('Rejected')}
                className="px-4 py-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 text-xs font-semibold cursor-pointer border border-red-800"
              >
                Reject Claim
              </button>
              <button
                onClick={() => handleReviewDecision('Approved')}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Approve & Disburse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Expense Claim Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Submit New Expense Claim</h3>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Volunteer Hydration & Field Staging Supplies"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Itemized details, vendor name, or invoice reference..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Media & Advertising">Media & Advertising</option>
                    <option value="Venue & Rentals">Venue & Rentals</option>
                    <option value="Printing & Materials">Printing & Materials</option>
                    <option value="Catering">Catering</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Campaign</label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">General Headquarters Fund</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Attach Local Receipt File (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
                />
                <p className="text-[10px] text-slate-500 mt-1">Saved locally to uploads/receipts directory.</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
