import { Link } from 'react-router-dom'


export default function ProjectCard({ project }) {
  const { id, name, description, category, total_tasks, completed_tasks } = project
  const progress = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0

  
  const categoryColors = {
    General: 'bg-slate-500/20 text-slate-300',
    Engineering: 'bg-blue-500/20 text-blue-300',
    Marketing: 'bg-pink-500/20 text-pink-300',
    Design: 'bg-purple-500/20 text-purple-300',
    Research: 'bg-cyan-500/20 text-cyan-300',
    Operations: 'bg-orange-500/20 text-orange-300',
  }

  return (
    <Link
      to={`/projects/${id}`}
      className="glass-card-hover p-6 flex flex-col gap-4 animate-fade-in group"
      id={`project-card-${id}`}
    >
     
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
            {name}
          </h3>
          <span
            className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              categoryColors[category] || categoryColors.General
            }`}
          >
            {category}
          </span>
        </div>
      </div>

     
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
        {description}
      </p>

     
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{completed_tasks} of {total_tasks} tasks</span>
          <span>{progress}% done</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-xs text-slate-500">
          {total_tasks} task{total_tasks !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-brand-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          View Details →
        </span>
      </div>
    </Link>
  )
}
