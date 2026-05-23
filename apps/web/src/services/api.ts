import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sentinel_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sentinel_token')
      localStorage.removeItem('sentinel_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  signup: (data: { email: string; password: string; role_name: string }) =>
    api.post('/auth/signup', data),
  me: () => api.get('/auth/me'),
}

// ─── Playbooks ─────────────────────────────────────────────────────────────
export const playbookApi = {
  list: () => api.get('/playbooks/'),
  get: (id: number) => api.get(`/playbooks/${id}`),
  create: (data: any) => api.post('/playbooks/', data),
  update: (id: number, data: any) => api.put(`/playbooks/${id}`, data),
  delete: (id: number) => api.delete(`/playbooks/${id}`),
  generate: (prompt: string) => api.post('/playbooks/generate', { prompt }),
}

// ─── Scenarios ─────────────────────────────────────────────────────────────
export const scenarioApi = {
  list: () => api.get('/scenarios/'),
  get: (id: number) => api.get(`/scenarios/${id}`),
  trigger: (data: any) => api.post('/scenarios/', data),
  update: (id: number, data: any) => api.put(`/scenarios/${id}`, data),
}

// ─── Clients ───────────────────────────────────────────────────────────────
export const clientApi = {
  list: () => api.get('/clients/'),
  get: (id: number) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients/', data),
}

// ─── Portfolios ────────────────────────────────────────────────────────────
export const portfolioApi = {
  list: () => api.get('/portfolios/'),
  get: (id: number) => api.get(`/portfolios/${id}`),
  create: (data: any) => api.post('/portfolios/', data),
}

// ─── Approvals ─────────────────────────────────────────────────────────────
export const approvalApi = {
  pending: () => api.get('/approvals/pending'),
  action: (id: number, action: string, comments?: string) =>
    api.post(`/approvals/${id}/action`, { action, comments }),
}
