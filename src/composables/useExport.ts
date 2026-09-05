import type { UserAuthStore } from '@/types/user.auth.store'

export function useExport(authStore: UserAuthStore) {
  return {
    async exportUserData(): Promise<any> {
      if (!authStore.state.user) {
        throw new Error('User not authenticated')
      }
      const data = await authStore.exportData()
      // Crear archivo JSON y descargar
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
  }
}
