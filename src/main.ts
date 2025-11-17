import { Buffer } from 'buffer'
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Polyfill para Node.js APIs en el navegador
window.global = window.global || window
window.Buffer = window.Buffer || Buffer

createApp(App).use(router).mount('#app')
