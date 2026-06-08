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
      <p class="hero-subtitle">多人联机版 · 聚会游戏助手</p>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary menu-btn" @click="$router.push('/create')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        创建房间
      </button>

      <button class="btn btn-secondary menu-btn" @click="$router.push('/join')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        加入房间
      </button>

      <button class="btn btn-secondary menu-btn" @click="showRules = true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        游戏规则
      </button>
    </div>

    <!-- 规则弹窗 -->
    <div v-if="showRules" class="modal-overlay" @click="showRules = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">游戏规则</h3>
        <div class="rules-content">
          <p><strong>1. 创建房间</strong></p>
          <p>一位玩家创建房间成为<strong>裁判</strong>，裁判可以看到所有人的身份，负责主持游戏。</p>
          <p style="color: var(--accent-secondary); margin-top: 4px;">裁判不计入玩家总数。</p>
          
          <p><strong>2. 邀请加入</strong></p>
          <p>创建者将 4 位邀请码分享给朋友，其他玩家输入邀请码和昵称加入房间。</p>
          
          <p><strong>3. 分配身份</strong></p>
          <p>裁判点击「开始游戏」后，系统自动分配身份。每位玩家在自己的手机上看到专属身份。</p>
          
          <p><strong>4. 轮流描述</strong></p>
          <p>每人轮流用一句话描述自己的词语，不能直接说出词语本身。</p>
          
          <p><strong>5. 投票淘汰</strong></p>
          <p>每轮描述结束后，大家投票选出最像卧底的人。得票最多者出局。</p>
          
          <p><strong>6. 胜负判定</strong></p>
          <p>卧底全部出局则平民获胜；卧底存活人数≥平民则卧底获胜；白板猜出两个词则白板获胜。</p>
        </div>
        <button class="btn btn-primary" @click="showRules = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showRules = ref(false)
</script>

<style scoped>
.home-page {
  justify-content: center;
  padding-top: calc(var(--safe-top) + 40px);
}

.hero {
  text-align: center;
  margin-bottom: 48px;
}

.hero-icon {
  margin-bottom: 20px;
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

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 24px;
  font-size: 17px;
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
  margin-bottom: 10px;
  color: var(--text-secondary);
  font-size: 14px;
}

.rules-content strong {
  color: var(--text-primary);
}
</style>
