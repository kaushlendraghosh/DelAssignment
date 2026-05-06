import { useState } from 'react'
import { createTask } from '../api'

export default function TaskForm({ projectId, onTaskCreated }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', assigned_user: '', status: 'To Do', due_date: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    if (/^\d+$/.test(form.title.trim())) { setError('Title cannot be only numbers'); return }
    if (form.assigned_user.trim() && /[^A-Za-z\s\-']/.test(form.assigned_user)) {
      setError('Assigned To must contain only letters, spaces, hyphens, and apostrophes');
      return;
    }
    if (!form.due_date) {
      setError('Due Date is required');
      return;
    }
    setError('')
    setIsSubmitting(true)
    try {
      const payload = { ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : null }
      await createTask(projectId, payload)
      setForm({ title: '', assigned_user: '', status: 'To Do', due_date: '' })
      setIsOpen(false)
      onTaskCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-secondary w-full sm:w-auto">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Task
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4 animate-slide-up">
      <h3 className="text-lg font-semibold text-white">New Task</h3>
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Title *</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Task title" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Assigned To</label>
          <input type="text" value={form.assigned_user} onChange={(e) => setForm({ ...form, assigned_user: e.target.value })} className="input-field" placeholder="Team member" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field">
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Due Date</label>
          <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="input-field" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
        <button type="button" onClick={() => { setIsOpen(false); setError('') }} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
