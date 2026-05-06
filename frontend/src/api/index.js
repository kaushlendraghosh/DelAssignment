import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})



export const getProjects = () => api.get('/projects')

export const getProject = (id) => api.get(`/projects/${id}`)

export const createProject = (data) => api.post('/projects', data)

export const updateProject = (id, data) => api.put(`/projects/${id}`, data)

export const deleteProject = (id) => api.delete(`/projects/${id}`)



export const createTask = (projectId, data) =>
  api.post(`/projects/${projectId}/tasks`, data)

export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data)

export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`)


export const summarizeProject = (projectId) =>
  api.post(`/ai/summarize/${projectId}`)

export default api
