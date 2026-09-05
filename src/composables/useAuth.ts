import { useRoute } from 'vue-router'
import type { AuthUser } from '@/types/domain'

export function useAuth(): {
  user: AuthUser | null
  isAuthenticated: boolean
  login(email: string, password: string): Promise<void>
  logout(): void
} {
  const route = useRoute()

  return {
    user: null,
    isAuthenticated: false,
    async login(email: string, password: string): Promise<void> {
      // Implementación futura con API
    },
    logout(): void {
      this.user = null
      this.isAuthenticated = false
      // Redirigir a login o onboarding
      if (this.isAuthenticated === false) {
        return
      }
    },
  }
}
