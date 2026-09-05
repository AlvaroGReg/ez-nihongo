import type { AuthUser } from './domain'

interface UserAuthState {
  user: AuthUser | null
  token?: string
  refreshToken?: string
  isAuthenticated: boolean
}

export interface UserAuthStore {
  state: UserAuthState
  login(email: string, password: string): Promise<void>
  logout(): void
  register(email: string, password: string): Promise<void>
  updateProfile(data: Partial<AuthUser>): Promise<void>
  exportData(): Promise<any>
  deleteAccount(): Promise<void>
}

export function createUserAuthStore(): UserAuthStore {
  const state: UserAuthState = {
    user: null,
    token: undefined,
    refreshToken: undefined,
    isAuthenticated: false,
  }

  return {
    state,
    async login(email: string, password: string): Promise<void> {
      // Implementación con JWT
      // const response = await api.post('/api/v1/auth/login', { email, password })
      // if (response.data.user) {
      //   state.user = response.data.user
      //   state.token = response.data.accessToken
      //   state.refreshToken = response.data.refreshToken
      //   state.isAuthenticated = true
      // }
    },
    logout(): void {
      state.user = null
      state.token = undefined
      state.refreshToken = undefined
      state.isAuthenticated = false
    },
    async register(email: string, password: string): Promise<void> {
      // Implementación de registro con JWT + refresh rotation
      // const response = await api.post('/api/v1/auth/register', { email, password })
      // if (response.data.user) {
      //   state.user = response.data.user
      //   state.token = response.data.accessToken
      //   state.refreshToken = response.data.refreshToken
      //   state.isAuthenticated = true
      // }
    },
    async updateProfile(data: Partial<AuthUser>): Promise<void> {
      await api?.patch('/api/v1/users/me', data)
    },
    async exportData(): Promise<any> {
      return await api?.get('/api/v1/users/me/export')
    },
    async deleteAccount(): Promise<void> {
      await api?.delete('/api/v1/users/me')
    },
  }
}

export const userAuthStore = createUserAuthStore()
