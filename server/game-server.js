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

import { createServer, request as httpRequest } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3001;
const LARAVEL_PORT = process.env.LARAVEL_PORT || 8000;

// HTTP Server gabungan: Melayani WebSocket Socket.io sekaligus meneruskan request web ke Laravel (port 8000)
// Memungkinkan tunneling online 100% mulus lewat single port ngrok
const httpServer = createServer((req, res) => {
  if (req.url && req.url.startsWith('/socket.io/')) {
    return;
  }

  const proxyReq = httpRequest(
    {
      hostname: '127.0.0.1',
      port: LARAVEL_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: req.headers.host || `127.0.0.1:${LARAVEL_PORT}`,
        'x-forwarded-host': req.headers.host,
        'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'http',
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway: Laravel is not responding on port 8000');
  });

  req.pipe(proxyReq, { end: true });
});

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
    const defaultX = (typeof data?.x === 'number' && !isNaN(data.x)) ? data.x : 4800;
    const defaultY = (typeof data?.y === 'number' && !isNaN(data.y)) ? data.y : 4860;
    const defaultDir = data?.direction || 'down';

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

    const initialRoom = data?.room || 'world';
    socket.join(initialRoom);

    const player = {
      id: socket.id,
      name: playerName,
      room: initialRoom,
      role: isSuperAdmin ? 'super_admin' : (data.role || 'player'),
      isSuperAdmin: isSuperAdmin,
      avatar: data.avatar || {
        gender: 'male',
        skinColor: '#fed7aa',
        shirtColor: '#2563eb',
        pantsColor: '#1e293b',
        hatType: 'none',
      },
      gold: typeof data.gold === 'number' ? data.gold : (isSuperAdmin ? 999999 : 2500),
      diamonds: typeof data.diamonds === 'number' ? data.diamonds : (isSuperAdmin ? 99999 : 50),
      x: defaultX,
      y: defaultY,
      direction: defaultDir,
      isMoving: false,
      hp: isSuperAdmin ? 9999 : 100,
      maxHp: isSuperAdmin ? 9999 : 100,
      level: isSuperAdmin ? 99 : 1,
    };

    players.set(socket.id, player);

    // Kirim snapshot pemain yang ada di room ini saja
    socket.emit('world:init', {
      selfId: socket.id,
      selfPlayer: player,
      room: initialRoom,
      players: Array.from(players.values()).filter(p => p.id !== socket.id && p.room === initialRoom && p.name.toLowerCase() !== playerName.toLowerCase()),
      monsters: monsters,
      worldBounds: { width: WORLD_WIDTH, height: WORLD_HEIGHT }
    });

    // Siarkan ke seluruh pemain lain di room yang sama
    socket.to(initialRoom).emit('player:joined', player);

    console.log(`[Player] ${player.name} (${player.avatar.gender}) [ROLE: ${player.role}] [ROOM: ${initialRoom}] pos=(${player.x}, ${player.y}) bergabung. Online: ${players.size}`);
  });

  // 2. Event perpindahan room antar-area (World, Gedung SD, SMP, SMA, Rumah Pribadi, Admin Portal)
  socket.on('player:switch_room', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const oldRoom = player.room || 'world';
    const newRoom = data?.room || 'world';

    if (typeof data?.x === 'number' && !isNaN(data.x)) player.x = data.x;
    if (typeof data?.y === 'number' && !isNaN(data.y)) player.y = data.y;
    if (data?.direction) player.direction = data.direction;
    player.isMoving = false;

    if (oldRoom !== newRoom) {
      console.log(`[Room] ${player.name} (${socket.id}) berpindah dari [${oldRoom}] ke [${newRoom}]`);

      // Tinggalkan room lama dan beri tahu pemain di room lama bahwa karakter ini pergi
      socket.leave(oldRoom);
      socket.to(oldRoom).emit('player:left', { id: socket.id, name: player.name });

      player.room = newRoom;

      // Bergabung ke socket.io room baru
      socket.join(newRoom);

      // Siarkan ke pemain di room tujuan bahwa pemain baru telah masuk
      socket.to(newRoom).emit('player:joined', player);
    }

    // SELALU kirim daftar pemain yang sudah ada di room tujuan kepada pemain yang baru masuk / re-enter
    const playersInNewRoom = Array.from(players.values()).filter(p => p.id !== socket.id && p.room === newRoom && p.name.toLowerCase() !== player.name.toLowerCase());
    socket.emit('room:players', {
      room: newRoom,
      players: playersInNewRoom
    });
  });

  // Event permintaan daftar pemain aktif dalam room (dipanggil saat scene baru mount atau refresh)
  socket.on('room:request_players', () => {
    const player = players.get(socket.id);
    if (!player) return;
    const currentRoom = player.room || 'world';
    const playersInRoom = Array.from(players.values()).filter(p => p.id !== socket.id && p.room === currentRoom && p.name.toLowerCase() !== player.name.toLowerCase());
    socket.emit('room:players', {
      room: currentRoom,
      players: playersInRoom
    });
  });

  // 3. Event pergerakan posisi pemain (disiarkan hanya ke pemain di room yang sama)
  socket.on('player:move', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    if (typeof data.x === 'number' && !isNaN(data.x)) player.x = data.x;
    if (typeof data.y === 'number' && !isNaN(data.y)) player.y = data.y;
    if (data.direction) player.direction = data.direction;
    player.isMoving = !!data.isMoving;

    const currentRoom = player.room || 'world';
    socket.to(currentRoom).emit('player:moved', {
      id: socket.id,
      x: player.x,
      y: player.y,
      direction: player.direction,
      isMoving: player.isMoving,
      role: player.role,
      isSuperAdmin: player.isSuperAdmin
    });
  });

  // 4. Event pesan obrolan (chat)
  socket.on('chat:message', (data) => {
    if (!data || typeof data.text !== 'string' || !data.text.trim()) return;

    let player = players.get(socket.id);
    if (!player) {
      player = {
        id: socket.id,
        name: (data.senderName || `Pemain_${socket.id.substring(0, 4)}`).trim(),
        room: 'world',
        role: data.senderRole || 'player',
        isSuperAdmin: Boolean(data.isSuperAdmin || data.senderName?.toUpperCase() === 'RADEN'),
      };
      players.set(socket.id, player);
    }

    const trimmedText = data.text.trim();

    // Perintah khusus Super Admin /announce (global ke semua room)
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

    // Chat disiarkan ke pemain di room yang sama
    const currentRoom = player.room || 'world';
    io.to(currentRoom).emit('chat:broadcast', chatPacket);
  });

  // 5. Proximity Voice Chat stream (audio packets hanya untuk pemain di room yang sama)
  socket.on('voice:chunk', (data) => {
    const player = players.get(socket.id);
    if (!player || !data || !data.audio) return;
    const currentRoom = player.room || 'world';

    socket.to(currentRoom).emit('voice:stream', {
      senderId: socket.id,
      senderName: player.name,
      x: typeof data.x === 'number' ? data.x : player.x,
      y: typeof data.y === 'number' ? data.y : player.y,
      audio: data.audio,
    });
  });

  // Indikator visual ketika pemain sedang berbicara
  socket.on('voice:speaking', (data) => {
    const player = players.get(socket.id);
    const currentRoom = player?.room || 'world';
    socket.to(currentRoom).emit('voice:speaking', {
      senderId: socket.id,
      isSpeaking: !!data?.isSpeaking,
    });
  });

  // 6. Event pemain disconnect
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      const currentRoom = player.room || 'world';
      console.log(`[Player] ${player.name} terputus dari room [${currentRoom}]. Sisa online: ${players.size - 1}`);
      players.delete(socket.id);
      socket.to(currentRoom).emit('player:left', { id: socket.id, name: player.name });
    }
  });

  // 7. Event reaksi ekspresi wajah pemain
  socket.on('player:expression', (data) => {
    const player = players.get(socket.id);
    const currentRoom = player?.room || 'world';
    socket.to(currentRoom).emit('player:expression', {
      id: socket.id,
      type: data.type
    });
  });

  // 7b. Event lompat pemain (Multiplayer Jump Sync)
  socket.on('player:jump', (data) => {
    const player = players.get(socket.id);
    const currentRoom = player?.room || 'world';
    socket.to(currentRoom).emit('player:jumped', {
      id: socket.id,
      jumpCount: data?.jumpCount || 1,
      x: typeof data?.x === 'number' ? data.x : player?.x,
      y: typeof data?.y === 'number' ? data.y : player?.y,
    });
  });

  // 8. Event status AFK pemain
  socket.on('player:afk', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    player.isAfk = !!data?.isAfk;
    player.durationSeconds = data?.durationSeconds || 0;
    const currentRoom = player.room || 'world';
    socket.to(currentRoom).emit('player:afk', {
      id: socket.id,
      isAfk: player.isAfk,
      durationSeconds: player.durationSeconds
    });
  });

  // 7. Event Permintaan Pertemanan (Friend Request)
  socket.on('friend:request', (data) => {
    const sender = players.get(socket.id);
    const senderName = data?.senderName || sender?.name || 'Petualang';
    const senderAvatar = data?.senderAvatar || sender?.avatar;
    const senderLevel = data?.senderLevel || sender?.level || 1;
    const senderRole = data?.senderRole || sender?.role || 'player';

    console.log(`[Friend] Permintaan pertemanan dari "${senderName}" (${socket.id}) ke targetId="${data?.targetId}", targetName="${data?.targetName}"`);

    // 1. Cari socket tujuan: coba via targetId terlebih dahulu
    let targetSocketId = null;
    if (data?.targetId && io.sockets.sockets.has(data.targetId)) {
      targetSocketId = data.targetId;
    }

    // 2. Jika tidak ditemukan via socketId (misal client reconnect), cari berdasarkan nama pemain
    if (!targetSocketId && data?.targetName) {
      const targetLower = data.targetName.trim().toLowerCase();
      for (const [sId, p] of players.entries()) {
        if (p.name && p.name.trim().toLowerCase() === targetLower && io.sockets.sockets.has(sId)) {
          targetSocketId = sId;
          break;
        }
      }
    }

    if (!targetSocketId) {
      console.warn(`[Friend] Gagal mengirim: target "${data?.targetName}" (id: ${data?.targetId}) tidak aktif / tidak ditemukan.`);
      // Kirim notifikasi sistem kembali ke pengirim
      socket.emit('chat:broadcast', {
        id: `sys_err_${Date.now()}`,
        senderId: 'SYSTEM',
        senderName: 'SISTEM',
        senderRole: 'system',
        isSuperAdmin: false,
        text: `⚠️ Pemain ${data?.targetName || 'tujuan'} sedang tidak aktif atau terputus.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    const packet = {
      id: `freq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromId: socket.id,
      fromName: senderName,
      fromAvatar: senderAvatar,
      fromLevel: senderLevel,
      fromRole: senderRole,
      timestamp: Date.now(),
    };

    console.log(`[Friend] Mengirim notifikasi friend:request_received ke target socket ${targetSocketId} (${data?.targetName})`);
    io.to(targetSocketId).emit('friend:request_received', packet);
  });

  // 8. Event Respon Permintaan Pertemanan (Terima / Tolak / Timeout)
  socket.on('friend:response', (data) => {
    const responder = players.get(socket.id);
    const responderName = data?.responderName || responder?.name || 'Teman';

    console.log(`[Friend] Respon pertemanan dari "${responderName}": accepted=${data?.accepted} untuk requesterId="${data?.requesterId}", requesterName="${data?.requesterName}"`);

    // Cari socket pemohon: cek via requesterId terlebih dahulu
    let requesterSocketId = null;
    if (data?.requesterId && io.sockets.sockets.has(data.requesterId)) {
      requesterSocketId = data.requesterId;
    }

    // Jika tidak ditemukan via socket ID, cari via nama pemohon
    if (!requesterSocketId && data?.requesterName) {
      const requesterLower = data.requesterName.trim().toLowerCase();
      for (const [sId, p] of players.entries()) {
        if (p.name && p.name.trim().toLowerCase() === requesterLower && io.sockets.sockets.has(sId)) {
          requesterSocketId = sId;
          break;
        }
      }
    }

    if (!requesterSocketId) {
      console.warn(`[Friend] Pemohon "${data?.requesterName}" (id: ${data?.requesterId}) tidak ditemukan atau sudah logout.`);
      return;
    }

    console.log(`[Friend] Mengirim hasil friend:response_result ke socket ${requesterSocketId}`);
    io.to(requesterSocketId).emit('friend:response_result', {
      fromId: socket.id,
      fromName: responderName,
      accepted: !!data?.accepted
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
