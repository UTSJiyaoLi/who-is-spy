<template>
  <div class="page">
    <h2 class="page-title">加入房间</h2>

    <div class="card">
      <div class="form-group">
        <label class="form-label">邀请码</label>
        <input 
          type="text" 
          class="input" 
          v-model="roomCode" 
          placeholder="输入4位邀请码"
          maxlength="4"
          style="text-transform: uppercase; font-size: 24px; letter-spacing: 8px; text-align: center;"
          :disabled="!!route.query.room"
        >
      </div>

      <div class="form-group">
        <label class="form-label">你的昵称</label>
        <input type="text" class="input" v-model="playerName" placeholder="输入昵称" maxlength="10">
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="joinRoom" :disabled="!canJoin || isLoading">
        <span v-if="isLoading">加入中...</span>
        <span v-else>加入房间</span>
      </button>
    </div>

    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRoomStore } from '../stores/room.js'
import { connectSocket } from '../utils/socket.js'

const router = useRouter()
const route = useRoute()
const roomStore = useRoomStore()

const roomCode = ref('')
const playerName = ref('')
const isLoading = ref(false)
const error = ref('')

const canJoin = computed(() => {
  return roomCode.value.trim().length === 4 && playerName.value.trim().length > 0
})

onMounted(() => {
  const roomFromQuery = route.query.room
  if (roomFromQuery) {
    roomCode.value = String(roomFromQuery).toUpperCase()
  }
})

async function joinRoom() {
  if (!canJoin.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    connectSocket()
    await new Promise(r => setTimeout(r, 500))
    
    const res = await roomStore.joinRoom(roomCode.value.trim(), playerName.value.trim())
    if (res.success) {
      router.push('/room')
    } else {
      error.value = res.error || '加入失败'
    }
  } catch (err) {
    error.value = '连接服务器失败，请检查网络'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-weight: 500;
}

.action-buttons {
  margin-top: 24px;
}

.error-text {
  text-align: center;
  color: var(--danger);
  font-size: 14px;
  margin-top: 12px;
}
</style>
