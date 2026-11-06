import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { X, Check, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoleCard {
  role: UserRole;
  email: string;
  name: string;
  description: string;
  keyPermissions: string[];
}

const ROLES_LIST: RoleCard[] = [
  {
    role: 'Super Administrator',
    email: 'superadmin@politix.org',
    name: 'Eleanor Vance',
    description: 'System root administrator. Unrestricted access to database, audit logs, configuration, and all units.',
    keyPermissions: ['All Permissions', 'System Audit Trail', 'Role Governance', 'Database Operations']
  },
  {
    role: 'Central Administrator',
    email: 'centraladmin@politix.org',
    name: 'Marcus Sterling',
    description: 'National party secretariat. Oversees campaigns, approves financial expenses, manages all state directors.',
    keyPermissions: ['Expense Approval', 'National Campaigns', 'Unit Management', 'Global Metrics']
  },
  {
    role: 'State Coordinator',
    email: 'statecoord@politix.org',
    name: 'Sarah Chen-Morales',
    description: 'Director of North Province. Coordinates district units, rallies, and submits state funding requisitions.',
    keyPermissions: ['State Level Oversight', 'District Unit Coordination', 'Event Organization', 'Expense Claims']
  },
  {
    role: 'District Coordinator',
    email: 'districtcoord@politix.org',
    name: 'David O\'Connor',
    description: 'Metro North district organizer. Mobilizes ground workers, assigns tasks, and tracks constituency metrics.',
    keyPermissions: ['Task Assignment', 'Volunteer Deployment', 'Constituency Oversight', 'Event Checklists']
  },
  {
    role: 'Constituency Manager',
    email: 'constituency@politix.org',
    name: 'Amara Diallo',
    description: 'Central East constituency leader. Conducts community feedback, door-to-door canvassing, and local town halls.',
    keyPermissions: ['Local Field Surveys', 'Ground Team Leadership', 'Voter Outreach', 'Community Forums']
  },
  {
    role: 'Campaign Manager',
    email: 'campaignmgr@politix.org',
    name: 'Julian Hayes',
    description: 'Director of the Clean River Initiative 2026. Manages Kanban task board, volunteers, and operational milestone delivery.',
    keyPermissions: ['Kanban Board Control', 'Campaign Budget Claims', 'Milestone Tracking', 'Logistics Procurement']
  },
  {
    role: 'Volunteer / Ground Worker',
    email: 'volunteer@politix.org',
    name: 'Maya Patel',
    description: 'Field volunteer. Participates in cleanup rallies, distributes QR feedback forms, and checks off assigned tasks.',
    keyPermissions: ['Execute Assigned Tasks', 'Event Participation', 'Survey Distribution', 'Personal Availability']
  }
];

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { user, quickSwitchUser } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSelectRole = async (email: string, roleName: string) => {
    try {
      await quickSwitchUser(email);
      showToast(`Switched active profile to ${roleName}`, 'success');
      onClose();
    } catch (e: any) {
      showToast(e.message || 'Failed to switch profile', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Switch Test Role</h2>
              <p className="text-xs text-slate-400">Instantly switch between organizational roles to verify permission gates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-800/40">
          {ROLES_LIST.map((r) => {
            const isCurrent = user?.role === r.role;
            return (
              <div
                key={r.email}
                onClick={() => handleSelectRole(r.email, r.role)}
                className={`pt-3 first:pt-0 p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  isCurrent
                    ? 'bg-blue-950/40 border-blue-600/80 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{r.role}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({r.name})</span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">{r.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.keyPermissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"
                      >
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Bcrypt authentication & JWT sessions active
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
