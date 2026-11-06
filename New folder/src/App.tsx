import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { Sidebar, NavTab } from './components/layout/Sidebar.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal.tsx';

// Modules
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { CampaignsView } from './components/campaigns/CampaignsView.tsx';
import { VolunteersView } from './components/volunteers/VolunteersView.tsx';
import { SurveysView } from './components/surveys/SurveysView.tsx';
import { EventsView } from './components/events/EventsView.tsx';
import { UnitsView } from './components/units/UnitsView.tsx';
import { GeographyView } from './components/geography/GeographyView.tsx';
import { FinancesView } from './components/finances/FinancesView.tsx';
import { AnnouncementsView } from './components/announcements/AnnouncementsView.tsx';
import { AiAssistantView } from './components/ai/AiAssistantView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { AuditLogsView } from './components/audit/AuditLogsView.tsx';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Initializing POLITIX On-Premises Engine...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* Modern Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar */}
          <Navbar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
          />

          {/* Module Views */}
          <main className="flex-1 pb-16">
            {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
            {currentTab === 'campaigns' && <CampaignsView />}
            {currentTab === 'volunteers' && <VolunteersView />}
            {currentTab === 'surveys' && <SurveysView />}
            {currentTab === 'events' && <EventsView />}
            {currentTab === 'units' && <UnitsView />}
            {currentTab === 'geography' && <GeographyView />}
            {currentTab === 'finances' && <FinancesView />}
            {currentTab === 'announcements' && <AnnouncementsView />}
            {currentTab === 'ai-assist' && <AiAssistantView />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'audit-logs' && <AuditLogsView />}
          </main>
        </div>
      </div>

      {/* Global Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
