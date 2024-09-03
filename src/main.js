import { createApp } from 'vue'
import App from './App.vue'

console.log('env vars FE: ')
console.log(process.env)

createApp(App).mount('#app')
