<template>
  <div class="page">
    <h2 class="page-title">历史记录</h2>

    <div v-if="store.gameHistory.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <p>还没有游戏记录</p>
      <p class="empty-sub">完成一局游戏后会自动保存</p>
    </div>

    <div v-else class="history-list">
      <div 
        v-for="record in store.gameHistory" 
        :key="record.id"
        class="history-card"
      >
        <div class="history-header">
          <span class="history-date">{{ record.date }}</span>
          <span class="history-winner" :class="record.winner">
            {{ record.winner === 'civilian' ? '平民胜' : '卧底胜' }}
          </span>
        </div>
        
        <div class="history-words">
          <div class="history-word">
            <span class="word-label-sm">平民</span>
            <span class="word-text civilian-text">{{ record.wordPair.civilian }}</span>
          </div>
          <div class="history-word">
            <span class="word-label-sm">卧底</span>
            <span class="word-text spy-text">{{ record.wordPair.spy }}</span>
          </div>
        </div>

        <div class="history-config">
          <span>{{ record.playerCount }}人局</span>
          <span>·</span>
          <span>{{ record.spyCount }}个卧底</span>
          <span v-if="record.hasBlank">· 有白板</span>
          <span v-if="record.hasJudge">· 有裁判</span>
        </div>
      </div>

      <button class="btn btn-secondary" @click="store.clearHistory" style="margin-top: 16px;">
        清空记录
      </button>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/game.js'

const store = useGameStore()
</script>

<style scoped>
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-date {
  font-size: 13px;
  color: var(--text-muted);
}

.history-winner {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.history-winner.civilian {
  background: rgba(59, 130, 246, 0.15);
  color: var(--civilian);
}

.history-winner.spy {
  background: rgba(239, 68, 68, 0.15);
  color: var(--spy);
}

.history-words {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.history-word {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.word-label-sm {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.word-text {
  font-size: 16px;
  font-weight: 700;
}

.civilian-text {
  color: var(--civilian);
}

.spy-text {
  color: var(--spy);
}

.history-config {
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.empty-sub {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
