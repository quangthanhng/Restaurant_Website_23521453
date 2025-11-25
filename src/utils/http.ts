import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessTokenFromLS, setAccessTokenToLS, setRefreshTokenToLS, clearLS } from './auth'

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
          if (data.data) {
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
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
