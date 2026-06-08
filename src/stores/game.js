import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRandomWordPair } from '../data/wordBank.js'
import { shuffleArray } from '../utils/shuffle.js'
import { getItem, setItem } from '../utils/storage.js'

export const useGameStore = defineStore('game', () => {
  // ===== 游戏配置 =====
  const playerCount = ref(6)
  const spyCount = ref(1)
  const hasBlank = ref(false)
  const hasJudge = ref(false)
  const judgePassword = ref('1234')
  const selectedCategory = ref('')
  const customWords = ref(getItem('customWords', []))

  // ===== 游戏状态 =====
  const wordPair = ref(null)
  const players = ref([])
  const currentPlayerIndex = ref(0)
  const gamePhase = ref('setup') // setup, identity, playing, ended
  const speakingOrder = ref([])
  const eliminatedPlayers = ref([])
  const voteRecords = ref([])
  const timerSeconds = ref(60)
  const gameHistory = ref(getItem('gameHistory', []))

  // ===== 计算属性 =====
  const civilianCount = computed(() => {
    let count = playerCount.value - spyCount.value
    if (hasBlank.value) count--
    if (hasJudge.value) count--
    return Math.max(0, count)
  })

  const isConfigValid = computed(() => {
    const minPlayers = 1 + spyCount.value + (hasBlank.value ? 1 : 0) + (hasJudge.value ? 1 : 0)
    return playerCount.value >= minPlayers && playerCount.value <= 20 && spyCount.value >= 1
  })

  const livingPlayers = computed(() => {
    return players.value.filter(p => !eliminatedPlayers.value.includes(p.id))
  })

  const livingSpies = computed(() => {
    return livingPlayers.value.filter(p => p.role === 'spy')
  })

  const livingCivilians = computed(() => {
    return livingPlayers.value.filter(p => p.role === 'civilian')
  })

  // ===== 动作 =====
  function generateGame() {
    wordPair.value = getRandomWordPair(selectedCategory.value || null, customWords.value)
    
    const roles = []
    
    // 添加卧底
    for (let i = 0; i < spyCount.value; i++) {
      roles.push('spy')
    }
    
    // 添加白板
    if (hasBlank.value) {
      roles.push('blank')
    }
    
    // 添加裁判
    if (hasJudge.value) {
      roles.push('judge')
    }
    
    // 剩余为平民
    while (roles.length < playerCount.value) {
      roles.push('civilian')
    }
    
    const shuffledRoles = shuffleArray(roles)
    
    players.value = shuffledRoles.map((role, index) => ({
      id: index + 1,
      number: index + 1,
      role,
      word: role === 'spy' ? wordPair.value.spy : role === 'civilian' ? wordPair.value.civilian : role === 'blank' ? '（无词语）' : '（裁判）',
      isEliminated: false
    }))
    
    currentPlayerIndex.value = 0
    eliminatedPlayers.value = []
    voteRecords.value = []
    gamePhase.value = 'identity'
    
    // 生成随机发言顺序（排除裁判）
    const playablePlayers = players.value.filter(p => p.role !== 'judge').map(p => p.id)
    speakingOrder.value = shuffleArray(playablePlayers)
  }

  function nextPlayer() {
    if (currentPlayerIndex.value < players.value.length - 1) {
      currentPlayerIndex.value++
    }
  }

  function resetIdentityView() {
    currentPlayerIndex.value = 0
  }

  function startGame() {
    gamePhase.value = 'playing'
  }

  function eliminatePlayer(playerId) {
    if (!eliminatedPlayers.value.includes(playerId)) {
      eliminatedPlayers.value.push(playerId)
      const player = players.value.find(p => p.id === playerId)
      if (player) player.isEliminated = true
    }
  }

  function revivePlayer(playerId) {
    eliminatedPlayers.value = eliminatedPlayers.value.filter(id => id !== playerId)
    const player = players.value.find(p => p.id === playerId)
    if (player) player.isEliminated = false
  }

  function addVoteRecord(round, votes) {
    voteRecords.value.push({ round, votes, time: Date.now() })
  }

  function checkWinner() {
    const living = livingPlayers.value
    const spies = living.filter(p => p.role === 'spy')
    const civilians = living.filter(p => p.role === 'civilian' || p.role === 'blank')
    
    if (spies.length === 0) return 'civilian'
    if (spies.length >= civilians.length) return 'spy'
    return null
  }

  function saveGame() {
    const record = {
      id: Date.now(),
      date: new Date().toLocaleString('zh-CN'),
      playerCount: playerCount.value,
      spyCount: spyCount.value,
      hasBlank: hasBlank.value,
      hasJudge: hasJudge.value,
      wordPair: wordPair.value,
      players: players.value.map(p => ({ id: p.id, role: p.role, isEliminated: p.isEliminated })),
      winner: checkWinner(),
      voteRecords: voteRecords.value.length
    }
    gameHistory.value.unshift(record)
    setItem('gameHistory', gameHistory.value)
  }

  function endGame() {
    saveGame()
    gamePhase.value = 'ended'
  }

  function resetGame() {
    gamePhase.value = 'setup'
    players.value = []
    wordPair.value = null
    currentPlayerIndex.value = 0
    eliminatedPlayers.value = []
    voteRecords.value = []
    speakingOrder.value = []
  }

  function addCustomWord(pair) {
    customWords.value.push({ ...pair, id: Date.now() })
    setItem('customWords', customWords.value)
  }

  function removeCustomWord(id) {
    customWords.value = customWords.value.filter(w => w.id !== id)
    setItem('customWords', customWords.value)
  }

  function clearHistory() {
    gameHistory.value = []
    setItem('gameHistory', [])
  }

  return {
    playerCount, spyCount, hasBlank, hasJudge, judgePassword,
    selectedCategory, customWords,
    wordPair, players, currentPlayerIndex, gamePhase,
    speakingOrder, eliminatedPlayers, voteRecords, timerSeconds,
    gameHistory,
    civilianCount, isConfigValid, livingPlayers, livingSpies, livingCivilians,
    generateGame, nextPlayer, resetIdentityView, startGame,
    eliminatePlayer, revivePlayer, addVoteRecord, checkWinner,
    saveGame, endGame, resetGame,
    addCustomWord, removeCustomWord, clearHistory
  }
})
