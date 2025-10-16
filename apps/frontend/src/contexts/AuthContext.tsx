import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../lib/api'

interface User {
  id: string
  email: string
  fullName: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string, hotelName: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })
      const { token: newToken, user: newUser } = response.data
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      setToken(newToken)
      setUser(newUser)
    } catch (error: any) {
      // Extract helpful error messages from backend or network
      const data = error?.response?.data
      const messageFromZod = Array.isArray(data?.formErrors) && data.formErrors.length > 0
        ? data.formErrors[0]
        : (() => {
            const fields = data?.fieldErrors
            if (fields && typeof fields === 'object') {
              const first = Object.values(fields).find((val: any) => Array.isArray(val) && val.length > 0)
              if (first) return first[0]
            }
            return undefined
          })()
      const msg = data?.error || messageFromZod || error?.message || 'Login failed'
      throw new Error(msg)
    }
  }

  const signup = async (email: string, password: string, fullName: string, hotelName: string) => {
    try {
      // Trim inputs to avoid validation failures on whitespace
      const response = await authAPI.signup({
        email: email?.trim(),
        password,
        fullName: fullName?.trim(),
        hotelName: hotelName?.trim()
      })
      const { token: newToken, user: newUser } = response.data
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      setToken(newToken)
      setUser(newUser)
    } catch (error: any) {
      const data = error?.response?.data
      const messageFromZod = Array.isArray(data?.formErrors) && data.formErrors.length > 0
        ? data.formErrors[0]
        : (() => {
            const fields = data?.fieldErrors
            if (fields && typeof fields === 'object') {
              const first = Object.values(fields).find((val: any) => Array.isArray(val) && val.length > 0)
              if (first) return first[0]
            }
            return undefined
          })()
      const msg = data?.error || messageFromZod || error?.message || 'Signup failed'
      throw new Error(msg)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}





