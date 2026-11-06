import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, User } from '../../types/index.ts';
import { apiRequest } from '../../lib/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Plus,
  Calendar,
  User as UserIcon,
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreVertical,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';

interface KanbanBoardProps {
  campaignId: string;
  tasks: Task[];
  teamMembers?: { user_id: string; full_name: string; email: string; role_in_campaign?: string }[];
  onTasksChanged: () => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; badge: string }[] = [
  { id: 'To Do', label: 'To Do', color: 'border-slate-700 bg-slate-900/50', badge: 'bg-slate-800 text-slate-300' },
  { id: 'In Progress', label: 'In Progress', color: 'border-blue-900/60 bg-blue-950/20', badge: 'bg-blue-950 text-blue-300 border border-blue-800' },
  { id: 'Under Review', label: 'Under Review', color: 'border-amber-900/60 bg-amber-950/20', badge: 'bg-amber-950 text-amber-300 border border-amber-800' },
  { id: 'Completed', label: 'Completed', color: 'border-emerald-900/60 bg-emerald-950/20', badge: 'bg-emerald-950 text-emerald-300 border border-emerald-800' }
];

const PRIORITY_BADGES: Record<TaskPriority, string> = {
  Urgent: 'bg-red-950 text-red-400 border-red-800',
  High: 'bg-amber-950 text-amber-400 border-amber-800',
  Medium: 'bg-blue-950 text-blue-400 border-blue-800',
  Low: 'bg-slate-800 text-slate-400 border-slate-700'
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  campaignId,
  tasks,
  teamMembers = [],
  onTasksChanged
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = (defaultStatus: TaskStatus = 'To Do') => {
    setTitle('');
    setDescription('');
    setStatus(defaultStatus);
    setPriority('Medium');
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setAssignedToId(user?.id || '');
    setEditingTask(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.due_date || '');
    setAssignedToId(task.assigned_to_id || '');
    setIsAddModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      if (editingTask) {
        await apiRequest(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title,
            description,
            status,
            priority,
            due_date: dueDate || null,
            assigned_to_id: assignedToId || null
          })
        });
        showToast('Task updated successfully', 'success');
      } else {
        await apiRequest('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({
            campaign_id: campaignId,
            title,
            description,
            status,
            priority,
            due_date: dueDate || null,
            assigned_to_id: assignedToId || null
          })
        });
        showToast('Task added to campaign board', 'success');
      }
      setIsAddModalOpen(false);
      onTasksChanged();
    } catch (e: any) {
      showToast(e.message || 'Failed to save task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusMove = async (task: Task, nextStatus: TaskStatus) => {
    try {
      await apiRequest(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(`Moved to "${nextStatus}"`, 'info');
      onTasksChanged();
    } catch (e: any) {
      showToast(e.message || 'Failed to move task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Are you sure you want to delete task "${taskTitle}"?`)) return;
    try {
      await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
      showToast('Task deleted', 'warning');
      onTasksChanged();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete task', 'error');
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'To Do') return 'In Progress';
    if (current === 'In Progress') return 'Under Review';
    if (current === 'Under Review') return 'Completed';
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Kanban Board Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Campaign Task Board</h3>
          <p className="text-xs text-slate-400">Total {tasks.length} tasks scheduled</p>
        </div>
        <button
          onClick={() => openCreateModal('To Do')}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* 4 Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-xl border ${col.color} p-3 min-h-[450px] flex flex-col justify-between`}
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{col.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badge}`}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openCreateModal(col.id)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5">
                  {colTasks.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-lg">
                      No tasks in this lane
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const next = getNextStatus(t.status);

                      return (
                        <div
                          key={t.id}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-lg shadow-sm group transition-all"
                        >
                          {/* Priority and actions */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_BADGES[t.priority] || ''}`}>
                              {t.priority}
                            </span>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => openEditModal(t)}
                                className="p-1 text-slate-400 hover:text-blue-400 rounded transition-colors cursor-pointer"
                                title="Edit task"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(t.id, t.title)}
                                className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-white mb-1 leading-snug">{t.title}</h4>
                          {t.description && (
                            <p className="text-[11px] text-slate-400 mb-2 line-clamp-2 leading-relaxed">
                              {t.description}
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 text-slate-300 font-medium truncate max-w-[120px]">
                              <UserIcon className="w-3 h-3 text-slate-500" />
                              {t.assigned_to_name || 'Unassigned'}
                            </span>
                            {t.due_date && (
                              <span className="flex items-center gap-1 font-mono text-slate-400">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {t.due_date}
                              </span>
                            )}
                          </div>

                          {/* Quick Advance Button */}
                          {next && (
                            <button
                              onClick={() => handleQuickStatusMove(t, next)}
                              className="mt-2.5 w-full py-1 px-2 rounded bg-slate-800/80 hover:bg-blue-600/80 hover:text-white text-slate-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Advance to {next}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom Quick Add */}
              <button
                onClick={() => openCreateModal(col.id)}
                className="mt-3 w-full py-1.5 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg text-[11px] text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add task</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingTask ? 'Edit Task' : 'Create Campaign Task'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Secure municipal assembly staging permit"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Operational Instructions
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed instructions for field staff..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
