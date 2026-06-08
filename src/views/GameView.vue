<template>
  <div class="page">
    <div v-if="store.gamePhase !== 'playing' && store.gamePhase !== 'ended'" class="empty-state">
      <p>游戏尚未开始</p>
      <button class="btn btn-primary" @click="$router.push('/setup')" style="margin-top: 16px;">
        去配置
      </button>
    </div>

    <template v-else>
      <!-- 标签页切换 -->
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-btn"
          :class="{ active: currentTab === tab.key }"
          @click="currentTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 发言顺序 -->
      <div v-if="currentTab === 'order'" class="tab-content">
        <div class="section-title">发言顺序</div>
        <div class="order-list">
          <div 
            v-for="(playerId, index) in store.speakingOrder" 
            :key="playerId"
            class="order-item"
            :class="{ eliminated: isEliminated(playerId) }"
          >
            <span class="order-num">{{ index + 1 }}</span>
            <span class="order-player">{{ playerId }}号玩家</span>
            <span v-if="isEliminated(playerId)" class="eliminated-mark">已出局</span>
          </div>
        </div>
        <button class="btn btn-secondary" @click="reshuffleOrder" style="margin-top: 16px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          重新排序
        </button>
      </div>

      <!-- 计时器 -->
      <div v-if="currentTab === 'timer'" class="tab-content">
        <div class="timer-display">
          <div class="timer-circle" :class="{ warning: remainingTime <= 10 && isRunning, running: isRunning }">
            <span class="timer-value">{{ formatTime(remainingTime) }}</span>
          </div>
        </div>

        <div class="timer-presets">
          <button 
            v-for="t in [30, 60, 90, 120]" 
            :key="t"
            class="preset-btn"
            :class="{ active: timerDuration === t }"
            @click="setTimer(t)"
          >
            {{ t }}秒
          </button>
        </div>

        <div class="timer-controls">
          <button v-if="!isRunning" class="btn btn-primary" @click="startTimer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            开始
          </button>
          <template v-else>
            <button class="btn btn-secondary" @click="pauseTimer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
              暂停
            </button>
            <button class="btn btn-danger" @click="resetTimer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              重置
            </button>
          </template>
        </div>
      </div>

      <!-- 投票 -->
      <div v-if="currentTab === 'vote'" class="tab-content">
        <div class="section-title">第 {{ voteRound }} 轮投票</div>
        <p class="vote-hint">为每位玩家记录得票数，确认后得票最多者出局</p>
        
        <div class="vote-players">
          <div 
            v-for="player in votablePlayers" 
            :key="player.id"
            class="vote-player-card"
            :class="{ eliminated: player.isEliminated }"
          >
            <div class="vote-player-info">
              <span class="vote-num">{{ player.number }}号</span>
              <span v-if="player.isEliminated" class="vote-status-badge">已出局</span>
            </div>
            <div v-if="!player.isEliminated" class="vote-counter">
              <button class="counter-btn" @click="decrementVote(player.id)">−</button>
              <span class="counter-value">{{ currentVotes[player.id] || 0 }}</span>
              <button class="counter-btn" @click="incrementVote(player.id)">+</button>
            </div>
          </div>
        </div>

        <div v-if="hasVotes" class="vote-summary">
          <div class="summary-line">
            <span>最高得票：</span>
            <span class="summary-highlight">{{ maxVotePlayer }}号 ({{ maxVoteCount }}票)</span>
          </div>
        </div>

        <div class="vote-actions-row">
          <button class="btn btn-secondary" @click="resetVotes">清空</button>
          <button class="btn btn-danger" @click="confirmRoundVote" :disabled="!hasVotes">确认投票</button>
        </div>

        <div v-if="store.voteRecords.length > 0" class="vote-history">
          <div class="section-title">投票记录</div>
          <div v-for="(record, idx) in store.voteRecords.slice().reverse()" :key="idx" class="vote-record">
            <span class="record-round">第{{ record.round }}轮</span>
            <span class="record-detail">{{ formatVote(record.votes) }}</span>
          </div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div v-if="store.hasJudge" class="judge-quick">
        <button class="btn btn-secondary" @click="$router.push('/judge')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          裁判面板
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { shuffleArray } from '../utils/shuffle.js'

const router = useRouter()
const store = useGameStore()

