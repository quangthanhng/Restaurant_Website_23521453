import type { User } from '../types/user.type'

export const LocalStorageEventTarget = new EventTarget()

// Access Token
export const setAccessTokenToLS = (accessToken: string) => {
  localStorage.setItem('accessToken', accessToken)
}

export const getAccessTokenFromLS = () => {
  return localStorage.getItem('accessToken') || ''
}

// Refresh Token
export const setRefreshTokenToLS = (refreshToken: string) => {
  localStorage.setItem('refreshToken', refreshToken)
}

export const getRefreshTokenFromLS = () => {
  return localStorage.getItem('refreshToken') || ''
}

// User Profile
export const setProfileToLS = (profile: User) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}

export const getProfileFromLS = (): User | null => {
  const result = localStorage.getItem('profile')
  return result ? JSON.parse(result) : null
}

// Clear all auth data
export const clearLS = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('profile')
  const clearLSEvent = new Event('clearLS')
  LocalStorageEventTarget.dispatchEvent(clearLSEvent)
}
