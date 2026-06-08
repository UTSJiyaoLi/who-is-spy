<template>
  <div class="page">
    <h2 class="page-title">词库管理</h2>

    <!-- 内置词库 -->
    <div class="section-title">内置词库</div>
    <div class="category-filter">
      <button 
        class="filter-btn"
        :class="{ active: selectedCategory === '' }"
        @click="selectedCategory = ''"
      >
        全部
      </button>
      <button 
        v-for="cat in categories" 
        :key="cat"
        class="filter-btn"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div class="words-list">
      <div 
        v-for="word in filteredDefaultWords" 
        :key="word.civilian + word.spy"
        class="word-item"
      >
        <div class="word-pair">
          <span class="word civilian-word">{{ word.civilian }}</span>
          <span class="vs">vs</span>
          <span class="word spy-word">{{ word.spy }}</span>
        </div>
        <span class="word-cat">{{ word.category }}</span>
      </div>
    </div>

    <!-- 自定义词语 -->
    <div class="section-title">自定义词语</div>
    <div class="add-word-form">
      <input 
        type="text" 
        class="input" 
        v-model="newCivilian" 
        placeholder="平民词"
      >
      <input 
        type="text" 
        class="input" 
        v-model="newSpy" 
        placeholder="卧底词"
      >
      <input 
        type="text" 
        class="input" 
        v-model="newCategory" 
        placeholder="分类（可选）"
      >
      <button class="btn btn-primary" @click="addWord" :disabled="!canAdd">
        添加
      </button>
    </div>

    <div v-if="store.customWords.length === 0" class="empty-state">
      <p>还没有自定义词语</p>
    </div>
    <div v-else class="words-list">
      <div 
        v-for="word in store.customWords" 
        :key="word.id"
        class="word-item custom"
      >
        <div class="word-pair">
          <span class="word civilian-word">{{ word.civilian }}</span>
          <span class="vs">vs</span>
          <span class="word spy-word">{{ word.spy }}</span>
        </div>
        <div class="word-actions">
          <span class="word-cat">{{ word.category || '自定义' }}</span>
          <button class="delete-btn" @click="store.removeCustomWord(word.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'
import { defaultWordBank, categories } from '../data/wordBank.js'

const store = useGameStore()

const selectedCategory = ref('')
const newCivilian = ref('')
const newSpy = ref('')
const newCategory = ref('')

const filteredDefaultWords = computed(() => {
  if (!selectedCategory.value) return defaultWordBank
  return defaultWordBank.filter(w => w.category === selectedCategory.value)
})

const canAdd = computed(() => {
  return newCivilian.value.trim() && newSpy.value.trim() && newCivilian.value !== newSpy.value
})

function addWord() {
  if (!canAdd.value) return
  store.addCustomWord({
    civilian: newCivilian.value.trim(),
    spy: newSpy.value.trim(),
    category: newCategory.value.trim() || '自定义'
  })
  newCivilian.value = ''
  newSpy.value = ''
  newCategory.value = ''
}
</script>

<style scoped>
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-btn {
  padding: 6px 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  max-height: 300px;
  overflow-y: auto;
}

.word-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.word-item.custom {
  border-color: rgba(124, 58, 237, 0.3);
}

.word-pair {
  display: flex;
  align-items: center;
  gap: 8px;
}

.word {
  font-size: 15px;
  font-weight: 600;
}

.civilian-word {
  color: var(--civilian);
}

.spy-word {
  color: var(--spy);
}

.vs {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 700;
}

.word-cat {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 10px;
}

.word-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--danger);
  cursor: pointer;
}

.add-word-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
