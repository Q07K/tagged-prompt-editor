// import './main.css'
// import './assets/main.css'
import './assets/css/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
