import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (username, password) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return api.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  },
  me: () => api.get('/auth/me'),
}

export const chatAPI = {
  sendMessage: (message, session_id) => api.post('/chat/message', { message, session_id }),
  getHistory: (session_id) => api.get(`/chat/history/${session_id}`),
  getSessions: () => api.get('/chat/sessions'),
}

export const portfolioAPI = {
  getSummary: () => api.get('/portfolio/summary'),
  getClientPortfolio: (id) => api.get(`/portfolio/client/${id}`),
}

export const clientsAPI = {
  list: (params) => api.get('/clients/', { params }),
  get: (id) => api.get(`/clients/${id}`),
  lifeEvents: () => api.get('/clients/insights/life-events'),
  revenueOpportunities: () => api.get('/clients/insights/revenue-opportunities'),
}

export const complianceAPI = {
  getAlerts: (status) => api.get('/compliance/alerts', { params: status ? { status } : {} }),
  resolveAlert: (id) => api.post(`/compliance/resolve/${id}`),
  pretradeCheck: (client_id, amount) => api.get(`/compliance/pretrade-check/${client_id}`, { params: { amount } }),
}

export default api
