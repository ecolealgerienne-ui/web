export interface User {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'user' | 'viewer'
  farmName?: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
