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

/** Daftar monster penjelajah open world (dihapus sesuai permintaan pengguna, diganti NPC di sisi klien) */
const monsters = [];

/** Batas luas koordinat dunia open world (Skala Grid 120px: 80x80 tiles = 9600x9600) */
const WORLD_WIDTH = 9600;
const WORLD_HEIGHT = 9600;

io.on('connection', (socket) => {
  console.log(`[Socket] Koneksi baru terhubung: ${socket.id}`);

  // 1. Event pemain bergabung
  socket.on('player:join', (data) => {
    const defaultX = 4800 + Math.floor((Math.random() - 0.5) * 200);
    const defaultY = 4800 + Math.floor((Math.random() - 0.5) * 200);

    const isSuperAdmin = data.isSuperAdmin || data.role === 'super_admin' || data.name === 'RADEN';

    const playerName = (data.name || `Player_${socket.id.substring(0, 4)}`).trim();

    // Hapus sesi lama yang memiliki nama yang sama (mencegah ghost / double duplicate player saat reconnect/refresh)
    for (const [oldId, oldPlayer] of players.entries()) {
      if (oldId !== socket.id && oldPlayer.name.toLowerCase() === playerName.toLowerCase()) {
        console.log(`[Server] Membersihkan sesi lama '${oldPlayer.name}' (ID: ${oldId})`);
        players.delete(oldId);
        io.emit('player:left', { id: oldId, name: oldPlayer.name });
      }
    }

    const player = {
      id: socket.id,
      name: playerName,
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

    // Kirim snapshot dunia ke pemain yang baru masuk (pastikan tidak memuat self atau duplikat)
    socket.emit('world:init', {
      selfId: socket.id,
      selfPlayer: player,
      players: Array.from(players.values()).filter(p => p.id !== socket.id && p.name.toLowerCase() !== playerName.toLowerCase()),
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
    if (!data || typeof data.text !== 'string' || !data.text.trim()) return;

    let player = players.get(socket.id);
    if (!player) {
      player = {
        id: socket.id,
        name: (data.senderName || `Pemain_${socket.id.substring(0, 4)}`).trim(),
        role: data.senderRole || 'player',
        isSuperAdmin: Boolean(data.isSuperAdmin || data.senderName?.toUpperCase() === 'RADEN'),
      };
      players.set(socket.id, player);
    }

    const trimmedText = data.text.trim();

    // Perintah khusus Super Admin /announce
    if (player.isSuperAdmin && trimmedText.startsWith('/announce ')) {
      const announcement = trimmedText.replace('/announce ', '').trim();
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
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: socket.id,
      senderName: player.name || data.senderName || 'Petualang',
      senderRole: player.role || data.senderRole || 'player',
      isSuperAdmin: Boolean(player.isSuperAdmin || data.isSuperAdmin || player.name?.toUpperCase() === 'RADEN'),
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    io.emit('chat:broadcast', chatPacket);
  });

  // 4. Proximity Voice Chat stream (audio packets)
  socket.on('voice:chunk', (data) => {
    const player = players.get(socket.id);
    if (!player || !data || !data.audio) return;

    socket.broadcast.emit('voice:stream', {
      senderId: socket.id,
      senderName: player.name,
      x: typeof data.x === 'number' ? data.x : player.x,
      y: typeof data.y === 'number' ? data.y : player.y,
      audio: data.audio,
    });
  });

  // Indikator visual ketika pemain sedang berbicara
  socket.on('voice:speaking', (data) => {
    socket.broadcast.emit('voice:speaking', {
      senderId: socket.id,
      isSpeaking: !!data?.isSpeaking,
    });
  });

  // 5. Event pemain disconnect
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      console.log(`[Player] ${player.name} terputus. Sisa online: ${players.size - 1}`);
      players.delete(socket.id);
      io.emit('player:left', { id: socket.id, name: player.name });
    }
  });

  // 5. Event reaksi ekspresi wajah pemain
  socket.on('player:expression', (data) => {
    socket.broadcast.emit('player:expression', {
      id: socket.id,
      type: data.type
    });
  });
});

// Catatan: Monster dihilangkan sesuai permintaan pengguna, open world diisi oleh NPC interaktif


httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🎮 RadenWorld Game Server (WebSocket)`);
  console.log(`🚀 Berjalan di port: http://localhost:${PORT}`);
  console.log(`🌐 Batas Open World: ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  console.log(`=========================================`);
});
