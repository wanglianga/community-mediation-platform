import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('mediation_user')
  if (user) {
    const parsed = JSON.parse(user)
    config.headers['X-User-Id'] = parsed.id
    config.headers['X-User-Role'] = parsed.role
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api
