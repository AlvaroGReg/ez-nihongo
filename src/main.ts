import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { testSession } from './stores/testSession'
import './style.css'

testSession.restoreSession()

const app = createApp(App)

app.use(router)

app.mount('#app')
