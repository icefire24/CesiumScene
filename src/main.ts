import { createApp } from 'vue'
import App from './App.vue'

import 'cesium/Build/Cesium/Widgets/widgets.css'
import store from '@/store'
import router from './router'

let app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')
