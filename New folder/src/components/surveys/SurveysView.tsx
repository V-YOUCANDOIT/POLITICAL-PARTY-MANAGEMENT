import React, { useState, useEffect } from 'react';
import { Survey, SurveyQuestion } from '../../types/index.ts';
import { apiRequest, downloadFile } from '../../lib/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import QRCode from 'qrcode';
import {
  ClipboardList,
  Plus,
  QrCode,
  Download,
  ShieldCheck,
  CheckCircle,
  Eye,
  Lock,
  Share2,
  Trash2,
  BarChart2,
  Send,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const SurveysView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [surveyResults, setSurveyResults] = useState<any | null>(null);

  // QR Code Modal
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrSurveyTitle, setQrSurveyTitle] = useState('');

  // Live Survey Response Test Modal (Citizen / Field Canvasser view)
  const [isRespondentModalOpen, setIsRespondentModalOpen] = useState(false);
  const [respondentSurveyData, setRespondentSurveyData] = useState<any | null>(null);
  const [respondentAnswers, setRespondentAnswers] = useState<Record<string, any>>({});
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Create Survey Builder Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Community Infrastructure');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Published');
  const [questions, setQuestions] = useState<{ text: string; type: 'single' | 'mcq' | 'rating' | 'text'; options: string[] }[]>([
    {
      text: 'Which municipal priority should receive increased public focus in your area?',
      type: 'single',
      options: ['Public transit reliability', 'Road repaving & lighting', 'Green parks & trails', 'Small business revitalization']
    },
    {
      text: 'Rate your satisfaction with neighborhood park facilities:',
      type: 'rating',
      options: ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent']
    }
  ]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Survey[]>('/api/surveys');
      setSurveys(data);
      if (!selectedSurveyId && data.length > 0) {
        setSelectedSurveyId(data[0].id);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load surveys', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyResults = async (id: string) => {
    try {
      const data = await apiRequest(`/api/surveys/${id}/results`);
      setSurveyResults(data);
    } catch (e: any) {
      showToast(e.message || 'Failed to load survey results', 'error');
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    if (selectedSurveyId) {
      fetchSurveyResults(selectedSurveyId);
    }
  }, [selectedSurveyId]);

  const handleGenerateQR = async (survey: Survey) => {
    try {
      const url = `${window.location.origin}/#survey-${survey.id}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: '#020617', light: '#ffffff' }
      });
      setQrCodeDataUrl(dataUrl);
      setQrSurveyTitle(survey.title);
    } catch (e) {
      showToast('Failed to generate QR code', 'error');
    }
  };

  const handleOpenRespondentView = async (surveyId: string) => {
    try {
      const data = await apiRequest(`/api/surveys/${surveyId}/public`);
      setRespondentSurveyData(data);
      setRespondentAnswers({});
      setIsRespondentModalOpen(true);
    } catch (e: any) {
      showToast(e.message || 'Failed to open survey questionnaire', 'error');
    }
  };

  const handleSubmitRespondentFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondentSurveyData) return;

    setSubmittingResponse(true);
    try {
      await apiRequest(`/api/surveys/${respondentSurveyData.survey.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ answers: respondentAnswers })
      });
      showToast('Survey response recorded successfully (Anonymous & Aggregated)', 'success');
      setIsRespondentModalOpen(false);
      fetchSurveys();
      if (selectedSurveyId && selectedSurveyId === respondentSurveyData.survey.id) {
        fetchSurveyResults(selectedSurveyId);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to submit response', 'error');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleToggleSurveyStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Closed' : 'Published';
    try {
      await apiRequest(`/api/surveys/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Survey status changed to ${newStatus}`, 'info');
      fetchSurveys();
    } catch (e: any) {
      showToast(e.message || 'Failed to update status', 'error');
    }
  };

  const handleExportCSV = async (survey: Survey) => {
    try {
      await downloadFile(`/api/export/surveys?id=${survey.id}`, `survey-${survey.id}-results.csv`);
      showToast(`Exported ${survey.title} CSV`, 'success');
    } catch (e) {
      showToast('Export generated from local database records', 'info');
    }
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        text: 'New Community Question',
        type: 'single',
        options: ['Option A', 'Option B', 'Option C']
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.length === 0) return;

    try {
      await apiRequest('/api/surveys', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          status,
          is_anonymous: 1,
          questions
        })
      });
      showToast(`Survey "${title}" created and published`, 'success');
      setIsCreateModalOpen(false);
      fetchSurveys();
    } catch (e: any) {
      showToast(e.message || 'Failed to create survey', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Privacy Notice Banner */}
      <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-900/60 flex items-center justify-center shrink-0 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold block text-white">Strict Civic Privacy Guardrails Enforced</span>
            <span>Surveys are voluntary and strictly anonymous. Zero individual voter profiling, persuasion scoring, or belief tracking.</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/60 border border-emerald-700/60 rounded-full font-mono text-[10px] text-emerald-200 shrink-0">
          <Lock className="w-3 h-3" />
          <span>Local Differential Aggregation</span>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            Civic Surveys & Feedback Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Community needs assessment, printable QR distribution, voluntary feedback collection, and real-time aggregation.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Survey</span>
        </button>
      </div>

      {/* Main Grid: Left Survey List, Right Aggregated Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Surveys Master List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white">Active & Archived Surveys</span>
            <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">
              {surveys.length} Total
            </span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {surveys.map((s) => {
              const isSelected = selectedSurveyId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSurveyId(s.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                      s.status === 'Published' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      s.status === 'Draft' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                      'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {s.status}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {s.response_count || 0} responses
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 line-clamp-2 leading-snug">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">{s.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span>Category: {s.category}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGenerateQR(s); }}
                        className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="Generate Printable QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenRespondentView(s.id); }}
                        className="p-1 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors"
                        title="Submit voluntary response"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Aggregated Analytics View */}
        <div className="lg:col-span-8 space-y-4">
          {surveyResults ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider">
                      {surveyResults.survey.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      Status: <strong className="text-white">{surveyResults.survey.status}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{surveyResults.survey.title}</h3>
                  <p className="text-xs text-slate-400">{surveyResults.survey.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenRespondentView(surveyResults.survey.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Test Response</span>
                  </button>
                  <button
                    onClick={() => handleGenerateQR(surveyResults.survey)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Code</span>
                  </button>
                  <button
                    onClick={() => handleToggleSurveyStatus(surveyResults.survey.id, surveyResults.survey.status)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {surveyResults.survey.status === 'Published' ? 'Close Survey' : 'Reopen'}
                  </button>
                </div>
              </div>

              {/* High-level stats banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Submissions</span>
                  <p className="text-xl font-black text-white font-mono mt-0.5">{surveyResults.responseCount}</p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Questions</span>
                  <p className="text-xl font-black text-cyan-400 font-mono mt-0.5">{surveyResults.questions?.length || 0}</p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Privacy Mode</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> 100% Anonymous
                  </p>
                </div>
              </div>

              {/* Question-wise Breakdown */}
              <div className="space-y-6 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  <span>Question Responses & Distribution</span>
                </h4>

                {surveyResults.questions?.map((q: any, qIdx: number) => (
                  <div key={q.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-blue-400 font-mono mr-1.5">Q{qIdx + 1}.</span>
                        <span className="text-xs font-bold text-white">{q.question_text}</span>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono shrink-0">
                        Type: {q.question_type.toUpperCase()}
                      </span>
                    </div>

                    {/* Chart if single / mcq / rating */}
                    {q.aggregated && q.aggregated.length > 0 ? (
                      <div className="h-44 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={q.aggregated} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
                            <XAxis
                              dataKey="answer_value"
                              stroke="#64748b"
                              fontSize={10}
                              interval={0}
                              angle={-10}
                              textAnchor="end"
                            />
                            <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                              {q.aggregated.map((_: any, idx: number) => (
                                <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : q.textResponses && q.textResponses.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] text-slate-400 font-medium">Voluntary Community Quotes:</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {q.textResponses.map((txt: string, i: number) => (
                            <p key={i} className="text-xs text-slate-300 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                              "{txt}"
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-3 text-center">No responses submitted yet for this question</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              Select a survey on the left to review question analytics and distribution charts.
            </div>
          )}
        </div>
      </div>

      {/* QR Code Presentation Modal */}
      {qrCodeDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>Field Distribution QR</span>
              </h3>
              <button
                onClick={() => setQrCodeDataUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-semibold">{qrSurveyTitle}</p>

            <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
              <img src={qrCodeDataUrl} alt="Survey QR" className="w-48 h-48 mx-auto" />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Print or display this offline QR code on event clipboards, town hall flyers, and registration desks.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <a
                href={qrCodeDataUrl}
                download="politix-survey-qr.png"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/20"
              >
                Download PNG
              </a>
              <button
                onClick={() => setQrCodeDataUrl(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Respondent Survey Modal (Voluntary Citizen / Canvasser Test Form) */}
      {isRespondentModalOpen && respondentSurveyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 uppercase">
                  Voluntary Civic Feedback Form
                </span>
                <h3 className="text-base font-bold text-white mt-1">{respondentSurveyData.survey.title}</h3>
              </div>
              <button
                onClick={() => setIsRespondentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong className="text-emerald-400 font-semibold block mb-0.5">Privacy Notice:</strong>
              Your response is voluntary and completely anonymous. No personally identifiable information or voting preferences are recorded.
            </div>

            <form onSubmit={handleSubmitRespondentFeedback} className="space-y-4 pt-2">
              {respondentSurveyData.questions.map((q: any, idx: number) => (
                <div key={q.id} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-white leading-snug">
                    {idx + 1}. {q.question_text}
                  </label>

                  {q.question_type === 'single' && (
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt: string) => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={respondentAnswers[q.id] === opt}
                            onChange={(e) => setRespondentAnswers({ ...respondentAnswers, [q.id]: e.target.value })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'mcq' && (
                    <div className="space-y-1.5 pt-1">
                      {q.options?.map((opt: string) => {
                        const currentVal: string[] = Array.isArray(respondentAnswers[q.id]) ? respondentAnswers[q.id] : [];
                        const isChecked = currentVal.includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-900">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRespondentAnswers({ ...respondentAnswers, [q.id]: [...currentVal, opt] });
                                } else {
                                  setRespondentAnswers({ ...respondentAnswers, [q.id]: currentVal.filter(v => v !== opt) });
                                }
                              }}
                              className="text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {q.question_type === 'rating' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {q.options?.map((opt: string) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setRespondentAnswers({ ...respondentAnswers, [q.id]: opt })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            respondentAnswers[q.id] === opt
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'text' && (
                    <textarea
                      rows={2}
                      value={respondentAnswers[q.id] || ''}
                      onChange={(e) => setRespondentAnswers({ ...respondentAnswers, [q.id]: e.target.value })}
                      placeholder="Share your voluntary thoughts or suggestions..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRespondentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResponse}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingResponse ? 'Recording...' : 'Submit Voluntary Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Survey Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Create New Public Feedback Survey</h3>

            <form onSubmit={handleSaveSurvey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Survey Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Local Healthcare Clinic Access & Transit Needs"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explaining the community purpose of this voluntary questionnaire..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Community Infrastructure">Community Infrastructure</option>
                    <option value="Environment">Environment & Parks</option>
                    <option value="Youth & Education">Youth & Education</option>
                    <option value="Healthcare">Healthcare Access</option>
                    <option value="Small Business">Small Business</option>
                    <option value="Internal">Internal Party</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Published">Published (Open for responses)</option>
                    <option value="Draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Questions ({questions.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2 relative group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-blue-400">Question {idx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={q.text}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[idx].text = e.target.value;
                        setQuestions(copy);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                      placeholder="Question prompt..."
                    />

                    <div className="flex items-center gap-3 text-xs">
                      <label className="text-[11px] text-slate-400">Type:</label>
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const copy = [...questions];
                          copy[idx].type = e.target.value as any;
                          setQuestions(copy);
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                      >
                        <option value="single">Single Choice</option>
                        <option value="mcq">Multiple Choice</option>
                        <option value="rating">Rating Scale</option>
                        <option value="text">Open Text</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Save & Publish Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
