import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from '@/stores'
// import second from './views/黑马头条案例模板/index.vue'
import './styles/main.scss'
import 'vant/es/toast/style'
import './styles/main.scss'
import 'virtual:svg-icons-register'
import 'vant/es/dialog/style'
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
