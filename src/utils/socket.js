import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '')

export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
})

// 自动连接（如果之前有房间信息）
const savedRoom = localStorage.getItem('whoisspy_currentRoom')
if (savedRoom) {
  const { roomId, playerId } = JSON.parse(savedRoom)
  socket.connect()
}

export function connectSocket() {
  if (!socket.connected) {
    socket.connect()
  }
}

export function disconnectSocket() {
  socket.disconnect()
}

export function emit(event, data) {
  return new Promise((resolve) => {
    socket.emit(event, data, (response) => {
      resolve(response)
    })
  })
}
