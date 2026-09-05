import type { ProgressStoreData } from '@/types/domain'
import type { UserAuthStore } from '@/types/user.auth.store'

export function useMigration(authStore: UserAuthStore) {
  return {
    async migrateProgress(): Promise<void> {
      if (!authStore.state.user || !authStore.state.isAuthenticated) {
        throw new Error('User not authenticated')
      }

      // Migrar progreso anónimo a cuenta autenticada
      const progress = loadMigrationData()
      
      try {
        await authStore.updateProfile({
          progress,
        })
      } finally {
        clearMigrationData()
      }
    },
  }
}

function loadMigrationData(): ProgressStoreData | null {
  const stored = window.localStorage.getItem('migrationProgress')
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function clearMigrationData(): void {
  window.localStorage.removeItem('migrationProgress')
}