const currentTab = ref('order')
const tabs = [
  { key: 'order', label: '发言顺序' },
  { key: 'timer', label: '计时器' },
  { key: 'vote', label: '投票' }
]

// 计时器
const timerDuration = ref(store.timerSeconds)
const remainingTime = ref(store.timerSeconds)
const isRunning = ref(false)
let timerInterval = null

// 投票
const currentVotes = reactive({})
const voteRound = ref(1)

const votablePlayers = computed(() => store.players)

const hasVotes = computed(() => {
  return Object.values(currentVotes).some(v => v > 0)
})

const maxVoteCount = computed(() => {
  return Math.max(0, ...Object.values(currentVotes))
})

const maxVotePlayer = computed(() => {
  const entries = Object.entries(currentVotes)
  if (entries.length === 0) return null
  const max = entries.reduce((a, b) => a[1] > b[1] ? a : b)
  return max[0]
})

function isEliminated(playerId) {
  return store.eliminatedPlayers.includes(playerId)
}

function reshuffleOrder() {
  const playablePlayers = store.players.filter(p => p.role !== 'judge' && !p.isEliminated).map(p => p.id)
  store.speakingOrder = shuffleArray(playablePlayers)
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function setTimer(seconds) {
  timerDuration.value = seconds
  remainingTime.value = seconds
  isRunning.value = false
  clearInterval(timerInterval)
}

function startTimer() {
  if (remainingTime.value <= 0) remainingTime.value = timerDuration.value
  isRunning.value = true
  timerInterval = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      pauseTimer()
    }
  }, 1000)
}

function pauseTimer() {
  isRunning.value = false
  clearInterval(timerInterval)
}

function resetTimer() {
  pauseTimer()
  remainingTime.value = timerDuration.value
}

function incrementVote(playerId) {
  currentVotes[playerId] = (currentVotes[playerId] || 0) + 1
}

function decrementVote(playerId) {
  if (currentVotes[playerId] > 0) {
    currentVotes[playerId]--
  }
}

function resetVotes() {
  Object.keys(currentVotes).forEach(k => delete currentVotes[k])
}

function confirmRoundVote() {
  if (!maxVotePlayer.value) return
  
  const votes = { ...currentVotes }
  store.eliminatePlayer(Number(maxVotePlayer.value))
  store.addVoteRecord(voteRound.value, votes)
  voteRound.value++
  resetVotes()
}

function formatVote(votes) {
  const sorted = Object.entries(votes)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
  return sorted.map(([id, count]) => `${id}号:${count}票`).join(' ')
}

onUnmounted(() => {
  clearInterval(timerInterval)
})
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--accent-primary);
  color: white;
}

.tab-content {
  flex: 1;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.order-item.eliminated {
  opacity: 0.4;
}

.order-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-primary);
  color: white;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.order-player {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.eliminated-mark {
  font-size: 12px;
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.timer-display {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.timer-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 4px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.timer-circle.running {
  border-color: var(--accent-primary);
}

.timer-circle.warning {
  border-color: var(--danger);
  animation: pulse 1s infinite;
}

.timer-value {
  font-size: 48px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
}

.timer-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.preset-btn {
  padding: 12px 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.preset-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.timer-controls {
  display: flex;
  gap: 12px;
}

.timer-controls .btn {
  flex: 1;
}

.vote-hint {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.vote-players {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.vote-player-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.vote-player-card.eliminated {
  opacity: 0.4;
}

.vote-player-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vote-num {
  font-size: 16px;
  font-weight: 600;
}

.vote-status-badge {
  font-size: 11px;
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.vote-counter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.counter-btn:active {
  background: var(--accent-primary);
}

.counter-value {
  font-size: 18px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.vote-summary {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 16px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}

.summary-highlight {
  font-weight: 700;
  color: var(--danger);
}

.vote-actions-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.vote-actions-row .btn {
  flex: 1;
}

.vote-history {
  margin-top: 8px;
}

.vote-record {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.record-round {
  color: var(--text-secondary);
  font-weight: 500;
}

.record-detail {
  color: var(--text-muted);
  font-size: 13px;
}

.judge-quick {
  margin-top: auto;
  padding-top: 20px;
  padding-bottom: var(--spacing-lg);
}
</style>
