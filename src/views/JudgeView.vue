<template>
  <div class="page">
    <!-- 密码验证 -->
    <div v-if="!verified" class="verify-section">
      <div class="verify-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <h2 class="verify-title">裁判验证</h2>
      <p class="verify-desc">请输入裁判密码查看身份</p>
      <input 
        type="password" 
        class="input" 
        v-model="inputPassword" 
        maxlength="4"
        placeholder="输入4位密码"
        inputmode="numeric"
        @keyup.enter="verify"
      >
      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <button class="btn btn-primary" @click="verify" style="margin-top: 16px;">
        验证
      </button>
    </div>

    <!-- 裁判面板 -->
    <div v-else class="judge-panel">
      <div class="panel-header">
        <div class="word-info">
          <div class="word-box">
            <span class="word-label">平民词</span>
            <span class="word-value civilian-word">{{ store.wordPair?.civilian }}</span>
          </div>
          <div class="word-box">
            <span class="word-label">卧底词</span>
            <span class="word-value spy-word">{{ store.wordPair?.spy }}</span>
          </div>
        </div>
      </div>

      <div class="section-title">玩家身份</div>
      <div class="players-grid">
        <div 
          v-for="player in store.players" 
          :key="player.id"
          class="player-card"
          :class="{ eliminated: player.isEliminated }"
        >
          <div class="player-header">
            <span class="player-num">{{ player.number }}号</span>
            <span class="role-tag" :class="`tag-${player.role}`">
              {{ roleNames[player.role] }}
            </span>
          </div>
          <div class="player-word">{{ player.word }}</div>
          <button 
            v-if="!player.isEliminated && player.role !== 'judge'"
            class="eliminate-btn"
            @click="eliminate(player.id)"
          >
            出局
          </button>
          <button 
            v-else-if="player.isEliminated"
            class="revive-btn"
            @click="revive(player.id)"
          >
            复活
          </button>
          <div v-else class="status-badge judge-badge">裁判</div>
        </div>
      </div>

      <div class="section-title">游戏状态</div>
      <div class="status-card">
        <div class="status-row">
          <span>存活平民</span>
          <span class="status-value civilian-color">{{ store.livingCivilians.length }}</span>
        </div>
        <div class="status-row">
          <span>存活卧底</span>
          <span class="status-value spy-color">{{ store.livingSpies.length }}</span>
        </div>
        <div class="status-row">
          <span>已出局</span>
          <span class="status-value">{{ store.eliminatedPlayers.length }}</span>
        </div>
        <div class="status-row" v-if="winner">
          <span>获胜方</span>
          <span class="status-value" :class="winner === 'civilian' ? 'civilian-color' : 'spy-color'">
            {{ winner === 'civilian' ? '平民' : '卧底' }}
          </span>
        </div>
      </div>

      <div class="judge-actions">
        <button class="btn btn-primary" @click="$router.push('/game')">
          返回游戏工具
        </button>
        <button v-if="winner" class="btn btn-success" @click="endGame">
          结束游戏
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'

const router = useRouter()
const store = useGameStore()

const verified = ref(false)
const inputPassword = ref('')
const errorMsg = ref('')

const roleNames = {
  civilian: '平民',
  spy: '卧底',
  blank: '白板',
  judge: '裁判'
}

const winner = computed(() => store.checkWinner())

function verify() {
  if (inputPassword.value === store.judgePassword) {
    verified.value = true
    errorMsg.value = ''
  } else {
    errorMsg.value = '密码错误'
  }
}

function eliminate(playerId) {
  store.eliminatePlayer(playerId)
}

function revive(playerId) {
  store.revivePlayer(playerId)
}

function endGame() {
  store.endGame()
  router.push('/')
}
</script>

<style scoped>
.verify-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px 0;
  text-align: center;
}

.verify-icon {
  color: var(--accent-secondary);
  margin-bottom: 20px;
}

.verify-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.verify-desc {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.error-text {
  color: var(--danger);
  font-size: 14px;
  margin-top: 8px;
}

.panel-header {
  margin-bottom: 24px;
}

.word-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.word-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
}

.word-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.word-value {
  font-size: 22px;
  font-weight: 700;
}

.civilian-word {
  color: var(--civilian);
}

.spy-word {
  color: var(--spy);
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.player-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  transition: all 0.2s;
}

.player-card.eliminated {
  opacity: 0.5;
  border-color: var(--danger);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.player-num {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.role-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.tag-civilian { background: rgba(59, 130, 246, 0.15); color: var(--civilian); }
.tag-spy { background: rgba(239, 68, 68, 0.15); color: var(--spy); }
.tag-blank { background: rgba(245, 158, 11, 0.15); color: var(--blank); }
.tag-judge { background: rgba(16, 185, 129, 0.15); color: var(--judge); }

.player-word {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.eliminate-btn, .revive-btn {
  width: 100%;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.eliminate-btn {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.revive-btn {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.status-badge {
  text-align: center;
  padding: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.status-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 24px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 15px;
  border-bottom: 1px solid var(--border);
}

.status-row:last-child {
  border-bottom: none;
}

.status-value {
  font-weight: 700;
}

.civilian-color { color: var(--civilian); }
.spy-color { color: var(--spy); }

.judge-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: var(--spacing-lg);
}
</style>
