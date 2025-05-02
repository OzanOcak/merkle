// src/renderer/src/api.ts
import axios from 'axios'

// Single endpoint for both dev and prod
const api = axios.create({
  baseURL: 'http://localhost:3001', // Same everywhere
  timeout: 10000
})

export default api
