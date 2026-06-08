<template>
  <div class="app-wrapper">
    <nav v-if="showNav" class="top-nav">
      <button class="nav-back" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <span class="nav-title">{{ pageTitle }}</span>
      <div class="nav-placeholder"></div>
    </nav>
    <router-view v-slot="{ Component }">
      <transition name="slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const showNav = computed(() => route.path !== '/')

const pageTitle = computed(() => {
  const titles = {
    '/create': '创建房间',
    '/join': '加入房间',
    '/room': '游戏房间',
    '/identity': '我的身份',
    '/judge': '裁判面板',
    '/game': '游戏工具',
    '/words': '词库管理',
    '/history': '历史记录'
  }
  return titles[route.path] || ''
})

function goBack() {
  if (route.path === '/room' || route.path === '/identity' || route.path === '/judge' || route.path === '/game') {
    router.push('/room')
  } else {
    router.back()
  }
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100dvh;
  background: var(--bg-primary);
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--safe-top) 16px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 50%;
}

.nav-back:active {
  background: var(--bg-tertiary);
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-placeholder {
  width: 40px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
