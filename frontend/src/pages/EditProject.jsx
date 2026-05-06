import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProject, updateProject } from '../api'

const categories = ['General', 'Engineering', 'Marketing', 'Design', 'Research', 'Operations']

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '', category: 'General' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await getProject(id)
        setForm({ name: res.data.name, description: res.data.description, category: res.data.category })
      } catch (err) {
        setApiError('Project not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 3) e.name = 'Name must be at least 3 characters'
    else if (/^\d+$/.test(form.name.trim())) e.name = 'Name cannot be only numbers'
    
    if (!form.description.trim() || form.description.trim().length < 10) e.description = 'Description must be at least 10 characters'
    else if (/^\d+$/.test(form.description.trim())) e.description = 'Description cannot be only numbers'
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setApiError('')
    try {
      await updateProject(id, form)
      navigate(`/projects/${id}`)
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to update project')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-container max-w-2xl animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-brand-400 transition-colors">Projects</Link>
        <span>/</span>
        <Link to={`/projects/${id}`} className="hover:text-brand-400 transition-colors">{form.name || 'Project'}</Link>
        <span>/</span>
        <span className="text-slate-300">Edit</span>
      </div>

      <div className="glass-card p-8">
        <h1 className="section-title mb-6">Edit Project</h1>
        {apiError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">{apiError}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Project Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`input-field ${errors.name ? 'border-red-500/50 focus:ring-red-500/50' : ''}`} />
            {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={`input-field resize-none ${errors.description ? 'border-red-500/50 focus:ring-red-500/50' : ''}`} />
            {errors.description && <p className="text-red-400 text-xs mt-1.5">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save Changes'}</button>
            <Link to={`/projects/${id}`} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
