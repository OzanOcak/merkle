import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Same for all environments
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    throw error
  }
)

export default api
