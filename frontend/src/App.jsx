import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProjectsList from './pages/ProjectsList'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import EditProject from './pages/EditProject'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ProjectsList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/edit/:id" element={<EditProject />} />
        </Routes>
      </main>
      <footer className="text-center py-6 text-slate-600 text-sm border-t border-white/5">
        TeamBoard &copy; {new Date().getFullYear()} — AI-Powered Task Management
      </footer>
    </div>
  )
}

export default App
