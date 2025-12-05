export interface User {
  _id: string
  id?: string
  username: string
  email: string
  avatar?: string
  address?: string
  phoneNumber?: string
  dateOfBirth?: string
  isAdmin: boolean
  loginMethod?: string
  createdAt?: string
  updatedAt?: string
}

// Response mới từ API
export interface AuthResponse {
  message: string
  statusCode: number
  metadata: {
    accessToken: string
    refreshToken?: string
    user: User
  }
}

// Response cũ (để backward compatible)
export interface LegacyAuthResponse {
  code: number
  message: string
  data: {
    accessToken: string
    refreshToken: string
    user: User
  }
}

export interface ErrorResponse {
  code?: number
  statusCode?: number
  message: string
}
