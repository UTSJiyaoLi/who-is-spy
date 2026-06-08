import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// 静态文件服务（前端 build 产物）
app.use(express.static(join(__dirname, '../dist')))

// 内存中的房间数据
const rooms = new Map()

// 生成4位邀请码
function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  do {
    id = ''
    for (let i = 0; i < 4; i++) {
      id += chars[Math.floor(Math.random() * chars.length)]
    }
  } while (rooms.has(id))
  return id
}

// 从词库随机抽取
const defaultWordBank = [
  { civilian: '可乐', spy: '雪碧', category: '饮品' },
  { civilian: '咖啡', spy: '奶茶', category: '饮品' },
  { civilian: '牛奶', spy: '豆浆', category: '饮品' },
  { civilian: '橙汁', spy: '苹果汁', category: '饮品' },
  { civilian: '啤酒', spy: '白酒', category: '饮品' },
  { civilian: '火锅', spy: '烧烤', category: '美食' },
  { civilian: '披萨', spy: '汉堡', category: '美食' },
  { civilian: '寿司', spy: '生鱼片', category: '美食' },
  { civilian: '饺子', spy: '馄饨', category: '美食' },
  { civilian: '面条', spy: '米粉', category: '美食' },
  { civilian: '巧克力', spy: '糖果', category: '美食' },
  { civilian: '蛋糕', spy: '面包', category: '美食' },
  { civilian: '地铁', spy: '公交', category: '交通' },
  { civilian: '高铁', spy: '动车', category: '交通' },
  { civilian: '飞机', spy: '直升机', category: '交通' },
  { civilian: '自行车', spy: '电动车', category: '交通' },
  { civilian: '轮船', spy: '游艇', category: '交通' },
  { civilian: '医生', spy: '护士', category: '职业' },
  { civilian: '老师', spy: '教授', category: '职业' },
  { civilian: '警察', spy: '保安', category: '职业' },
  { civilian: '厨师', spy: '烘焙师', category: '职业' },
  { civilian: '演员', spy: '歌手', category: '职业' },
  { civilian: '律师', spy: '法官', category: '职业' },
  { civilian: '微信', spy: 'QQ', category: '软件' },
  { civilian: '淘宝', spy: '京东', category: '软件' },
  { civilian: '抖音', spy: '快手', category: '软件' },
  { civilian: '微博', spy: '小红书', category: '软件' },
  { civilian: '百度', spy: '谷歌', category: '软件' },
  { civilian: '篮球', spy: '足球', category: '运动' },
  { civilian: '羽毛球', spy: '乒乓球', category: '运动' },
  { civilian: '游泳', spy: '潜水', category: '运动' },
  { civilian: '跑步', spy: '竞走', category: '运动' },
  { civilian: '瑜伽', spy: '普拉提', category: '运动' },
  { civilian: '猫', spy: '狗', category: '动物' },
  { civilian: '狮子', spy: '老虎', category: '动物' },
  { civilian: '企鹅', spy: '海豹', category: '动物' },
  { civilian: '熊猫', spy: '棕熊', category: '动物' },
  { civilian: '老鹰', spy: '猫头鹰', category: '动物' },
  { civilian: '电影', spy: '电视剧', category: '影视' },
  { civilian: '喜剧', spy: '悲剧', category: '影视' },
  { civilian: '动漫', spy: '卡通', category: '影视' },
  { civilian: '纪录片', spy: '真人秀', category: '影视' },
  { civilian: '夏天', spy: '冬天', category: '季节' },
  { civilian: '春天', spy: '秋天', category: '季节' },
  { civilian: '雨', spy: '雪', category: '自然' },
  { civilian: '山', spy: '海', category: '自然' },
  { civilian: '森林', spy: '草原', category: '自然' },
  { civilian: '手机', spy: '平板', category: '物品' },
  { civilian: '眼镜', spy: '墨镜', category: '物品' },
  { civilian: '背包', spy: '手提包', category: '物品' },
  { civilian: '雨伞', spy: '阳伞', category: '物品' },
  { civilian: '手表', spy: '手环', category: '物品' },
  { civilian: '超市', spy: '便利店', category: '地点' },
  { civilian: '图书馆', spy: '书店', category: '地点' },
  { civilian: '公园', spy: '游乐场', category: '地点' },
  { civilian: '酒店', spy: '民宿', category: '地点' },
  { civilian: '医院', spy: '诊所', category: '地点' },
  { civilian: '孙悟空', spy: '哪吒', category: '角色' },
  { civilian: '关羽', spy: '张飞', category: '角色' },
  { civilian: '李白', spy: '杜甫', category: '角色' },
  { civilian: '玛丽莲梦露', spy: '奥黛丽赫本', category: '名人' }
]

