import React, { useState } from 'react';
import { downloadFile } from '../../lib/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  CheckCircle2,
  Flag,
  Users,
  CircleDollarSign,
  CalendarDays
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: string, filename: string) => {
    setDownloading(type);
    try {
      await downloadFile(`/api/export/${type}`, filename);
      showToast(`Exported ${filename} successfully`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Export failed', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  const reports = [
    {
      type: 'campaigns',
      title: 'Campaign Operations Audit Ledger',
      desc: 'Itemized status of all 5 campaigns, allocated budgets, milestone dates, and active field locations.',
      icon: Flag,
      filename: 'politix-campaigns-report.csv'
    },
    {
      type: 'volunteers',
      title: 'Registered Party Cadre & Volunteer Roster',
      desc: 'Complete directory of 30 members, system clearance roles, assigned units, and verification status.',
      icon: Users,
      filename: 'politix-volunteers-roster.csv'
    },
    {
      type: 'finances',
      title: 'Treasury & Expense Requisitions Journal',
      desc: 'Approved and pending expenditure claims, vendor categories, transaction dates, and auditor notes.',
      icon: CircleDollarSign,
      filename: 'politix-treasury-expenses.csv'
    },
    {
      type: 'events',
      title: 'Events, Rallies & Attendance Register',
      desc: 'Upcoming and completed state conventions, town halls, expected vs actual attendance, and budgets.',
      icon: CalendarDays,
      filename: 'politix-events-attendance.csv'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Compliance Reporting & Data Export Center
          </h2>
          <p className="text-xs text-slate-400">
            Export raw CSV datasets and generate audit dossiers directly from the local SQLite database.
          </p>
        </div>

        <button
          onClick={handlePrintDossier}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4 text-blue-400" />
          <span>Print Audit Dossier</span>
        </button>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          const isDownloadingThis = downloading === r.type;

          return (
            <div
              key={r.type}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
                    CSV Format
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{r.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Direct SQLite query dump</span>
                <button
                  onClick={() => handleDownload(r.type, r.filename)}
                  disabled={isDownloadingThis}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloadingThis ? 'Exporting...' : 'Export CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Executive Print-Ready Summary Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Party Executive Dossier Summary (Printable)
          </h3>
          <span className="text-xs text-slate-500 font-mono">Generated: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-4 font-mono">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white">POLITIX ORGANIZATIONAL AUDIT DIGEST</h4>
            <p className="text-[11px] text-slate-400">Jurisdiction: National Secretariat • Fiscal Period: FY2026</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Registered Members</p>
              <p className="text-sm font-bold text-white mt-0.5">30 Personnel</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Active Initiatives</p>
              <p className="text-sm font-bold text-blue-400 mt-0.5">5 Campaigns</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Approved Outlays</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">$18,870.00</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase">Compliance Level</p>
              <p className="text-sm font-bold text-purple-400 mt-0.5">100% On-Premises</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
            This internal dossier certifies that all records, volunteer rosters, and expense reimbursements are maintained within a local SQLite relational store without external cloud dependency.
          </p>
        </div>
      </div>
    </div>
  );
};
