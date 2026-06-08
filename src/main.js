import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { socket, connectSocket } from './utils/socket.js'
import { useRoomStore } from './stores/room.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 初始化 Socket 监听
const roomStore = useRoomStore()
roomStore.initSocketListeners()

// 如果有保存的房间信息，自动连接
const saved = localStorage.getItem('whoisspy_currentRoom')
if (saved) {
  connectSocket()
}

app.mount('#app')
