import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { NotificationItem } from '../../types/index.ts';
import {
  Bell,
  CheckCircle2,
  Database,
  Users,
  HardDrive
} from 'lucide-react';
import { NavTab } from './Sidebar.tsx';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenRoleSwitcher: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive Operations Dashboard', subtitle: 'Real-time overview of party units, campaigns, and metrics' },
  campaigns: { title: 'Campaign Management & Kanban Boards', subtitle: 'Strategic initiatives, milestone tracking, and task execution' },
  volunteers: { title: 'Volunteers & Organizational Roster', subtitle: 'Party members, field workers, assignments, and availability' },
  surveys: { title: 'Surveys & Voluntary Feedback', subtitle: 'Civic feedback collection, QR generator, and privacy-first analytics' },
  events: { title: 'Events, Rallies & Logistics', subtitle: 'Town halls, rallies, conventions, attendance, and checklists' },
  units: { title: 'Organizational Hierarchy', subtitle: 'Central, state, district, constituency, and local units structure' },
  geography: { title: 'Geographical Coverage & Territorial Units', subtitle: 'Interactive regional mapping and operational jurisdiction coverage' },
  finances: { title: 'Budget Allocation & Expense Approvals', subtitle: 'Treasury management, expense claims, receipt audits, and utilization' },
  announcements: { title: 'Internal Party Announcements', subtitle: 'Directives, urgent notices, and departmental communications' },
  'ai-assist': { title: 'Local AI Administrative Intelligence', subtitle: 'Offline report synthesis, survey analysis, and task bottleneck radar' },
  reports: { title: 'Compliance Reports & Data Exports', subtitle: 'Download CSV audit ledgers and generate formatted executive dossiers' },
  'audit-logs': { title: 'System Security Audit Trail', subtitle: 'Immutable internal transaction and user activity tracking' }
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenRoleSwitcher
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await apiRequest<NotificationItem[]>('/api/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (e) {
      // offline silent
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'info');
    } catch (e) {
      showToast('Failed to update notifications', 'error');
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      // ignore
    }
  };

  const tabInfo = TAB_TITLES[currentTab] || { title: 'POLITIX', subtitle: 'Operations' };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-white tracking-tight leading-tight flex items-center gap-2">
          <span>{tabInfo.title}</span>
        </h1>
        <p className="text-xs text-slate-400 hidden sm:block">
          {tabInfo.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Local Engine Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[11px] font-medium">
          <Database className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Local SQLite Connected</span>
        </div>

        {/* Quick Role Switcher Button */}
        <button
          onClick={onOpenRoleSwitcher}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Role:</span>
          <span className="text-blue-400">{user?.role}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-1.5 py-0.2 rounded font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-slate-800/40">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No notifications at this time
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkOneRead(n.id)}
                      className={`pt-2 pb-1 px-2 rounded-lg cursor-pointer transition-colors ${
                        n.is_read ? 'opacity-70 hover:opacity-100 hover:bg-slate-800/40' : 'bg-slate-800/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${n.is_read ? 'text-slate-300' : 'text-blue-300'}`}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Offline Security Badge */}
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700" title="Local System Environment">
          <HardDrive className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </header>
  );
};
