import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { learning } from './stores/learning'
import { testSession } from './stores/testSession'
import './style.css'

learning.restore()
testSession.restoreSession()

const app = createApp(App)

app.use(router)

app.mount('#app')
