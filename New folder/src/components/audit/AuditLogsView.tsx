import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '../../types/index.ts';
import { apiRequest } from '../../lib/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Database,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<AuditLogItem[]>('/api/audit-logs');
      setLogs(data);
    } catch (e: any) {
      showToast(e.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.entity_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            System Security Audit Trail
          </h2>
          <p className="text-xs text-slate-400">
            Immutable SQLite transaction history recording administrative actions, approvals, and security events.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800 px-3 py-1.5 rounded-lg">
          <Lock className="w-3.5 h-3.5" />
          <span>Restricted Admin Log</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audit trail by action, user, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono shrink-0">
          {filteredLogs.length} events logged
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / User</th>
                <th className="py-3 px-4">Security Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details / Parameters</th>
                <th className="py-3 px-4 text-right">Host IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-white font-sans font-semibold">
                      {l.user_name || 'System Daemon'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.action.includes('APPROVE') ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        l.action.includes('REJECT') || l.action.includes('DELETE') ? 'bg-red-950 text-red-400 border border-red-800' :
                        l.action.includes('LOGIN') ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {l.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {l.entity_type} {l.entity_id ? `(${l.entity_id})` : ''}
                    </td>

                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {l.details || '--'}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-500">
                      {l.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
