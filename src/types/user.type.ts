export interface User {
  _id: string
  username: string
  email: string
  avatar: string
  address: string
  phoneNumber: string
  dateOfBirth: string
  isAdmin: boolean
  loginMethod: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  code: number
  message: string
  data: {
    accessToken: string
    refreshToken: string
    user: User
  }
}

export interface ErrorResponse {
  code: number
  message: string
}
