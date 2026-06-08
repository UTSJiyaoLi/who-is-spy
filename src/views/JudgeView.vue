<template>
  <div class="page">
    <div v-if="!roomStore.isHost" class="empty-state">
      <p>只有裁判可以查看此页面</p>
      <button class="btn btn-primary" @click="$router.push('/room')" style="margin-top: 16px;">
        返回房间
      </button>
    </div>

    <template v-else>
      <div class="panel-header">
        <div class="word-source-tag" v-if="roomStore.isCustomWord">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          自定义词语
        </div>
        <div class="word-info">
          <div class="word-box">
            <span class="word-label">平民词</span>
            <span class="word-value civilian-word">{{ roomStore.wordPair?.civilian }}</span>
          </div>
          <div class="word-box">
            <span class="word-label">卧底词</span>
            <span class="word-value spy-word">{{ roomStore.wordPair?.spy }}</span>
          </div>
        </div>
      </div>

      <div class="section-title">玩家身份（{{ roomStore.livingPlayers.length }}人存活）</div>
      <div class="players-grid">
        <div 
          v-for="player in roomStore.judgeInfo || []" 
          :key="player.id"
          class="player-card"
          :class="{ eliminated: player.isEliminated }"
        >
          <div class="player-header">
            <div class="player-info">
              <span class="player-num">{{ player.id }}号</span>
              <span class="player-name-sm">{{ player.name }}</span>
            </div>
            <span class="role-tag" :class="`tag-${player.role}`">
              {{ roomStore.getRoleName(player.role) }}
            </span>
          </div>
          <div class="player-word">{{ player.word }}</div>
          <div class="player-actions">
            <button 
              v-if="!player.isEliminated"
              class="eliminate-btn"
              @click="eliminate(player.id)"
            >
              标记出局
            </button>
            <button 
              v-else
              class="revive-btn"
              @click="revive(player.id)"
            >
              复活
            </button>
          </div>
        </div>
      </div>

      <div class="section-title">快捷操作</div>
      <div class="quick-actions">
        <button class="btn btn-secondary" @click="$router.push('/game')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          游戏工具
        </button>
        <button v-if="roomStore.phase === 'ended'" class="btn btn-primary" @click="restart">
          再来一局
        </button>
      </div>

      <div v-if="roomStore.gameWinner" class="winner-banner" :class="roomStore.gameWinner">
        <span v-if="roomStore.gameWinner === 'civilian'">🎉 平民获胜！</span>
        <span v-else>🎉 卧底获胜！</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useRoomStore } from '../stores/room.js'

const router = useRouter()
const roomStore = useRoomStore()

async function eliminate(playerId) {
  await roomStore.eliminatePlayer(playerId)
}

async function revive(playerId) {
  await roomStore.revivePlayer(playerId)
}

async function restart() {
  await roomStore.restartGame()
  router.push('/room')
}
</script>

<style scoped>
.panel-header {
  margin-bottom: 20px;
}

.word-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.word-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
  text-align: center;
}

.word-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.word-value {
  font-size: 20px;
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
  margin-bottom: 20px;
}

.player-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  transition: all 0.2s;
}

.player-card.eliminated {
  opacity: 0.5;
  border-color: var(--danger);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-num {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.player-name-sm {
  font-size: 12px;
  color: var(--text-muted);
}

.role-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.tag-civilian { background: rgba(59, 130, 246, 0.15); color: var(--civilian); }
.tag-spy { background: rgba(239, 68, 68, 0.15); color: var(--spy); }
.tag-blank { background: rgba(245, 158, 11, 0.15); color: var(--blank); }

.player-word {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.player-actions {
  display: flex;
  gap: 6px;
}

.eliminate-btn, .revive-btn {
  flex: 1;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: 12px;
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

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.winner-banner {
  text-align: center;
  padding: 16px;
  border-radius: var(--radius-lg);
  font-size: 18px;
  font-weight: 700;
}

.winner-banner.civilian {
  background: rgba(59, 130, 246, 0.15);
  color: var(--civilian);
}

.winner-banner.spy {
  background: rgba(239, 68, 68, 0.15);
  color: var(--spy);
}
</style>
