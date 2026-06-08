# 谁是卧底助手 · 多人联机版

一款支持多人实时联机的「谁是卧底」聚会游戏辅助工具。一位玩家创建房间成为裁判，其他玩家通过邀请码加入，各自在手机上查看身份。

## 功能特性

- **创建房间**：创建者自动成为裁判，裁判不计入玩家总数
- **邀请码加入**：4位邀请码，快速邀请朋友
- **实时联机**：Socket.io 实时同步，无需传递手机
- **裁判面板**：创建者自动拥有裁判权限，可查看所有人身份并标记出局
- **身份分配**：每人仅能在自己手机上看到专属身份
- **游戏工具**：发言计时器、随机发言顺序、投票统计
- **丰富词库**：内置 60+ 组精选词语，覆盖 10+ 分类

## 技术架构

```
who-is-spy/
├── client/          # Vue 3 前端 (Vite + PWA)
│   ├── src/
│   └── dist/        # 构建产物
└── server/          # Node.js + Socket.io 后端
    ├── index.js
    └── package.json
```

## 本地开发

### 1. 安装前端依赖

```bash
npm install
```

### 2. 安装后端依赖

```bash
cd server
npm install
cd ..
```

### 3. 启动后端服务器

```bash
npm run server:dev
# 或
cd server && npm run dev
```

服务器运行在 http://localhost:3000

### 4. 启动前端开发服务器（新终端）

```bash
npm run dev
```

前端运行在 http://localhost:5173

### 5. 用手机测试

确保手机和电脑在同一 WiFi 下，用手机浏览器访问电脑局域网 IP:5173

## 部署上线

### 方案一：Render（推荐，免费）

1. 将代码推送到 GitHub 仓库
2. 访问 [render.com](https://render.com) 注册账号
3. 点击 **New +** → **Web Service**
4. 连接你的 GitHub 仓库
5. 配置：
   - **Name**: `who-is-spy`
   - **Build Command**: `npm install && cd server && npm install && cd .. && npm run build`
   - **Start Command**: `npm run server`
   - **Plan**: Free
6. 点击 **Create Web Service**

等待部署完成后，Render 会给你一个链接，所有人都可以访问。

### 方案二：Railway（免费）

类似 Render 的流程，注册 [railway.app](https://railway.app)，新建项目，连接 GitHub 仓库，设置启动命令为 `npm run server`。

### 方案三：自有服务器

```bash
# 服务器上
git clone https://github.com/你的用户名/who-is-spy.git
cd who-is-spy
npm install
cd server && npm install && cd ..
npm run build
npm run server
```

使用 PM2 保持后台运行：
```bash
npm install -g pm2
pm2 start server/index.js --name who-is-spy
```

## iPhone 添加到主屏幕

1. 用 Safari 打开部署后的链接
2. 点击底部分享按钮
3. 选择「添加到主屏幕」
4. 即可像原生 App 一样全屏使用

## 使用流程

1. 一位玩家点击「创建房间」，设置人数和规则
2. 将 4 位邀请码分享给朋友（微信/口播都可以）
3. 其他玩家点击「加入房间」，输入邀请码和昵称
4. 所有人都加入后，裁判点击「开始游戏」
5. 每位玩家在自己的手机上查看专属身份
6. 裁判使用「裁判面板」查看所有人身份并主持游戏
7. 使用「游戏工具」进行发言计时和投票统计

## 游戏规则

- **裁判**：创建房间的玩家自动成为裁判，可以看到所有人身份，负责主持游戏进程。裁判不计入玩家总数。
- **平民**：大部分人拿到相同的词语
- **卧底**：少数人拿到不同的词语
- **白板**（可选）：没有词语，需要根据描述推理
- 每人轮流描述自己的词语，不能直接说出词语本身
- 每轮投票淘汰最像卧底的人
- 卧底全部出局则平民获胜；卧底存活≥平民则卧底获胜
