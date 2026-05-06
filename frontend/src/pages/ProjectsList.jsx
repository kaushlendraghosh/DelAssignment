import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../api'
import ProjectCard from '../components/ProjectCard'

export default function ProjectsList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await getProjects()
      setProjects(res.data)
    } catch (err) {
      setError('Failed to load projects. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <button onClick={() => { setLoading(true); setError(null); fetchProjects() }} className="btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/create" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
          <p className="text-slate-400 mb-6">Create your first project to get started with TeamBoard.</p>
          <Link to="/create" className="btn-primary">Create First Project</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
