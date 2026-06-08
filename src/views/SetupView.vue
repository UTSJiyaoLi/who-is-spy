<template>
  <div class="page">
    <h2 class="page-title">游戏设置</h2>

    <div class="section-title">玩家配置</div>
    <div class="card">
      <div class="form-row">
        <label class="form-label">总人数</label>
        <div class="stepper">
          <button class="stepper-btn" @click="decrement('playerCount')" :disabled="store.playerCount <= 3">−</button>
          <span class="stepper-value">{{ store.playerCount }}人</span>
          <button class="stepper-btn" @click="increment('playerCount')" :disabled="store.playerCount >= 20">+</button>
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">卧底人数</label>
        <div class="stepper">
          <button class="stepper-btn" @click="decrement('spyCount')" :disabled="store.spyCount <= 1">−</button>
          <span class="stepper-value">{{ store.spyCount }}人</span>
          <button class="stepper-btn" @click="increment('spyCount')" :disabled="store.spyCount >= maxSpies">+</button>
        </div>
      </div>

      <div class="hint-text">
        平民 {{ store.civilianCount }} 人 · 卧底 {{ store.spyCount }} 人
        <span v-if="store.hasBlank"> · 白板 1 人</span>
        <span v-if="store.hasJudge"> · 裁判 1 人</span>
      </div>

      <div class="divider"></div>

      <div class="switch-row">
        <span class="switch-label">启用白板</span>
        <label class="switch">
          <input type="checkbox" v-model="store.hasBlank">
          <span class="slider"></span>
        </label>
      </div>
      <p class="switch-hint">白板没有词语，需猜出两个词才能获胜</p>

      <div class="switch-row">
        <span class="switch-label">启用裁判</span>
        <label class="switch">
          <input type="checkbox" v-model="store.hasJudge">
          <span class="slider"></span>
        </label>
      </div>
      <p class="switch-hint">裁判知道所有人身份，负责主持游戏</p>

      <div v-if="store.hasJudge" class="judge-password">
        <label class="form-label">裁判密码（4位数字）</label>
        <input 
          type="password" 
          class="input" 
          v-model="store.judgePassword" 
          maxlength="4"
          placeholder="设置裁判密码"
          inputmode="numeric"
        >
      </div>
    </div>

    <div class="section-title">词语选择</div>
    <div class="card">
      <div class="form-row">
        <label class="form-label">词库分类</label>
        <select class="select" v-model="store.selectedCategory">
          <option value="">全部随机</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="word-preview" v-if="previewPair">
        <div class="word-tag civilian-tag">{{ previewPair.civilian }}</div>
        <span class="vs-text">VS</span>
        <div class="word-tag spy-tag">{{ previewPair.spy }}</div>
      </div>
      <button class="refresh-btn" @click="refreshPreview">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
        </svg>
        换一组
      </button>
    </div>

    <div class="section-title">发言计时</div>
    <div class="card">
      <div class="timer-options">
        <button 
          v-for="t in [30, 60, 90, 120]" 
          :key="t"
          class="timer-btn"
          :class="{ active: store.timerSeconds === t }"
          @click="store.timerSeconds = t"
        >
          {{ t }}秒
        </button>
      </div>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="startGame" :disabled="!store.isConfigValid">
        生成身份
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { categories, getRandomWordPair } from '../data/wordBank.js'

const router = useRouter()
const store = useGameStore()

const maxSpies = computed(() => Math.max(1, Math.floor((store.playerCount - (store.hasBlank ? 1 : 0) - (store.hasJudge ? 1 : 0)) / 2)))

const previewPair = ref(getRandomWordPair(store.selectedCategory || null, store.customWords))

function increment(key) {
  if (key === 'playerCount' && store.playerCount < 20) store.playerCount++
  if (key === 'spyCount' && store.spyCount < maxSpies.value) store.spyCount++
}

function decrement(key) {
  if (key === 'playerCount' && store.playerCount > 3) store.playerCount--
  if (key === 'spyCount' && store.spyCount > 1) store.spyCount--
}

function refreshPreview() {
  previewPair.value = getRandomWordPair(store.selectedCategory || null, store.customWords)
}

function startGame() {
  store.generateGame()
  router.push('/identity')
}
</script>

<style scoped>
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stepper-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-value {
  font-size: 16px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.hint-text {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 16px 0;
}

.switch-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: -12px;
  margin-bottom: 12px;
  padding-left: 0;
}

.judge-password {
  margin-top: 16px;
}

.judge-password .form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.word-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
}

.word-tag {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
}

.civilian-tag {
  background: rgba(59, 130, 246, 0.15);
  color: var(--civilian);
}

.spy-tag {
  background: rgba(239, 68, 68, 0.15);
  color: var(--spy);
}

.vs-text {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 700;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: none;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.refresh-btn:active {
  background: var(--bg-tertiary);
}

.timer-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.timer-btn {
  padding: 12px 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.timer-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.action-buttons {
  margin-top: 32px;
  padding-bottom: var(--spacing-lg);
}
</style>
