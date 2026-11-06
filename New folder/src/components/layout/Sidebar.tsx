import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Flag,
  Users,
  ClipboardList,
  CalendarDays,
  Building2,
  MapPin,
  CircleDollarSign,
  Megaphone,
  Bot,
  FileSpreadsheet,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'campaigns'
  | 'volunteers'
  | 'surveys'
  | 'events'
  | 'units'
  | 'geography'
  | 'finances'
  | 'announcements'
  | 'ai-assist'
  | 'reports'
  | 'audit-logs';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenRoleSwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onOpenRoleSwitcher
}) => {
  const { user, logout, isSuperAdmin } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.FC<any>; badge?: string; superAdminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaign Operations', icon: Flag },
    { id: 'volunteers', label: 'Volunteers & Roster', icon: Users },
    { id: 'surveys', label: 'Surveys & Feedback', icon: ClipboardList },
    { id: 'events', label: 'Events & Rallies', icon: CalendarDays },
    { id: 'units', label: 'Organizational Units', icon: Building2 },
    { id: 'geography', label: 'Geographical Coverage', icon: MapPin },
    { id: 'finances', label: 'Budget & Expenses', icon: CircleDollarSign },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'ai-assist', label: 'Local AI Assistant', icon: Bot, badge: 'Offline' },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'audit-logs', label: 'Audit Trail', icon: ShieldAlert, superAdminOnly: true }
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 select-none z-30 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white font-mono text-base block leading-none">
                  POLITIX
                </span>
                <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
                  Party Operations
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Active Role Indicator */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Profile</p>
                <p className="text-xs font-bold text-slate-200 truncate">{user?.full_name}</p>
                <span className="inline-block mt-0.5 text-[10px] font-medium text-blue-400 bg-blue-950/80 border border-blue-900 px-1.5 py-0.2 rounded truncate max-w-full">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={onOpenRoleSwitcher}
                title="Switch test role"
                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenRoleSwitcher}
              title={`Switch role (${user?.role})`}
              className="w-8 h-8 mx-auto rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navItems.map((item) => {
            if (item.superAdminOnly && !isSuperAdmin) return null;
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer group relative ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-bold ${
                    isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
