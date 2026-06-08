<template>
  <div class="page">
    <h2 class="page-title">创建房间</h2>

    <div class="notice-card">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>创建者自动成为裁判，裁判不计入玩家总数</span>
    </div>

    <div class="card">
      <div class="form-group">
        <label class="form-label">你的昵称</label>
        <input type="text" class="input" v-model="judgeName" placeholder="输入昵称" maxlength="10">
      </div>

      <div class="divider"></div>

      <div class="form-group">
        <label class="form-label">预计玩家数（不含裁判）</label>
        <div class="stepper">
          <button class="stepper-btn" @click="config.playerCount = Math.max(3, config.playerCount - 1)">−</button>
          <span class="stepper-value">{{ config.playerCount }}人</span>
          <button class="stepper-btn" @click="config.playerCount = Math.min(19, config.playerCount + 1)">+</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">卧底人数</label>
        <div class="stepper">
          <button class="stepper-btn" @click="config.spyCount = Math.max(1, config.spyCount - 1)">−</button>
          <span class="stepper-value">{{ config.spyCount }}人</span>
          <button class="stepper-btn" @click="config.spyCount = Math.min(maxSpies, config.spyCount + 1)">+</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">白板人数</label>
        <div class="stepper">
          <button class="stepper-btn" @click="config.blankCount = Math.max(0, config.blankCount - 1)">−</button>
          <span class="stepper-value">{{ config.blankCount }}人</span>
          <button class="stepper-btn" @click="config.blankCount = Math.min(maxBlanks, config.blankCount + 1)">+</button>
        </div>
      </div>
      <p class="switch-hint">白板没有词语，需猜出两个词才能获胜</p>

      <div class="divider"></div>

      <!-- 词语选择 -->
      <div class="form-group">
        <label class="form-label">词语来源</label>
        <div class="word-source-options">
          <button 
            class="source-btn"
            :class="{ active: wordSource === 'random' }"
            @click="wordSource = 'random'"
          >
            随机词库
          </button>
          <button 
            class="source-btn"
            :class="{ active: wordSource === 'custom' }"
            @click="wordSource = 'custom'"
          >
            自定义词语
          </button>
        </div>
      </div>

      <!-- 随机词库 -->
      <template v-if="wordSource === 'random'">
        <div class="form-group">
          <label class="form-label">词库分类</label>
          <select class="select" v-model="config.selectedCategory">
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
      </template>

      <!-- 自定义词语 -->
      <template v-else>
        <div class="form-group">
          <label class="form-label">平民词</label>
          <input 
            type="text" 
            class="input" 
            v-model="customCivilian" 
            placeholder="例如：火锅"
            maxlength="10"
          >
        </div>
        <div class="form-group">
          <label class="form-label">卧底词</label>
          <input 
            type="text" 
            class="input" 
            v-model="customSpy" 
            placeholder="例如：烧烤"
            maxlength="10"
          >
        </div>
        <p v-if="customError" class="error-hint">{{ customError }}</p>
        <div v-else-if="customCivilian && customSpy" class="word-preview">
          <div class="word-tag civilian-tag">{{ customCivilian }}</div>
          <span class="vs-text">VS</span>
          <div class="word-tag spy-tag">{{ customSpy }}</div>
        </div>
      </template>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="createRoom" :disabled="!canCreate || isLoading">
        <span v-if="isLoading">创建中...</span>
        <span v-else>创建房间</span>
      </button>
    </div>

    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '../stores/room.js'
import { connectSocket } from '../utils/socket.js'
import { categories, getRandomWordPair } from '../data/wordBank.js'

const router = useRouter()
const roomStore = useRoomStore()

const judgeName = ref('')
const isLoading = ref(false)
const error = ref('')
const wordSource = ref('random')
const customCivilian = ref('')
const customSpy = ref('')

const config = ref({
  playerCount: 5,
  spyCount: 1,
  blankCount: 0,
  selectedCategory: '',
  timerSeconds: 60,
  customWordPair: null
})

const maxSpies = computed(() => Math.max(1, Math.floor((config.value.playerCount - config.value.blankCount) / 2)))

const maxBlanks = computed(() => Math.max(0, config.value.playerCount - config.value.spyCount - 1))

const canCreate = computed(() => {
  if (!judgeName.value.trim()) return false
  if (wordSource.value === 'custom') {
    return customCivilian.value.trim() && customSpy.value.trim() && customCivilian.value !== customSpy.value
  }
  return true
})

const customError = computed(() => {
  if (wordSource.value !== 'custom') return ''
  if (customCivilian.value && customSpy.value && customCivilian.value === customSpy.value) {
    return '两个词语不能相同'
  }
  return ''
})

const previewPair = ref(getRandomWordPair(config.value.selectedCategory || null))

function refreshPreview() {
  previewPair.value = getRandomWordPair(config.value.selectedCategory || null)
}

async function createRoom() {
  if (!canCreate.value) return

  isLoading.value = true
  error.value = ''

  // 设置自定义词语
  if (wordSource.value === 'custom' && customCivilian.value.trim() && customSpy.value.trim()) {
    config.value.customWordPair = {
      civilian: customCivilian.value.trim(),
      spy: customSpy.value.trim()
    }
  } else {
    config.value.customWordPair = null
  }

  try {
    connectSocket()
    await new Promise(r => setTimeout(r, 500))

    const res = await roomStore.createRoom(config.value, judgeName.value.trim())
    if (res.success) {
      router.push('/room')
    } else {
      error.value = res.error || '创建失败'
    }
  } catch (err) {
    error.value = '连接服务器失败，请检查网络'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.notice-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  color: var(--accent-secondary);
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 10px;
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

.stepper-value {
  font-size: 16px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
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
}

.word-source-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.source-btn {
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.source-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
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

.error-hint {
  font-size: 13px;
  color: var(--danger);
  margin-top: -8px;
  margin-bottom: 8px;
}

.action-buttons {
  margin-top: 24px;
}

.error-text {
  text-align: center;
  color: var(--danger);
  font-size: 14px;
  margin-top: 12px;
}
</style>
