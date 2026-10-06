/**
 * ============================================================================
 * FILE: server/game-server.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Server real-time mandiri (Standalone Node.js Server) berbasis Socket.io untuk
 * mensinkronisasi pergerakan pemain, obrolan (chat), dan monster di Open World.
 * 
 * PROTOKOL & PORT:
 * - Port Default: 3001 (atau sesuai variabel lingkungan process.env.PORT)
 * - Protokol: WebSockets dengan fallback Polling (Socket.io)
 * 
 * ALUR EVENT:
 * 1. 'connection': Saat klien web membuka koneksi ke ws://localhost:3001
 * 2. 'player:join': Menambahkan pemain ke memori `players`, mengirim data dunia awal
 *    lewat 'world:init', lalu menyiarkan 'player:joined' ke pemain lain.
 * 3. 'player:move': Menerima koordinat baru dari klien pemain, lalu menyiarkan
 *    ke semua pemain lain lewat 'player:moved'.
 * 4. 'chat:message': Mengemas pesan obrolan lalu menyiarkannya via 'chat:broadcast'.
 * 5. 'disconnect': Menghapus data pemain dari memori dan menyiarkan 'player:left'.
 * 6. Roaming Tick: Loop interval 3 detik untuk menggerakkan monster di open world.
 * ============================================================================
 */

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

/** Database memori (In-Memory Map) penyimpan seluruh pemain yang aktif */
const players = new Map();

/** Daftar monster penjelajah open world */
const monsters = [
  { id: 'm1', name: 'Emerald Slime', type: 'slime', x: 1200, y: 1300, hp: 50, maxHp: 50, targetX: 1200, targetY: 1300 },
  { id: 'm2', name: 'Aqua Slime', type: 'slime', x: 1800, y: 1100, hp: 50, maxHp: 50, targetX: 1800, targetY: 1100 },
  { id: 'm3', name: 'Forest Slime', type: 'slime', x: 1400, y: 1900, hp: 50, maxHp: 50, targetX: 1400, targetY: 1900 },
  { id: 'm4', name: 'Royal Slime', type: 'slime', x: 2200, y: 1700, hp: 120, maxHp: 120, targetX: 2200, targetY: 1700 },
];

/** Batas luas koordinat dunia open world */
const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 3200;

io.on('connection', (socket) => {
  console.log(`[Socket] Koneksi baru terhubung: ${socket.id}`);

  // 1. Event pemain bergabung
  socket.on('player:join', (data) => {
    const defaultX = 1600 + Math.floor((Math.random() - 0.5) * 200);
    const defaultY = 1600 + Math.floor((Math.random() - 0.5) * 200);

    const isSuperAdmin = data.isSuperAdmin || data.role === 'super_admin' || data.name === 'RADEN';

    const player = {
      id: socket.id,
      name: data.name || `Player_${socket.id.substring(0, 4)}`,
      role: isSuperAdmin ? 'super_admin' : (data.role || 'player'),
      isSuperAdmin: isSuperAdmin,
      avatar: data.avatar || {
        gender: 'male',
        skinColor: '#fed7aa',
        shirtColor: '#2563eb',
        pantsColor: '#1e293b',
        hatType: 'none',
      },
      x: defaultX,
      y: defaultY,
      direction: 'down',
      isMoving: false,
      hp: isSuperAdmin ? 9999 : 100,
      maxHp: isSuperAdmin ? 9999 : 100,
      level: isSuperAdmin ? 99 : 1,
    };

    players.set(socket.id, player);

    // Kirim snapshot dunia ke pemain yang baru masuk
    socket.emit('world:init', {
      selfId: socket.id,
      selfPlayer: player,
      players: Array.from(players.values()).filter(p => p.id !== socket.id),
      monsters: monsters,
      worldBounds: { width: WORLD_WIDTH, height: WORLD_HEIGHT }
    });

    // Siarkan ke seluruh pemain lain bahwa ada pemain baru masuk
    socket.broadcast.emit('player:joined', player);

    console.log(`[Player] ${player.name} (${player.avatar.gender}) [ROLE: ${player.role}] bergabung. Online: ${players.size}`);
  });

  // 2. Event pergerakan posisi pemain
  socket.on('player:move', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.x = data.x;
    player.y = data.y;
    player.direction = data.direction || player.direction;
    player.isMoving = data.isMoving;

    // Siarkan posisi terbaru ke semua pemain lain
    socket.broadcast.emit('player:moved', {
      id: socket.id,
      x: player.x,
      y: player.y,
      direction: player.direction,
      isMoving: player.isMoving,
      role: player.role,
      isSuperAdmin: player.isSuperAdmin
    });
  });

  // 3. Event pesan obrolan (chat)
  socket.on('chat:message', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    // Perintah khusus Super Admin /announce
    if (player.isSuperAdmin && typeof data.text === 'string' && data.text.startsWith('/announce ')) {
      const announcement = data.text.replace('/announce ', '').trim();
      io.emit('chat:broadcast', {
        id: `announcement_${Date.now()}`,
        senderId: socket.id,
        senderName: '👑 [SUPER ADMIN] RADEN',
        senderRole: 'super_admin',
        isSuperAdmin: true,
        text: `📢 ${announcement}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    const chatPacket = {
      id: `chat_${Date.now()}_${Math.random()}`,
      senderId: socket.id,
      senderName: player.name,
      senderRole: player.role,
      isSuperAdmin: player.isSuperAdmin,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    io.emit('chat:broadcast', chatPacket);
  });

  // 4. Event pemain disconnect
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      console.log(`[Player] ${player.name} terputus. Sisa online: ${players.size - 1}`);
      players.delete(socket.id);
      io.emit('player:left', { id: socket.id, name: player.name });
    }
  });
});

// Loop pergerakan acak monster setiap 3 detik
setInterval(() => {
  if (players.size === 0) return;

  monsters.forEach(m => {
    const wanderDistance = 80;
    m.targetX = Math.max(200, Math.min(WORLD_WIDTH - 200, m.x + (Math.random() - 0.5) * wanderDistance * 2));
    m.targetY = Math.max(200, Math.min(WORLD_HEIGHT - 200, m.y + (Math.random() - 0.5) * wanderDistance * 2));
    m.x = m.targetX;
    m.y = m.targetY;
  });

  io.emit('monsters:sync', monsters);
}, 3000);

httpServer.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🎮 RadenWorld Game Server (WebSocket)`);
  console.log(`🚀 Berjalan di port: http://localhost:${PORT}`);
  console.log(`🌐 Batas Open World: ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  console.log(`=========================================`);
});
