import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/setup', name: 'setup', component: () => import('../views/SetupView.vue') },
  { path: '/identity', name: 'identity', component: () => import('../views/IdentityView.vue') },
  { path: '/judge', name: 'judge', component: () => import('../views/JudgeView.vue') },
  { path: '/game', name: 'game', component: () => import('../views/GameView.vue') },
  { path: '/words', name: 'words', component: () => import('../views/WordsView.vue') },
  { path: '/history', name: 'history', component: () => import('../views/HistoryView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
