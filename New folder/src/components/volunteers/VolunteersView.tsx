import React, { useState, useEffect } from 'react';
import { User, OrganizationalUnit, UserRole } from '../../types/index.ts';
import { apiRequest } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  CheckCircle,
  Clock,
  Shield,
  Edit,
  UserCheck,
  UserX,
  FileSpreadsheet
} from 'lucide-react';

export const VolunteersView: React.FC = () => {
  const { user, canManageUsers } = useAuth();
  const { showToast } = useToast();

  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('politix2026');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Volunteer / Ground Worker');
  const [unitId, setUnitId] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [submitting, setSubmitting] = useState(false);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<any[]>(
        `/api/volunteers?role=${roleFilter}&unit_id=${unitFilter}&status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      setVolunteers(data);
    } catch (e: any) {
      showToast(e.message || 'Failed to load volunteers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await apiRequest<OrganizationalUnit[]>('/api/units');
      setUnits(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchVolunteers();
    fetchUnits();
  }, [roleFilter, unitFilter, statusFilter, search]);

  const handleOpenModal = (member?: any) => {
    if (member) {
      setEditingMember(member);
      setFullName(member.full_name);
      setEmail(member.email);
      setPhone(member.phone || '');
      setRole(member.role);
      setUnitId(member.unit_id || '');
      setStatus(member.status);
    } else {
      setEditingMember(null);
      setFullName('');
      setEmail('');
      setPassword('politix2026');
      setPhone('+1 (555) 019-20');
      setRole('Volunteer / Ground Worker');
      setUnitId(units[0]?.id || '');
      setStatus('Active');
    }
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      if (editingMember) {
        await apiRequest(`/api/volunteers/${editingMember.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            full_name: fullName,
            phone,
            role,
            unit_id: unitId || null,
            status
          })
        });
        showToast(`Member profile "${fullName}" updated`, 'success');
      } else {
        await apiRequest('/api/volunteers', {
          method: 'POST',
          body: JSON.stringify({
            full_name: fullName,
            email,
            password,
            phone,
            role,
            unit_id: unitId || null
          })
        });
        showToast(`New party member "${fullName}" added to roster!`, 'success');
      }
      setIsModalOpen(false);
      fetchVolunteers();
    } catch (e: any) {
      showToast(e.message || 'Failed to save member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: any) => {
    const nextStatus = member.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiRequest(`/api/volunteers/${member.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(`Member status changed to ${nextStatus}`, 'info');
      fetchVolunteers();
    } catch (e: any) {
      showToast(e.message || 'Status update failed', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Volunteer & Team Directory
          </h2>
          <p className="text-xs text-slate-400">
            Registered organizational cadre, field workers, district coordinators, and task allocation tracking.
          </p>
        </div>

        {canManageUsers && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member / Volunteer</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="Volunteer / Ground Worker">Volunteers Only</option>
            <option value="Campaign Manager">Campaign Managers</option>
            <option value="Constituency Manager">Constituency Managers</option>
            <option value="District Coordinator">District Coordinators</option>
            <option value="State Coordinator">State Coordinators</option>
            <option value="Central Administrator">Central Administrators</option>
            <option value="Super Administrator">Super Administrators</option>
          </select>
        </div>

        <div>
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Organizational Units</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Directory Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Roster Members ({volunteers.length})
          </span>
          <span className="text-[11px] text-slate-400">
            {volunteers.filter(v => v.status === 'Active').length} Active Field Deployments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Member Details</th>
                <th className="py-3 px-4">Role & Clearance</th>
                <th className="py-3 px-4">Assigned Unit</th>
                <th className="py-3 px-4">Tasks Completed</th>
                <th className="py-3 px-4">Status</th>
                {canManageUsers && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {volunteers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No members found matching your search filters.
                  </td>
                </tr>
              ) : (
                volunteers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{v.full_name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{v.email}</span>
                      </div>
                      {v.phone && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{v.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        v.role.includes('Admin') ? 'bg-purple-950/60 text-purple-300 border-purple-800' :
                        v.role.includes('Coordinator') ? 'bg-blue-950/60 text-blue-300 border-blue-800' :
                        v.role.includes('Manager') ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {v.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-white font-medium flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{v.unit_name || 'Central Roster'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {v.state_name ? `${v.state_name} • ${v.district_name || 'Provincial'}` : 'National'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{v.completed_tasks_count || 0}</span>
                        <span className="text-slate-500 font-normal">/ {v.assigned_tasks_count || 0}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        v.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        v.status === 'Inactive' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                        'bg-red-950 text-red-400 border-red-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>

                    {canManageUsers && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenModal(v)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Member"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(v)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              v.status === 'Active'
                                ? 'bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300'
                                : 'bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-300'
                            }`}
                            title={v.status === 'Active' ? 'Deactivate Member' : 'Activate Member'}
                          >
                            {v.status === 'Active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-white mb-2">
              {editingMember ? 'Edit Member Profile' : 'Enroll New Party Member'}
            </h3>

            <form onSubmit={handleSaveMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal / Roster Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingMember}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cadre@politix.org"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">System Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Volunteer / Ground Worker">Volunteer / Ground Worker</option>
                    <option value="Campaign Manager">Campaign Manager</option>
                    <option value="Constituency Manager">Constituency Manager</option>
                    <option value="District Coordinator">District Coordinator</option>
                    <option value="State Coordinator">State Coordinator</option>
                    <option value="Central Administrator">Central Administrator</option>
                    <option value="Super Administrator">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Organizational Unit</label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingMember && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              )}

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
                  {submitting ? 'Saving...' : editingMember ? 'Update Profile' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
