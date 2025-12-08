import type { AuthResponse, User } from '../types/user.type'
import type { LoginFormData, RegisterFormData } from '../types/auth.type'
import http from '../utils/http'

interface UpdateProfileData {
  username?: string
  phoneNumber?: string
  address?: string
  dateOfBirth?: string
}

interface UpdateProfileResponse {
  message: string
  statusCode: number
  metadata: User
}

interface ForgotPasswordData {
  email: string
}

interface VerifyOtpData {
  email: string
  otp: string
}

interface ResetPasswordData {
  email: string
  otp: string
  password: string
  newPassword: string
}

interface MessageResponse {
  message: string
  statusCode: number
}

const authApi = {
  login: (body: LoginFormData) => {
    return http.post<AuthResponse>('/users/login', body)
  },

  register: (body: Omit<RegisterFormData, 'confirmPassword'>) => {
    return http.post<AuthResponse>('/users/register', body)
  },

  logout: () => {
    return http.post('/users/logout')
  },

  updateProfile: (data: UpdateProfileData) => {
    return http.patch<UpdateProfileResponse>('/users/edit-profile', data)
  },

  getProfile: () => {
    return http.get<UpdateProfileResponse>('/users/profile')
  },

  forgotPassword: (data: ForgotPasswordData) => {
    return http.post<MessageResponse>('/users/forgot-password', data)
  },

  verifyOtp: (data: VerifyOtpData) => {
    return http.post<MessageResponse>('/users/verify-otp', data)
  },

  resetPassword: (data: ResetPasswordData) => {
    return http.patch<MessageResponse>('/users/reset-password', data)
  },

  // Google OAuth - redirect to backend
  getGoogleAuthUrl: () => {
    return `${import.meta.env.VITE_API_URL}/users/auth/google`
  }
}

export default authApi
