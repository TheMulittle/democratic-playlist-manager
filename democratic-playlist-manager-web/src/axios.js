import axios from 'axios'
import { getToken } from './auth'

axios.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

export default axios
