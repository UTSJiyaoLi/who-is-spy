<template>
  <div class="page home-page">
    <div class="hero">
      <div class="hero-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect width="80" height="80" rx="20" fill="url(#heroGrad)"/>
          <path d="M28 32c0-8.837 7.163-16 16-16s16 7.163 16 16v8c0 8.837-7.163 16-16 16s-16-7.163-16-16v-8z" stroke="white" stroke-width="3" fill="none"/>
          <circle cx="36" cy="38" r="3" fill="white"/>
          <circle cx="44" cy="38" r="3" fill="white"/>
          <path d="M38 46c0 1.105.895 2 2 2s2-.895 2-2" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <text x="40" y="70" text-anchor="middle" fill="white" font-size="10" font-weight="bold">?</text>
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="80" y2="80">
              <stop offset="0%" stop-color="#7c3aed"/>
              <stop offset="100%" stop-color="#a855f7"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="hero-title">谁是卧底</h1>
      <p class="hero-subtitle">聚会游戏必备助手</p>
    </div>

    <div class="menu-grid">
      <button class="menu-card menu-primary" @click="startNewGame">
        <div class="menu-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <span class="menu-label">开始游戏</span>
        <span class="menu-desc">快速配置，马上开局</span>
      </button>

      <button class="menu-card" @click="$router.push('/words')">
        <div class="menu-icon menu-icon-secondary">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <span class="menu-label">词库管理</span>
        <span class="menu-desc">管理游戏词语</span>
      </button>

      <button class="menu-card" @click="$router.push('/history')">
        <div class="menu-icon menu-icon-secondary">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <span class="menu-label">历史记录</span>
        <span class="menu-desc">查看过往对局</span>
      </button>

      <button class="menu-card" @click="showRules = true">
        <div class="menu-icon menu-icon-secondary">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <span class="menu-label">游戏规则</span>
        <span class="menu-desc">玩法说明</span>
      </button>
    </div>

    <!-- 规则弹窗 -->
    <div v-if="showRules" class="modal-overlay" @click="showRules = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">游戏规则</h3>
        <div class="rules-content">
          <p><strong>1. 身份分配</strong></p>
          <p>每人获得一个词语，大部分人拿到相同的<strong>平民词</strong>，少数人拿到不同的<strong>卧底词</strong>，还可能存在拿到空白词的<strong>白板</strong>。</p>
          
          <p><strong>2. 轮流描述</strong></p>
          <p>每人轮流用一句话描述自己的词语，不能直接说出词语本身。</p>
          
          <p><strong>3. 投票淘汰</strong></p>
          <p>每轮描述结束后，大家投票选出最像卧底的人。得票最多者出局。</p>
          
          <p><strong>4. 胜负判定</strong></p>
          <p>卧底全部出局则平民获胜；卧底存活人数≥平民则卧底获胜；白板猜出两个词则白板获胜。</p>
        </div>
        <button class="btn btn-primary" @click="showRules = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'

const router = useRouter()
const store = useGameStore()
const showRules = ref(false)

function startNewGame() {
  store.resetGame()
  router.push('/setup')
}
</script>

<style scoped>
.home-page {
  padding-top: calc(var(--safe-top) + 32px);
}

.hero {
  text-align: center;
  margin-bottom: 40px;
}

.hero-icon {
  margin-bottom: 16px;
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.hero-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 4px;
}

.menu-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  color: inherit;
}

.menu-card:active {
  transform: scale(0.96);
  background: var(--bg-tertiary);
}

.menu-primary {
  grid-column: span 2;
  flex-direction: row;
  gap: 16px;
  padding: 28px 24px;
  background: var(--accent-gradient);
}

.menu-primary .menu-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.menu-primary .menu-label {
  color: white;
  font-size: 20px;
}

.menu-primary .menu-desc {
  color: rgba(255, 255, 255, 0.8);
}

.menu-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: var(--accent-secondary);
}

.menu-icon-secondary {
  background: rgba(124, 58, 237, 0.1);
}

.menu-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.menu-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 20px;
}

.rules-content {
  margin-bottom: 20px;
  line-height: 1.7;
}

.rules-content p {
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.rules-content strong {
  color: var(--text-primary);
}
</style>
