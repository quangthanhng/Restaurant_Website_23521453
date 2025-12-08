import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessTokenFromLS, setAccessTokenToLS, setRefreshTokenToLS, clearLS } from './auth'

// Flag to prevent multiple redirects
let isRedirecting = false

class Http {
  instance: AxiosInstance
  private accessToken: string

  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        if (url === '/users/login' || url === '/users/register') {
          const data = response.data
          // Handle new API response structure (metadata)
          if (data.metadata) {
            this.accessToken = data.metadata.accessToken
            setAccessTokenToLS(data.metadata.accessToken)
            if (data.metadata.refreshToken) {
              setRefreshTokenToLS(data.metadata.refreshToken)
            }
          }
          // Handle legacy API response structure (data)
          else if (data.data) {
            this.accessToken = data.data.accessToken
            setAccessTokenToLS(data.data.accessToken)
            setRefreshTokenToLS(data.data.refreshToken)
          }
        } else if (url === '/users/logout') {
          this.accessToken = ''
          clearLS()
        }
        return response
      },
      (error: AxiosError) => {
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
          // Clear local storage and reset access token
          this.accessToken = ''
          clearLS()

          // Redirect to login page (prevent multiple redirects)
          if (!isRedirecting) {
            isRedirecting = true
            // Use window.location for redirect to ensure full page reload and context reset
            const currentPath = window.location.pathname
            // Don't redirect if already on login page
            if (currentPath !== '/login') {
              window.location.href = '/login'
            }
            // Reset flag after a short delay
            setTimeout(() => {
              isRedirecting = false
            }, 1000)
          }
        }
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