function getRandomWordPair(category = null) {
  let pool = category ? defaultWordBank.filter(w => w.category === category) : defaultWordBank
  if (pool.length === 0) pool = defaultWordBank
  return pool[Math.floor(Math.random() * pool.length)]
}

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 分配身份
function assignRoles(playerCount, spyCount, blankCount) {
  const roles = []
  for (let i = 0; i < spyCount; i++) roles.push('spy')
  for (let i = 0; i < blankCount; i++) roles.push('blank')
  while (roles.length < playerCount) roles.push('civilian')
  return shuffleArray(roles)
}

// 获取房间公开信息（隐藏敏感数据）
function getPublicRoomInfo(room) {
  return {
    roomId: room.roomId,
    phase: room.phase,
    config: room.config,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isEliminated: p.isEliminated
    })),
    playerCount: room.players.length,
    speakingOrder: room.speakingOrder,
    eliminatedPlayers: room.eliminatedPlayers,
    voteRecords: room.voteRecords
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  let currentRoom = null

  // 创建房间
  socket.on('createRoom', (data, callback) => {
    const { config, judgeName } = data
    const roomId = generateRoomId()
    
    const room = {
      roomId,
      hostSocketId: socket.id,
      players: [],
      judge: {
        socketId: socket.id,
        name: judgeName || '裁判',
        isHost: true
      },
      wordPair: null,
      phase: 'waiting',
      config,
      speakingOrder: [],
      voteRecords: [],
      eliminatedPlayers: [],
      customWords: []
    }
    
    rooms.set(roomId, room)
    socket.join(roomId)
    currentRoom = roomId
    
    callback({ success: true, roomId, isHost: true })
  })

  // 加入房间
  socket.on('joinRoom', (data, callback) => {
    const { roomId, playerName } = data
    const room = rooms.get(roomId.toUpperCase())
    
    if (!room) {
      callback({ success: false, error: '房间不存在' })
      return
    }
    
    if (room.phase !== 'waiting') {
      callback({ success: false, error: '游戏已经开始' })
      return
    }
    
    if (room.players.length >= room.config.playerCount) {
      callback({ success: false, error: '房间已满' })
      return
    }
    
    const player = {
      socketId: socket.id,
      id: room.players.length + 1,
      name: playerName || `玩家${room.players.length + 1}`,
      role: null,
      word: null,
      isEliminated: false
    }
    
    room.players.push(player)
    socket.join(roomId)
    currentRoom = roomId
    
    // 通知房间所有人有新玩家加入
    io.to(roomId).emit('roomUpdated', getPublicRoomInfo(room))
    
    callback({ 
      success: true, 
      playerId: player.id,
      isHost: false,
      roomInfo: getPublicRoomInfo(room)
    })
  })

  // 获取房间信息
  socket.on('getRoomInfo', (data, callback) => {
    const { roomId } = data
    const room = rooms.get(roomId)
    if (!room) {
      callback({ success: false, error: '房间不存在' })
      return
    }
    callback({ success: true, roomInfo: getPublicRoomInfo(room) })
  })

  // 开始游戏（仅裁判/创建者）
  socket.on('startGame', (data, callback) => {
    const { roomId } = data
    const room = rooms.get(roomId)
    
    if (!room) {
      callback({ success: false, error: '房间不存在' })
      return
    }
    
    if (room.hostSocketId !== socket.id) {
      callback({ success: false, error: '只有裁判可以开始游戏' })
      return
    }
    
    if (room.players.length === 0) {
      callback({ success: false, error: '至少需要1位玩家' })
      return
    }
    
    // 分配词语：优先使用自定义词语，否则随机抽取
    if (room.config.customWordPair && room.config.customWordPair.civilian && room.config.customWordPair.spy) {
      room.wordPair = { ...room.config.customWordPair, category: '自定义' }
    } else {
      room.wordPair = getRandomWordPair(room.config.selectedCategory || null)
    }
    
    // 分配身份（注意：玩家总数是加入房间的玩家数，裁判不计入）
    const actualPlayerCount = room.players.length
    const actualSpyCount = Math.min(room.config.spyCount, Math.floor(actualPlayerCount / 2))
    const blankCount = room.config.blankCount || 0
    // 确保特殊角色总数不超过玩家数
    const maxSpecial = actualSpyCount + blankCount
    const actualBlankCount = maxSpecial > actualPlayerCount ? Math.max(0, actualPlayerCount - actualSpyCount) : blankCount
    const roles = assignRoles(actualPlayerCount, actualSpyCount, actualBlankCount)
    
    room.players.forEach((player, index) => {
      player.role = roles[index]
      player.word = player.role === 'spy' ? room.wordPair.spy 
        : player.role === 'civilian' ? room.wordPair.civilian 
        : player.role === 'blank' ? '（无词语）' 
        : ''
    })
    
    // 生成发言顺序
    room.speakingOrder = shuffleArray(room.players.map(p => p.id))
    room.phase = 'identity'
    
    // 通知所有玩家
    room.players.forEach((player, index) => {
      const targetSocket = io.sockets.sockets.get(player.socketId)
      if (targetSocket) {
        targetSocket.emit('identityAssigned', {
          playerId: player.id,
          role: player.role,
          word: player.word,
          roomInfo: getPublicRoomInfo(room)
        })
      }
    })
    
    // 通知裁判
    const judgeSocket = io.sockets.sockets.get(room.hostSocketId)
    if (judgeSocket) {
      judgeSocket.emit('judgeInfo', {
        players: room.players.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          word: p.word,
          isEliminated: p.isEliminated
        })),
        wordPair: room.wordPair,
        roomInfo: getPublicRoomInfo(room)
      })
    }
    
    io.to(roomId).emit('gameStarted', getPublicRoomInfo(room))
    callback({ success: true })
  })

  // 玩家确认已查看身份
  socket.on('confirmIdentity', (data) => {
    const { roomId } = data
    socket.to(roomId).emit('playerConfirmedIdentity', { socketId: socket.id })
  })

  // 裁判标记玩家出局
  socket.on('eliminatePlayer', (data, callback) => {
    const { roomId, playerId } = data
    const room = rooms.get(roomId)
    
    if (!room || room.hostSocketId !== socket.id) {
      callback?.({ success: false, error: '无权限' })
      return
    }
    
    const player = room.players.find(p => p.id === playerId)
    if (player) {
      player.isEliminated = true
      room.eliminatedPlayers.push(playerId)
      io.to(roomId).emit('playerEliminated', { playerId, roomInfo: getPublicRoomInfo(room) })
      
      // 检查胜负
      const living = room.players.filter(p => !p.isEliminated)
      const spies = living.filter(p => p.role === 'spy')
      const civilians = living.filter(p => p.role === 'civilian' || p.role === 'blank')
      
      if (spies.length === 0) {
        io.to(roomId).emit('gameEnded', { winner: 'civilian', roomInfo: getPublicRoomInfo(room) })
        room.phase = 'ended'
      } else if (spies.length >= civilians.length) {
        io.to(roomId).emit('gameEnded', { winner: 'spy', roomInfo: getPublicRoomInfo(room) })
        room.phase = 'ended'
      }
    }
    
    callback?.({ success: true })
  })

  // 裁判复活玩家
  socket.on('revivePlayer', (data, callback) => {
    const { roomId, playerId } = data
    const room = rooms.get(roomId)
    
    if (!room || room.hostSocketId !== socket.id) {
      callback?.({ success: false, error: '无权限' })
      return
    }
    
    const player = room.players.find(p => p.id === playerId)
    if (player) {
      player.isEliminated = false
      room.eliminatedPlayers = room.eliminatedPlayers.filter(id => id !== playerId)
      io.to(roomId).emit('playerRevived', { playerId, roomInfo: getPublicRoomInfo(room) })
    }
    
    callback?.({ success: true })
  })

  // 更新发言顺序
  socket.on('updateSpeakingOrder', (data) => {
    const { roomId, order } = data
    const room = rooms.get(roomId)
    if (room && room.hostSocketId === socket.id) {
      room.speakingOrder = order
      io.to(roomId).emit('speakingOrderUpdated', { order })
    }
  })

  // 投票
  socket.on('submitVote', (data, callback) => {
    const { roomId, round, votes } = data
    const room = rooms.get(roomId)
    
    if (!room) {
      callback?.({ success: false })
      return
    }
    
    room.voteRecords.push({ round, votes, time: Date.now() })
    io.to(roomId).emit('voteRecorded', { round, votes })
    callback?.({ success: true })
  })

  // 重开一局
  socket.on('restartGame', (data, callback) => {
    const { roomId } = data
    const room = rooms.get(roomId)
    
    if (!room || room.hostSocketId !== socket.id) {
      callback?.({ success: false, error: '无权限' })
      return
    }
    
    // 重置状态但保留玩家
    room.phase = 'waiting'
    room.wordPair = null
    room.players.forEach(p => {
      p.role = null
      p.word = null
      p.isEliminated = false
    })
    room.speakingOrder = []
    room.voteRecords = []
    room.eliminatedPlayers = []
    
    io.to(roomId).emit('gameRestarted', getPublicRoomInfo(room))
    callback?.({ success: true })
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    if (currentRoom) {
      const room = rooms.get(currentRoom)
      if (room) {
        // 如果是创建者断开，解散房间
        if (room.hostSocketId === socket.id) {
          io.to(currentRoom).emit('roomClosed', { reason: '裁判已离开' })
          rooms.delete(currentRoom)
        } else {
          // 如果是玩家断开，标记为离线
          const player = room.players.find(p => p.socketId === socket.id)
          if (player && room.phase === 'waiting') {
            room.players = room.players.filter(p => p.socketId !== socket.id)
            // 重新编号
            room.players.forEach((p, i) => { p.id = i + 1 })
            io.to(currentRoom).emit('roomUpdated', getPublicRoomInfo(room))
          }
        }
      }
    }
  })
})

// SPA 路由回退
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'))
})

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
