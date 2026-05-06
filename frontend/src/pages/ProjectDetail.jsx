import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProject, deleteProject, summarizeProject } from '../api'
import TaskItem from '../components/TaskItem'
import TaskForm from '../components/TaskForm'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [summarizing, setSummarizing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchProject() }, [id])

  const fetchProject = async () => {
    try {
      const res = await getProject(id)
      setProject(res.data)
    } catch (err) {
      setError('Project not found')
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async () => {
    setSummarizing(true)
    setSummary(null)
    try {
      const res = await summarizeProject(id)
      setSummary(res.data.summary)
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to generate summary. Please try again.';
      alert(errorMessage);
      setSummary(null);
    } finally {
      setSummarizing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete project "${project.name}" and all its tasks?`)) return
    setDeleting(true)
    try {
      await deleteProject(id)
      navigate('/')
    } catch (err) {
      setError('Failed to delete project')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 text-center">
          <p className="text-red-300 mb-4">{error || 'Project not found'}</p>
          <Link to="/" className="btn-primary">Back to Projects</Link>
        </div>
      </div>
    )
  }

  const total = project.total_tasks
  const done = project.completed_tasks
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  const categoryColors = {
    General: 'bg-slate-500/20 text-slate-300',
    Engineering: 'bg-blue-500/20 text-blue-300',
    Marketing: 'bg-pink-500/20 text-pink-300',
    Design: 'bg-purple-500/20 text-purple-300',
    Research: 'bg-cyan-500/20 text-cyan-300',
    Operations: 'bg-orange-500/20 text-orange-300',
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-brand-400 transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-slate-300">{project.name}</span>
      </div>

      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[project.category] || categoryColors.General}`}>{project.category}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">{project.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/edit/${id}`} className="btn-secondary text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit
            </Link>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger text-sm">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{total}</p>
            <p className="text-xs text-slate-500 mt-1">Total Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{done}</p>
            <p className="text-xs text-slate-500 mt-1">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-400">{progress}%</p>
            <p className="text-xs text-slate-500 mt-1">Completion</p>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-4">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* AI Summary */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            AI Summary
          </h2>
          <button onClick={handleSummarize} disabled={summarizing} className="btn-primary text-sm">
            {summarizing ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Summarize Project</>
            )}
          </button>
        </div>
        {summary && (
          <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 animate-slide-up">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        )}
        {!summary && !summarizing && (
          <p className="text-slate-500 text-sm">Click "Summarize Project" to get an AI-powered analysis of your project progress.</p>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Tasks</h2>
        </div>
        <TaskForm projectId={id} onTaskCreated={fetchProject} />
        {project.tasks && project.tasks.length > 0 ? (
          <div className="space-y-3">
            {project.tasks.map((task) => (
              <TaskItem key={task.id} task={task} onUpdate={fetchProject} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-500">No tasks yet. Add your first task above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
