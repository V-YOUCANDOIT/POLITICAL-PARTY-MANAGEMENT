import React, { useState, useEffect } from 'react';
import { OrganizationalUnit, User } from '../../types/index.ts';
import { apiRequest } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Building2,
  Plus,
  ChevronRight,
  ChevronDown,
  Users,
  MapPin,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  Central: 'bg-purple-950/80 text-purple-300 border-purple-800',
  State: 'bg-blue-950/80 text-blue-300 border-blue-800',
  District: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
  Constituency: 'bg-amber-950/80 text-amber-300 border-amber-800',
  Local: 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
};

export const UnitsView: React.FC = () => {
  const { user, canManageUnits } = useAuth();
  const { showToast } = useToast();

  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<OrganizationalUnit['type']>('District');
  const [parentId, setParentId] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [stateName, setStateName] = useState('Central State');
  const [districtName, setDistrictName] = useState('Metro North');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<OrganizationalUnit[]>('/api/units');
      setUnits(data);
    } catch (e: any) {
      showToast(e.message || 'Failed to load organizational units', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiRequest<User[]>('/api/volunteers');
      setUsers(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setName('');
    setType('District');
    setParentId(units[0]?.id || '');
    setCoordinatorId('');
    setStateName('Central State');
    setDistrictName('Metro North');
    setAddress('200 Civic Center Parkway');
    setIsModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await apiRequest('/api/units', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type,
          parent_id: parentId || null,
          coordinator_id: coordinatorId || null,
          state_name: stateName || null,
          district_name: districtName || null,
          address: address || null
        })
      });
      showToast(`Organizational unit "${name}" established`, 'success');
      setIsModalOpen(false);
      fetchUnits();
    } catch (e: any) {
      showToast(e.message || 'Failed to create unit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Organize units by type
  const centralUnit = units.find(u => u.type === 'Central');
  const stateUnits = units.filter(u => u.type === 'State');
  const districtUnits = units.filter(u => u.type === 'District');
  const constituencyUnits = units.filter(u => u.type === 'Constituency');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Organizational Structure & Party Units
          </h2>
          <p className="text-xs text-slate-400">
            Hierarchical governing tree: Central Secretariat → State Directorates → District Units → Constituencies.
          </p>
        </div>

        {canManageUnits && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Establish New Unit</span>
          </button>
        )}
      </div>

      {/* Hierarchy Flow Visual Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Interactive Governance Hierarchy</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">10 Operational Units Deployed</span>
        </div>

        {/* Level 1: Central */}
        {centralUnit && (
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded border uppercase ${TYPE_COLORS['Central']}`}>
                    Central Level
                  </span>
                  <h4 className="text-sm font-bold text-white">{centralUnit.name}</h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Coordinator: <strong className="text-slate-200">{centralUnit.coordinator_name || 'Eleanor Vance'}</strong> • {centralUnit.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono shrink-0">
              <span className="text-purple-300 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {centralUnit.member_count || 0} Members
              </span>
            </div>
          </div>
        )}

        {/* Level 2: State Units */}
        <div className="pl-4 sm:pl-8 border-l-2 border-slate-800 space-y-4">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level 2: State & Provincial Directorates</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stateUnits.map((st) => (
              <div key={st.id} className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${TYPE_COLORS['State']}`}>
                    State Directorate
                  </span>
                  <span className="text-[10px] font-mono text-blue-300">{st.member_count || 0} Cadre</span>
                </div>
                <h4 className="text-xs font-bold text-white">{st.name}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Lead: <strong className="text-slate-300">{st.coordinator_name || 'Assigned Director'}</strong>
                </p>
                <p className="text-[10px] text-slate-500 truncate">{st.address}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Level 3: District Units */}
        <div className="pl-4 sm:pl-8 border-l-2 border-slate-800 space-y-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level 3: District Units & Field Commands</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {districtUnits.map((dist) => (
              <div key={dist.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${TYPE_COLORS['District']}`}>
                    District
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">{dist.member_count || 0} Staff</span>
                </div>
                <h4 className="text-xs font-bold text-white">{dist.name}</h4>
                <p className="text-[11px] text-slate-400">
                  {dist.state_name} • {dist.coordinator_name || 'District Coordinator'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{dist.address}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Level 4: Constituency & Local Teams */}
        <div className="pl-4 sm:pl-8 border-l-2 border-slate-800 space-y-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level 4: Constituency & Local Field Teams</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {constituencyUnits.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${TYPE_COLORS['Constituency']}`}>
                    Constituency Unit
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">{c.member_count || 0} Field Cadre</span>
                </div>
                <h4 className="text-xs font-bold text-white">{c.name}</h4>
                <p className="text-[11px] text-slate-400">
                  Manager: <strong className="text-slate-300">{c.coordinator_name || 'Amara Diallo'}</strong>
                </p>
                <p className="text-[10px] text-slate-500">{c.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Unit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Establish Organizational Unit</h3>

            <form onSubmit={handleSaveUnit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Coastal South District Unit"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Hierarchy Level *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Central">Central Secretariat</option>
                    <option value="State">State Unit</option>
                    <option value="District">District Unit</option>
                    <option value="Constituency">Constituency Unit</option>
                    <option value="Local">Local Ward / Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Entity</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None (Top Level)</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">District Name</label>
                  <input
                    type="text"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coordinator / Unit Director</label>
                <select
                  value={coordinatorId}
                  onChange={(e) => setCoordinatorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Coordinator</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Office Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 50 Republic Boulevard, Suite 100"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {submitting ? 'Creating...' : 'Establish Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
