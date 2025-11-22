'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, AuthState } from '@/lib/types/user'
import { authConfig, mockUser } from '@/lib/auth/config'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Initialisation au chargement
  useEffect(() => {
    initAuth()
  }, [])

  async function initAuth() {
    try {
      if (!authConfig.enabled) {
        // Mode DEV: Utiliser l'utilisateur mock
        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        })
        return
      }

      // Mode PROD: Vérifier le token JWT
      const token = getStoredToken()
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return
      }

      // TODO: Vérifier le token avec Keycloak et récupérer l'utilisateur
      // Pour l'instant, juste décoder le token localement
      const user = await fetchUserFromToken(token)
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  async function login(email: string, password: string) {
    try {
      if (!authConfig.enabled) {
        // Mode DEV: Login automatique avec utilisateur mock
        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        })
        router.push(authConfig.defaultRedirectAfterLogin)
        return
      }

      // Mode PROD: Authentification avec Keycloak
      // TODO: Implémenter l'authentification Keycloak
      // const { token, refreshToken } = await authenticateWithKeycloak(email, password)
      // storeTokens(token, refreshToken)
      // const user = await fetchUserFromToken(token)

      // Pour l'instant, placeholder
      throw new Error('Authentification Keycloak non implémentée')
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }

  function logout() {
    if (!authConfig.enabled) {
      // Mode DEV: Juste réinitialiser l'état
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })
      return
    }

    // Mode PROD: Déconnexion Keycloak
    clearStoredTokens()
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })

    // TODO: Appeler l'endpoint de déconnexion Keycloak
    router.push(authConfig.loginRoute)
  }

  async function refreshUser() {
    if (!authConfig.enabled) {
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      })
      return
    }

    // TODO: Rafraîchir les données utilisateur depuis Keycloak
    const token = getStoredToken()
    if (token) {
      const user = await fetchUserFromToken(token)
      setAuthState(prev => ({ ...prev, user }))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
  }
  return context
}

// Fonctions utilitaires pour la gestion des tokens
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

function storeTokens(token: string, refreshToken: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
  localStorage.setItem('refresh_token', refreshToken)
}

function clearStoredTokens() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
}

async function fetchUserFromToken(token: string): Promise<User> {
  // TODO: Implémenter la récupération de l'utilisateur depuis le token JWT
  // Pour l'instant, retourner un utilisateur mock
  return mockUser
}
