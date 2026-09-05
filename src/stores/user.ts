import { reactive } from 'vue'
import type { AuthUser } from '@/types/domain'

interface UserState {
  user: AuthUser | null
  isAuthenticated: boolean
}

export interface UserStore {
  state: UserState
  login(email: string, password: string): Promise<void>
  logout(): void
  register(email: string, password: string): Promise<void>
  updateProfile(data: Partial<AuthUser>): Promise<void>
}

function createUserStore(): UserStore {
  const state = reactive<UserState>({
    user: null,
    isAuthenticated: false,
  })

  return {
    state,
    async login(email: string, password: string): Promise<void> {
      // Implementación futura con API
      // const response = await api.post('/api/v1/auth/login', { email, password })
      // if (response.data.user) {
      //   state.user = response.data.user
      //   state.isAuthenticated = true
      // }
    },
    logout(): void {
      state.user = null
      state.isAuthenticated = false
    },
    async register(email: string, password: string): Promise<void> {
      // Implementación futura con API
      // const response = await api.post('/api/v1/auth/register', { email, password })
      // if (response.data.user) {
      //   state.user = response.data.user
      //   state.isAuthenticated = true
      // }
    },
    async updateProfile(data: Partial<AuthUser>): Promise<void> {
      // Implementación futura con API
      // await api.patch('/api/v1/users/me', data)
    },
  }
}

export const userStore = createUserStore()
