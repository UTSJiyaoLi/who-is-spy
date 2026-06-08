<template>
  <div class="page identity-page">
    <div v-if="!roomStore.myIdentity" class="empty-state">
      <p>身份还未分配</p>
      <button class="btn btn-primary" @click="$router.push('/room')" style="margin-top: 16px;">
        返回房间
      </button>
    </div>

    <template v-else>
      <div class="identity-header">
        <span class="player-label">你的身份</span>
      </div>

      <div 
        class="identity-card"
        @touchstart="showIdentity = true"
        @touchend="showIdentity = false"
        @mousedown="showIdentity = true"
        @mouseup="showIdentity = false"
        @mouseleave="showIdentity = false"
      >
        <div class="identity-mask" :class="{ revealed: showIdentity }">
          <template v-if="!showIdentity">
            <div class="mask-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <p class="mask-text">按住查看身份</p>
            <p class="mask-hint">松手后立即隐藏</p>
          </template>
          <template v-else>
            <div class="identity-reveal fade-in">
              <div class="role-badge" :class="roomStore.myIdentity.role">
                {{ roomStore.getRoleName(roomStore.myIdentity.role) }}
              </div>
              <div class="word-display">
                {{ roomStore.myIdentity.word }}
              </div>
              <p class="word-hint">
                {{ roomStore.myIdentity.role === 'spy' ? '你是卧底，不要暴露！' 
                   : roomStore.myIdentity.role === 'blank' ? '你是白板，根据描述猜词' 
                   : '你是平民，找出卧底！' }}
              </p>
            </div>
          </template>
        </div>
      </div>

      <div class="identity-footer">
        <button class="btn btn-primary" @click="done">
          我记住了
        </button>
        <p class="footer-hint">记住后点击按钮返回</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '../stores/room.js'

const router = useRouter()
const roomStore = useRoomStore()

const showIdentity = ref(false)

function done() {
  roomStore.confirmIdentity()
  router.push('/room')
}
</script>

<style scoped>
.identity-page {
  justify-content: center;
}

.identity-header {
  text-align: center;
  margin-bottom: 24px;
}

.player-label {
  font-size: 18px;
  color: var(--text-secondary);
}

.identity-card {
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  margin: 0 auto 24px;
  position: relative;
  overflow: hidden;
}

.identity-mask {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 24px;
  transition: all 0.3s ease;
}

.identity-mask.revealed {
  background: var(--accent-gradient);
}

.mask-icon {
  color: var(--text-muted);
  margin-bottom: 16px;
}

.mask-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
}

.mask-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}

.identity-reveal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.role-badge {
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.role-badge.civilian {
  background: var(--civilian);
}

.role-badge.spy {
  background: var(--spy);
}

.role-badge.blank {
  background: var(--blank);
}

.word-display {
  font-size: 42px;
  font-weight: 800;
  color: white;
}

.word-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.identity-footer {
  text-align: center;
}

.footer-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 10px;
}
</style>
