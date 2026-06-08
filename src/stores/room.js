import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socket, emit } from '../utils/socket.js'

export const useRoomStore = defineStore('room', () => {
  // ===== 连接状态 =====
  const isConnected = ref(false)
  const connectionError = ref('')

  // ===== 房间信息 =====
  const roomId = ref('')
  const isHost = ref(false)
  const playerId = ref(null)
  const playerName = ref('')
  const phase = ref('') // waiting, identity, playing, ended

  // ===== 房间数据 =====
  const players = ref([]) // { id, name, isEliminated }
  const config = ref({})
  const wordPair = ref(null)
  const myIdentity = ref(null) // { role, word }
  const judgeInfo = ref(null) // 裁判看到的完整信息
  const speakingOrder = ref([])
  const eliminatedPlayers = ref([])
  const voteRecords = ref([])
  const gameWinner = ref(null)

  // ===== 计算属性 =====
  const isJudge = computed(() => isHost.value)
  const livingPlayers = computed(() => players.value.filter(p => !eliminatedPlayers.value.includes(p.id)))
  const canStart = computed(() => isHost.value && phase.value === 'waiting' && players.value.length > 0)
  const confirmedIdentities = ref(new Set())

  // ===== 初始化 Socket 事件监听 =====
  function initSocketListeners() {
    socket.on('connect', () => {
      isConnected.value = true
      connectionError.value = ''
    })

    socket.on('disconnect', () => {
      isConnected.value = false
    })

    socket.on('connect_error', (err) => {
      connectionError.value = '连接服务器失败'
      console.error('Socket error:', err)
    })

    socket.on('roomUpdated', (data) => {
      updateRoomData(data)
    })

    socket.on('identityAssigned', (data) => {
      myIdentity.value = { role: data.role, word: data.word }
      playerId.value = data.playerId
      updateRoomData(data.roomInfo)
      phase.value = 'identity'
    })

    socket.on('judgeInfo', (data) => {
      judgeInfo.value = data.players
      wordPair.value = data.wordPair
      updateRoomData(data.roomInfo)
      phase.value = 'identity'
    })

    socket.on('gameStarted', (data) => {
      updateRoomData(data)
    })

    socket.on('playerEliminated', (data) => {
      eliminatedPlayers.value = data.roomInfo.eliminatedPlayers
      updateRoomData(data.roomInfo)
    })

    socket.on('playerRevived', (data) => {
      eliminatedPlayers.value = data.roomInfo.eliminatedPlayers
      updateRoomData(data.roomInfo)
    })

    socket.on('gameEnded', (data) => {
      gameWinner.value = data.winner
      phase.value = 'ended'
      updateRoomData(data.roomInfo)
    })

    socket.on('gameRestarted', (data) => {
      resetGameState()
      updateRoomData(data)
    })

    socket.on('roomClosed', (data) => {
      connectionError.value = data.reason || '房间已关闭'
      resetAll()
    })

    socket.on('voteRecorded', (data) => {
      voteRecords.value.push(data)
    })

    socket.on('speakingOrderUpdated', (data) => {
      speakingOrder.value = data.order
    })

    socket.on('playerConfirmedIdentity', (data) => {
      confirmedIdentities.value.add(data.socketId)
    })
  }

  function updateRoomData(data) {
    if (data.roomId) roomId.value = data.roomId
    if (data.phase) phase.value = data.phase
    if (data.config) config.value = data.config
    if (data.players) players.value = data.players
    if (data.speakingOrder) speakingOrder.value = data.speakingOrder
    if (data.eliminatedPlayers) eliminatedPlayers.value = data.eliminatedPlayers
    if (data.voteRecords) voteRecords.value = data.voteRecords
  }

  // ===== 房间操作 =====
  async function createRoom(roomConfig, judgeName) {
    const res = await emit('createRoom', {
      config: roomConfig,
      judgeName
    })
    if (res.success) {
      roomId.value = res.roomId
      isHost.value = true
      playerName.value = judgeName
      saveRoomToStorage()
    }
    return res
  }

  async function joinRoom(roomCode, name) {
    const res = await emit('joinRoom', {
      roomId: roomCode.toUpperCase(),
      playerName: name
    })
    if (res.success) {
      roomId.value = roomCode.toUpperCase()
      isHost.value = false
      playerId.value = res.playerId
      playerName.value = name
      updateRoomData(res.roomInfo)
      saveRoomToStorage()
    }
    return res
  }

  async function startGame() {
    const res = await emit('startGame', { roomId: roomId.value })
    return res
  }

  async function confirmIdentity() {
    socket.emit('confirmIdentity', { roomId: roomId.value })
  }

  async function eliminatePlayer(targetId) {
    const res = await emit('eliminatePlayer', {
      roomId: roomId.value,
      playerId: targetId
    })
    return res
  }

  async function revivePlayer(targetId) {
    const res = await emit('revivePlayer', {
      roomId: roomId.value,
      playerId: targetId
    })
    return res
  }

  async function submitVote(round, votes) {
    const res = await emit('submitVote', {
      roomId: roomId.value,
      round,
      votes
    })
    return res
  }

  async function updateSpeakingOrder(order) {
    socket.emit('updateSpeakingOrder', {
      roomId: roomId.value,
      order
    })
  }

  async function restartGame() {
    const res = await emit('restartGame', { roomId: roomId.value })
    return res
  }

  async function getRoomInfo() {
    const res = await emit('getRoomInfo', { roomId: roomId.value })
    if (res.success) {
      updateRoomData(res.roomInfo)
    }
    return res
  }

  // ===== 本地存储 =====
  function saveRoomToStorage() {
    localStorage.setItem('whoisspy_currentRoom', JSON.stringify({
      roomId: roomId.value,
      playerId: playerId.value,
      isHost: isHost.value,
      playerName: playerName.value
    }))
  }

  function clearRoomStorage() {
    localStorage.removeItem('whoisspy_currentRoom')
  }

  function resetGameState() {
    myIdentity.value = null
    judgeInfo.value = null
    gameWinner.value = null
    confirmedIdentities.value = new Set()
    speakingOrder.value = []
    eliminatedPlayers.value = []
    voteRecords.value = []
  }

  function resetAll() {
    resetGameState()
    roomId.value = ''
    isHost.value = false
    playerId.value = null
    playerName.value = ''
    phase.value = ''
    players.value = []
    config.value = {}
    wordPair.value = null
    clearRoomStorage()
  }

  // 角色名称映射
  function getRoleName(role) {
    const names = { civilian: '平民', spy: '卧底', blank: '白板', judge: '裁判' }
    return names[role] || role
  }

  // 角色颜色
  function getRoleColor(role) {
    const colors = { civilian: 'var(--civilian)', spy: 'var(--spy)', blank: 'var(--blank)', judge: 'var(--judge)' }
    return colors[role] || 'var(--text-secondary)'
  }

  // 是否使用自定义词语
  const isCustomWord = computed(() => {
    return !!(config.value.customWordPair && config.value.customWordPair.civilian)
  })

  return {
    isConnected, connectionError,
    roomId, isHost, playerId, playerName, phase,
    players, config, wordPair, myIdentity, judgeInfo,
    speakingOrder, eliminatedPlayers, voteRecords, gameWinner,
    confirmedIdentities,
    isJudge, livingPlayers, canStart, isCustomWord,
    initSocketListeners,
    createRoom, joinRoom, startGame, confirmIdentity,
    eliminatePlayer, revivePlayer, submitVote,
    updateSpeakingOrder, restartGame, getRoomInfo,
    resetAll, saveRoomToStorage, clearRoomStorage,
    getRoleName, getRoleColor
  }
})
