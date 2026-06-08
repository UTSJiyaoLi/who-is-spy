<template>
  <div class="page identity-page">
    <div v-if="!store.gamePhase || store.gamePhase === 'setup'" class="empty-state">
      <p>请先配置游戏</p>
      <button class="btn btn-primary" @click="$router.push('/setup')" style="margin-top: 16px;">
        去设置
      </button>
    </div>

    <template v-else>
      <!-- 准备阶段 -->
      <div v-if="currentPhase === 'prepare'" class="phase-content">
        <div class="phase-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <h2 class="phase-title">准备查看身份</h2>
        <p class="phase-desc">
          共 {{ store.playerCount }} 位玩家<br>
          请按顺序传递手机，每人查看自己的身份
        </p>
        <button class="btn btn-primary" @click="currentPhase = 'viewing'">
          开始查看
        </button>
      </div>

      <!-- 查看身份 -->
      <div v-else-if="currentPhase === 'viewing'" class="phase-content">
        <div class="player-indicator">
          第 <span class="player-number">{{ store.players[store.currentPlayerIndex]?.number }}</span> 号玩家
        </div>

        <div class="identity-card" 
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
                <div class="role-badge" :class="currentPlayer?.role">
                  {{ roleName }}
                </div>
                <div class="word-display" v-if="currentPlayer?.role !== 'judge'">
                  {{ currentPlayer?.word }}
                </div>
                <div class="judge-info" v-else>
                  <p>你是裁判，请进入裁判面板</p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <p class="progress-text">{{ store.currentPlayerIndex + 1 }} / {{ store.players.length }}</p>

        <div class="identity-actions">
          <button v-if="store.currentPlayerIndex > 0" class="btn btn-secondary" @click="prevPlayer">
            上一个
          </button>
          <button 
            v-if="store.currentPlayerIndex < store.players.length - 1" 
            class="btn btn-primary" 
            @click="nextPlayer"
          >
            下一个
          </button>
          <button v-else class="btn btn-success" @click="finishIdentity">
            查看完毕
          </button>
        </div>
      </div>

      <!-- 完成 -->
      <div v-else-if="currentPhase === 'done'" class="phase-content">
        <div class="phase-icon success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 class="phase-title">身份分配完成</h2>
        <p class="phase-desc">
          所有人已查看身份<br>
          游戏即将开始
        </p>

        <div class="role-summary">
          <div class="summary-item">
            <span class="dot civilian-dot"></span>
            平民 {{ store.civilianCount }} 人
          </div>
          <div class="summary-item">
            <span class="dot spy-dot"></span>
            卧底 {{ store.spyCount }} 人
          </div>
          <div class="summary-item" v-if="store.hasBlank">
            <span class="dot blank-dot"></span>
            白板 1 人
          </div>
          <div class="summary-item" v-if="store.hasJudge">
            <span class="dot judge-dot"></span>
            裁判 1 人
          </div>
        </div>

        <div class="action-buttons">
          <button v-if="store.hasJudge" class="btn btn-secondary" @click="$router.push('/judge')">
            裁判入口
          </button>
          <button class="btn btn-primary" @click="enterGame">
            开始游戏
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'

const router = useRouter()
const store = useGameStore()

const currentPhase = ref('prepare')

onMounted(() => {
  if (store.gamePhase === 'playing') {
    currentPhase.value = 'done'
  } else if (store.gamePhase === 'identity') {
    currentPhase.value = 'prepare'
  }
})
const showIdentity = ref(false)

const currentPlayer = computed(() => store.players[store.currentPlayerIndex])

const roleName = computed(() => {
  const names = {
    civilian: '平民',
    spy: '卧底',
    blank: '白板',
    judge: '裁判'
  }
  return names[currentPlayer.value?.role] || ''
})

const progressPercent = computed(() => {
  return ((store.currentPlayerIndex + 1) / store.players.length) * 100
})

function nextPlayer() {
  showIdentity.value = false
  store.nextPlayer()
}

function prevPlayer() {
  showIdentity.value = false
  store.currentPlayerIndex--
}

function finishIdentity() {
  store.startGame()
  currentPhase.value = 'done'
}

function enterGame() {
  router.push('/game')
}
</script>

<style scoped>
.identity-page {
  justify-content: center;
}

.phase-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 0;
}

.phase-icon {
  color: var(--accent-secondary);
  margin-bottom: 20px;
}

.success-icon {
  color: var(--success);
}

.phase-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.phase-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 32px;
}

.player-indicator {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.player-number {
  font-size: 36px;
  font-weight: 800;
  color: var(--accent-secondary);
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
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.identity-card:active {
  border-color: var(--accent-primary);
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

.role-badge.judge {
  background: var(--judge);
}

.word-display {
  font-size: 42px;
  font-weight: 800;
  color: white;
}

.judge-info {
  font-size: 16px;
  color: white;
  opacity: 0.9;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--accent-gradient);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.identity-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.identity-actions .btn {
  flex: 1;
}

.role-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-card);
  padding: 8px 16px;
  border-radius: var(--radius-md);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.civilian-dot { background: var(--civilian); }
.spy-dot { background: var(--spy); }
.blank-dot { background: var(--blank); }
.judge-dot { background: var(--judge); }

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 280px;
}
</style>
