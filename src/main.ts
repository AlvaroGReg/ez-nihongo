import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { learning } from './stores/learning'
import { testSession } from './stores/testSession'
import { userAuthStore } from './types/user.auth.store'
import './style.css'

learning.restore()
testSession.restoreSession()
userAuthStore.state.token = localStorage.getItem('authToken') ?? undefined
userAuthStore.state.refreshToken = localStorage.getItem('refreshToken') ?? undefined
userAuthStore.state.isAuthenticated = !!userAuthStore.state.token

const app = createApp(App)

app.use(router)

app.mount('#app')
