export interface User {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'user' | 'viewer'
  farmId?: string
  farmName?: string
  avatar?: string
  isFirstLogin?: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
