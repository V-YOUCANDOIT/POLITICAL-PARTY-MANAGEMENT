import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { ShieldCheck, Lock, Mail, Users, ArrowRight, Database, KeyRound, HardDrive } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface DemoAccount {
  email: string;
  name: string;
  role: UserRole;
  desc: string;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'superadmin@politix.org',
    name: 'Eleanor Vance',
    role: 'Super Administrator',
    desc: 'Full global system control, database, audit, roles',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800'
  },
  {
    email: 'centraladmin@politix.org',
    name: 'Marcus Sterling',
    role: 'Central Administrator',
    desc: 'National headquarters, finances, campaigns & units',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
  },
  {
    email: 'statecoord@politix.org',
    name: 'Sarah Chen-Morales',
    role: 'State Coordinator',
    desc: 'North Province directorate, districts & state events',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
  },
  {
    email: 'districtcoord@politix.org',
    name: 'David O\'Connor',
    role: 'District Coordinator',
    desc: 'Metro North district, local teams & task assignments',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800'
  },
  {
    email: 'constituency@politix.org',
    name: 'Amara Diallo',
    role: 'Constituency Manager',
    desc: 'Central East constituency, voter outreach & surveys',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
  },
  {
    email: 'campaignmgr@politix.org',
    name: 'Julian Hayes',
    role: 'Campaign Manager',
    desc: 'River cleanup campaign, Kanban boards & budget claims',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
  },
  {
    email: 'volunteer@politix.org',
    name: 'Maya Patel',
    role: 'Volunteer / Ground Worker',
    desc: 'Field execution, event participation, QR canvassing',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
  }
];

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('centraladmin@politix.org');
  const [password, setPassword] = useState('politix2026');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast(`Welcome to POLITIX! Signed in successfully.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error', 'Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword('politix2026');
    setLoading(true);
    try {
      await login(demoEmail, 'politix2026');
      showToast(`Signed in as ${roleName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Quick login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="max-w-4xl mx-auto w-full mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/80 text-blue-300 text-xs font-semibold mb-4 tracking-wide">
          <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          <span>100% Fully Local Deployment • SQLite Engine • Zero Cloud Dependency</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono">
            POLITIX
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto">
          Enterprise Political Party Management, Campaign Operations, Volunteer Mobilization & Fiscal Governance System.
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Standard Login Form */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-400" />
            Internal Portal Access
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your authorized party credentials to enter your role-specific dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@politix.org"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Default demo password: <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded">politix2026</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              SQLite DB Active
            </span>
            <span>Bcrypt Hashed & Salted</span>
          </div>
        </div>

        {/* Right Side: Instant Demo Role Switcher Cards */}
        <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Role-Based Demonstration Accounts
              </h3>
              <p className="text-xs text-slate-400">
                Click any role card below to test the application's hierarchical permissions instantly:
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-900/50 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
              7 Roles Seeded
            </span>
          </div>

          <div className="space-y-2 mt-4 max-h-[460px] overflow-y-auto pr-1">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleQuickDemo(acc.email, acc.role)}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${acc.badgeColor}`}>
                      {acc.role}
                    </span>
                    <span className="text-xs font-bold text-white truncate">{acc.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{acc.desc}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{acc.email}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-600">
        POLITIX Internal Governance Platform • Local Edition v1.0.0 • No Telemetry Or External Calls
      </div>
    </div>
  );
};
