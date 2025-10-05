import axios from 'axios'
import { toast } from 'react-hot-toast'

// Resolve API base URL. If VITE_API_URL is not an absolute http(s) URL, fallback.
const rawBase = (import.meta as any).env?.VITE_API_URL as string | undefined
const API_BASE_URL = (rawBase && /^https?:\/\//i.test(rawBase))
  ? rawBase
  : 'http://127.0.0.1:8001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes for large uploads / slow parsing
  // Do not set a global Content-Type so Axios can choose per request (e.g., FormData)
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Dev aid: log full request URL for debugging 404/402
    try {
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`
      if (import.meta.env.MODE === 'development') {
        // eslint-disable-next-line no-console
        console.debug('[API] Request:', (config.method || 'GET').toUpperCase(), fullUrl)
      }
    } catch {}
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const auth = JSON.parse(token)
        if (auth?.state?.token) {
          config.headers.Authorization = `Bearer ${auth.state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)
// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred'
    const url: string = error.config?.url || ''
    const status: number | undefined = error.response?.status

    // Suppress toasts for analytics 4xx; let pages handle inline
    if (url.startsWith('/analytics/') && status && [400, 404, 422].includes(status)) {
      return Promise.reject(error)
    }

    if (status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if ((status || 0) >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (status === 404) {
      try {
        const fullUrl = `${error.config?.baseURL || ''}${url}`
        // eslint-disable-next-line no-console
        console.debug('[API] 404:', fullUrl)
      } catch {}
      toast.error(message)
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api