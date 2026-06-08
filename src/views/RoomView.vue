<template>
  <div class="page room-page">
    <!-- 连接状态提示 -->
    <div v-if="roomStore.connectionError" class="connection-error">
      {{ roomStore.connectionError }}
      <button class="btn btn-secondary" @click="goHome" style="margin-top: 12px;">返回首页</button>
    </div>

    <template v-else-if="!roomStore.roomId">
      <div class="empty-state">
        <p>房间信息已丢失</p>
        <button class="btn btn-primary" @click="goHome" style="margin-top: 16px;">返回首页</button>
      </div>
    </template>

    <template v-else>
      <!-- 邀请码（创建者显示） -->
      <div v-if="roomStore.isHost" class="invite-section">
        <p class="invite-label">邀请好友输入</p>
        <div class="invite-code" @click="copyCode">
          <span class="code-text">{{ roomStore.roomId }}</span>
          <span class="copy-hint">{{ copied ? '已复制' : '点击复制' }}</span>
        </div>
        <p class="invite-sub">已有 {{ roomStore.players.length }} / {{ roomStore.config.playerCount || '?' }} 位玩家</p>
      </div>

      <div v-else class="room-info">
        <span class="room-badge">房间 {{ roomStore.roomId }}</span>
        <span class="host-name" v-if="roomStore.isHost">你是裁判</span>
      </div>

      <!-- 玩家列表 -->
      <div class="section-title">房间成员</div>
      <div class="players-list">
        <!-- 裁判 -->
        <div class="member-card judge-card">
          <div class="member-avatar judge-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="member-info">
            <span class="member-name">{{ roomStore.playerName }}（你）</span>
            <span class="member-role">裁判</span>
          </div>
        </div>

        <!-- 玩家 -->
        <div 
          v-for="player in roomStore.players" 
          :key="player.id"
          class="member-card"
        >
          <div class="member-avatar player-avatar">{{ player.name?.[0] || '?' }}</div>
          <div class="member-info">
            <span class="member-name">{{ player.name }}</span>
            <span class="member-number">{{ player.id }}号</span>
          </div>
        </div>

        <!-- 空位 -->
        <div 
          v-for="n in emptySlots" 
          :key="'empty-'+n"
          class="member-card empty-card"
        >
          <div class="member-avatar empty-avatar">?</div>
          <span class="empty-text">等待加入...</span>
        </div>
      </div>

      <!-- 等待中操作 -->
      <template v-if="roomStore.phase === 'waiting' || !roomStore.phase">
        <div v-if="roomStore.isHost" class="host-actions">
          <p class="wait-hint">所有玩家加入后点击开始</p>
          <button 
            class="btn btn-primary" 
            @click="startGame"
            :disabled="roomStore.players.length === 0 || isStarting"
          >
            <span v-if="isStarting">分配中...</span>
            <span v-else>开始游戏</span>
          </button>
          <button class="btn btn-secondary" @click="dissolveRoom" style="margin-top: 10px;">
            解散房间
          </button>
        </div>
        <div v-else class="player-wait">
          <div class="pulse-dot"></div>
          <p>等待裁判开始游戏...</p>
        </div>
      </template>

      <!-- 身份已分配 -->
      <template v-if="roomStore.phase === 'identity' || roomStore.phase === 'playing' || roomStore.phase === 'ended'">
        <div class="game-started-actions">
          <button v-if="roomStore.isHost" class="btn btn-primary" @click="goJudge">
            进入裁判面板
          </button>
          <button v-else-if="!hasSeenIdentity" class="btn btn-primary" @click="goIdentity">
            查看我的身份
          </button>
          <button v-else class="btn btn-secondary" @click="goGame">
            进入游戏
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '../stores/room.js'
import { disconnectSocket } from '../utils/socket.js'

const router = useRouter()
const roomStore = useRoomStore()

const copied = ref(false)
const isStarting = ref(false)
const hasSeenIdentity = ref(false)

const emptySlots = computed(() => {
  const total = roomStore.config.playerCount || 0
  const current = roomStore.players.length
  return Math.max(0, total - current)
})

async function copyCode() {
  try {
    await navigator.clipboard.writeText(roomStore.roomId)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch {
    // 复制失败，手动选择
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

async function startGame() {
  isStarting.value = true
  const res = await roomStore.startGame()
  isStarting.value = false
  if (!res.success) {
    alert(res.error || '开始失败')
  }
}

function dissolveRoom() {
  if (confirm('确定要解散房间吗？')) {
    disconnectSocket()
    roomStore.resetAll()
    router.push('/')
  }
}

function goHome() {
  roomStore.resetAll()
  router.push('/')
}

function goIdentity() {
  hasSeenIdentity.value = true
  roomStore.confirmIdentity()
  router.push('/identity')
}

function goJudge() {
  router.push('/judge')
}

function goGame() {
  router.push('/game')
}
</script>

<style scoped>
.room-page {
  padding-top: calc(var(--safe-top) + 16px);
}

.connection-error {
  text-align: center;
  padding: 40px 20px;
  color: var(--danger);
}

.invite-section {
  text-align: center;
  margin-bottom: 24px;
}

.invite-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.invite-code {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 40px;
  background: var(--bg-card);
  border: 2px dashed var(--accent-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
}

.invite-code:active {
  background: var(--bg-tertiary);
}

.code-text {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 8px;
  color: var(--accent-secondary);
}

.copy-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.invite-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 10px;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.room-badge {
  padding: 6px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.host-name {
  font-size: 14px;
  color: var(--judge);
  font-weight: 600;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.judge-card {
  border-color: var(--judge);
  background: rgba(16, 185, 129, 0.05);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.judge-avatar {
  background: rgba(16, 185, 129, 0.15);
  color: var(--judge);
}

.player-avatar {
  background: var(--accent-primary);
  color: white;
}

.empty-avatar {
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.member-name {
  font-size: 15px;
  font-weight: 600;
}

.member-role {
  font-size: 12px;
  color: var(--judge);
  font-weight: 600;
}

.member-number {
  font-size: 12px;
  color: var(--text-muted);
}

.empty-card {
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
}

.host-actions {
  text-align: center;
}

.wait-hint {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.player-wait {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  color: var(--text-secondary);
}

.pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-primary);
  animation: pulse 1.5s ease-in-out infinite;
}

.game-started-actions {
  margin-top: 8px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
</style>
