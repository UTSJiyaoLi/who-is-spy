import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/create', name: 'create', component: () => import('../views/CreateRoomView.vue') },
  { path: '/join', name: 'join', component: () => import('../views/JoinRoomView.vue') },
  { path: '/room', name: 'room', component: () => import('../views/RoomView.vue') },
  { path: '/identity', name: 'identity', component: () => import('../views/IdentityView.vue') },
  { path: '/judge', name: 'judge', component: () => import('../views/JudgeView.vue') },
  { path: '/game', name: 'game', component: () => import('../views/GameView.vue') },
  { path: '/history', name: 'history', component: () => import('../views/HistoryView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
