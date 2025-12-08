/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode } from 'react'
import type { User } from '../types/user.type'
import { getAccessTokenFromLS, getProfileFromLS, getAdminAuthenticatedFromLS } from '../utils/auth'

interface AppContextType {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  isAdminAuthenticated: boolean
  setIsAdminAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  reset: () => void
}

const initialAppContext: AppContextType = {
  isAuthenticated: Boolean(getAccessTokenFromLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  isAdminAuthenticated: getAdminAuthenticatedFromLS(),
  setIsAdminAuthenticated: () => null,
  reset: () => null
}

export const AppContext = createContext<AppContextType>(initialAppContext)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAppContext.isAuthenticated)
  const [profile, setProfile] = useState<User | null>(initialAppContext.profile)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(initialAppContext.isAdminAuthenticated)

  const reset = () => {
    setIsAuthenticated(false)
    setProfile(null)
    setIsAdminAuthenticated(false)
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        reset
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
