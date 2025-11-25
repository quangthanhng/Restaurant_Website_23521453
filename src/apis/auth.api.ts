import type { AuthResponse } from '../types/user.type'
import type { LoginFormData, RegisterFormData } from '../types/auth.type'
import http from '../utils/http'

const authApi = {
  login: (body: LoginFormData) => {
    return http.post<AuthResponse>('/users/login', body)
  },

  register: (body: Omit<RegisterFormData, 'confirmPassword'>) => {
    return http.post<AuthResponse>('/users/register', body)
  },

  logout: () => {
    return http.post('/users/logout')
  }
}

export default authApi
