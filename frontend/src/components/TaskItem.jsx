import { useState } from 'react'
import { updateTask, deleteTask } from '../api'

export default function TaskItem({ task, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const statusOptions = ['To Do', 'In Progress', 'Done']
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done'

  const statusBadgeClass = {
    'To Do': 'badge-todo',
    'In Progress': 'badge-progress',
    Done: 'badge-done',
  }

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true)
    try {
      await updateTask(task.id, { status: newStatus })
      onUpdate()
    } catch (err) {
      console.error('Failed to update task:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    setIsDeleting(true)
    try {
      await deleteTask(task.id)
      onUpdate()
    } catch (err) {
      console.error('Failed to delete task:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in ${isOverdue ? 'border-red-500/30 bg-red-500/5' : ''} ${isDeleting ? 'opacity-50 scale-95' : ''} transition-all duration-200`} id={`task-${task.id}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={`font-medium ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</h4>
          {isOverdue && <span className="badge-overdue text-[10px]">OVERDUE</span>}
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
          <span>{task.assigned_user || 'Unassigned'}</span>
          {task.due_date && <span className={isOverdue ? 'text-red-400' : ''}>{formatDate(task.due_date)}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <select value={task.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={isUpdating} className={`${statusBadgeClass[task.status]} cursor-pointer border-0 text-xs font-semibold rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/50`}>
          {statusOptions.map((s) => (<option key={s} value={s} className="bg-surface-800 text-white">{s}</option>))}
        </select>
        <button onClick={handleDelete} disabled={isDeleting} className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete task">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  )
}
