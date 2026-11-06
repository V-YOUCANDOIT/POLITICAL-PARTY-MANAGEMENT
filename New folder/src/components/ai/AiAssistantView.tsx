import React, { useState } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  HardDrive,
  FileText,
  AlertTriangle,
  TrendingUp,
  Cpu,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const { showToast } = useToast();
  const [taskType, setTaskType] = useState<'survey_summary' | 'overdue_tasks' | 'campaign_progress'>('survey_summary');
  const [result, setResult] = useState<string | null>(null);
  const [engine, setEngine] = useState<string>('Politix Local Heuristic Engine');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunSynthesis = async (type: 'survey_summary' | 'overdue_tasks' | 'campaign_progress') => {
    setTaskType(type);
    setLoading(true);
    setResult(null);
    try {
      const data = await apiRequest('/api/ai/local-assist', {
        method: 'POST',
        body: JSON.stringify({ task_type: type })
      });
      setResult(data.result);
      setEngine(data.engine || 'Politix Local Engine');
      showToast('Local administrative synthesis generated', 'success');
    } catch (e: any) {
      showToast(e.message || 'Synthesis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied synthesis to clipboard', 'info');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Privacy & Architecture Guardrail Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Local AI Administrative Intelligence</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  100% On-Premises
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero Cloud APIs • No external data transmission • Local heuristic and statistical aggregators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite In-Memory Runtime</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2.5">
          This module processes party databases locally on your computer to synthesize survey results in aggregate, detect overdue campaign tasks, and summarize weekly operational progress. If an optional local Ollama daemon (e.g. at <code>127.0.0.1:11434</code>) is installed on your Windows machine, Politix can pipe prompts to it without any internet connection.
        </p>
      </div>

      {/* Preset Operational Synthesizers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => handleRunSynthesis('survey_summary')}
          disabled={loading}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            taskType === 'survey_summary'
              ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-900/60 text-blue-400 flex items-center justify-center mb-2.5">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1">Synthesize Survey Aggregates</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Generate executive policy takeaways from public transit and community feedback surveys.
          </p>
        </button>

        <button
          onClick={() => handleRunSynthesis('overdue_tasks')}
          disabled={loading}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            taskType === 'overdue_tasks'
              ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-900/60 text-amber-400 flex items-center justify-center mb-2.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1">Audit Task Bottlenecks</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Scan SQLite task queue to highlight overdue permits, venue deadlines, and urgent action items.
          </p>
        </button>

        <button
          onClick={() => handleRunSynthesis('campaign_progress')}
          disabled={loading}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            taskType === 'campaign_progress'
              ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center mb-2.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1">Weekly Campaign Velocity</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Compile milestone progress, budget burn percentages, and field personnel activity into an operational digest.
          </p>
        </button>
      </div>

      {/* Synthesis Output Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Local Administrative Output
            </span>
          </div>

          <div className="flex items-center gap-2">
            {result && (
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
            <span className="text-[10px] font-mono text-slate-500">
              Engine: <strong className="text-slate-300">{engine}</strong>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Processing SQLite records locally in-memory...</p>
          </div>
        ) : result ? (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
            {result}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            Select an operational synthesizer above to generate an immediate on-premises administrative report.
          </div>
        )}
      </div>
    </div>
  );
};
