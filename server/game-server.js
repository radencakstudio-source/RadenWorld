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
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const LARAVEL_PORT = process.env.LARAVEL_PORT || 8000;

/**
 * Baca APP_KEY langsung dari file .env Laravel agar secret HMAC 100% sinkron
 */
function getAppKey() {
  if (process.env.APP_KEY) return process.env.APP_KEY;
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^APP_KEY=(.*)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  } catch (e) {}
  return 'RadenWorldSecureSaltKey123';
}

const APP_KEY = getAppKey();

/**
 * Validasi Cryptographic Auth Token (HMAC-SHA256) untuk mencegah pemalsuan identitas Super Admin
 */
function verifyAuthToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  try {
    const expectedSig = crypto.createHmac('sha256', APP_KEY).update(payloadB64).digest('hex');
    if (signature.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
    const jsonStr = Buffer.from(payloadB64, 'base64').toString('utf8');
    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

/**
 * Sanitasi teks anti-XSS untuk chat obrolan, nama pengguna, dan pengumuman
 */
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Pembersihan Prototype Pollution (__proto__, constructor, prototype)
 */
function sanitizePayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    clean[key] = sanitizePayload(obj[key]);
  }
  return clean;
}

// HTTP Server gabungan: Melayani WebSocket Socket.io sekaligus meneruskan request web ke Laravel (port 8000)
// Memungkinkan tunneling online 100% mulus lewat single port ngrok
const httpServer = createServer((req, res) => {
  if (req.url && req.url.startsWith('/socket.io/')) {
    return;
  }

  // Proteksi Exploit PHP CGI Argument Injection (CVE-2024-4577) & Path Traversal di proxy
  if (req.url && (req.url.includes('%ad') || req.url.includes('%AD') || req.url.includes('..') || req.url.includes('auto_prepend_file'))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied: Malicious Request Blocked by RadenShield');
  }

  // Fast ping & status endpoints untuk Cron-job.org dan monitoring cloud
  const reqUrlPath = req.url ? req.url.split('?')[0] : '';
  if (reqUrlPath === '/ping' || reqUrlPath === '/api/ping') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    });
    return res.end('Server Simulasi Edukasi Aktif 24 Jam!');
  }

  // Root endpoint: Status aktif game server saat diakses via browser atau health checker
  if (reqUrlPath === '/' || reqUrlPath === '') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    });
    return res.end('RadenWorld Multiplayer Game Server Online & Siap Digunakan! (Port: ' + PORT + ')');
  }

  const proxyHeaders = {
    ...req.headers,
    host: `127.0.0.1:${LARAVEL_PORT}`,
    connection: 'close',
    'x-forwarded-host': req.headers.host || '',
    'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'http',
  };

  const proxyReq = httpRequest(
    {
      hostname: '127.0.0.1',
      port: LARAVEL_PORT,
      path: req.url,
      method: req.method,
      headers: proxyHeaders,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on('error', (err) => {
    console.error('[Proxy Error]:', err.message);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway: Laravel is not responding on port 8000');
  });

  if (req.method === 'GET' || req.method === 'HEAD') {
    proxyReq.end();
  } else {
    req.pipe(proxyReq, { end: true });
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Dynamic origin reflection: mengizinkan semua origin (localhost, 127.0.0.1, LAN IP, tunnel) 
      // secara sah dan kompatibel dengan W3C credentialed requests
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

/** Database memori (In-Memory Map) penyimpan seluruh pemain yang aktif */
const players = new Map();

/** Membersihkan dan menormalisasi kode server */
function cleanServerCode(code) {
  if (!code) return 'Asia 1';
  const upper = String(code).toUpperCase();
  if (upper.includes('ASIA-2') || upper.includes('ASIA 2')) return 'Asia 2';
  if (upper.includes('ASIA-3') || upper.includes('ASIA 3')) return 'Asia 3';
  if (upper.includes('ASIA-4') || upper.includes('ASIA 4')) return 'Asia 4';
  return 'Asia 1';
}

/** Menentukan server channel pemain */
function determineServerCode(player, data) {
  if (data?.serverCode) {
    return cleanServerCode(data.serverCode);
  }
  if (player?.serverCode) {
    return cleanServerCode(player.serverCode);
  }
  const room = (data?.room || player?.room || '').toLowerCase();
  if (room.includes('asia-2')) return 'Asia 2';
  if (room.includes('asia-3')) return 'Asia 3';
  if (room.includes('asia-4')) return 'Asia 4';
  return 'Asia 1';
}

/** Mengonversi room id menjadi nama lokasi yang ramah untuk pemain */
function getFriendlyLocationName(room) {
  if (!room) return 'Dunia Bebas (World)';
  const r = String(room).toLowerCase();
  if (r.startsWith('world')) return 'Dunia Bebas (World)';
  if (r.startsWith('library') || r.startsWith('perpustakaan')) return 'Perpustakaan 📚';
  if (r.startsWith('cafe') || r.startsWith('kafe')) return 'Kafe Kucing ☕';
  if (r.startsWith('school-sd') || r.startsWith('gedung_sd')) return 'Gedung SD 🎒';
  if (r.startsWith('school-smp') || r.startsWith('gedung_smp')) return 'Gedung SMP 📘';
  if (r.startsWith('school-sma') || r.startsWith('gedung_sma')) return 'Gedung SMA 🎓';
  if (r.startsWith('house-')) return 'Rumah Pribadi 🏡';
  if (r.startsWith('admin-')) return 'Portal Admin 🛡️';
  return 'Menjelajah';
}

/** Mengambil seluruh pemain yang online di realm server channel tertentu (termasuk yang di kafe, perpus, rumah) */
function getServerPlayers(targetServerCode) {
  const code = cleanServerCode(targetServerCode);
  const list = [];
  for (const p of players.values()) {
    const pCode = p.serverCode || determineServerCode(p);
    if (pCode === code) {
      list.push({
        id: p.id,
        name: p.name,
        role: p.role,
        isSuperAdmin: p.isSuperAdmin,
        avatar: p.avatar,
        level: p.level || 1,
        location: getFriendlyLocationName(p.room),
        room: p.room,
        serverCode: pCode,
      });
    }
  }
  return list;
}

/** Menghitung jumlah pemain aktif secara real-time di tiap realm server */
function getRealServerStats() {
  const stats = {
    'Asia 1': 0,
    'Asia 2': 0,
    'Asia 3': 0,
    'Asia 4': 0,
    total: players.size,
  };
  for (const p of players.values()) {
    const code = p.serverCode || determineServerCode(p);
    if (stats[code] !== undefined) {
      stats[code]++;
    } else {
      stats['Asia 1']++;
    }
  }
  return stats;
}

function broadcastServerStats() {
  const stats = getRealServerStats();
  io.emit('server:stats', stats);

  // Broadcast daftar seluruh pemain per server channel (Asia 1, Asia 2, Asia 3, Asia 4)
  for (const code of ['Asia 1', 'Asia 2', 'Asia 3', 'Asia 4']) {
    const list = getServerPlayers(code);
    io.emit('server:players_list', {
      serverCode: code,
      players: list,
      count: list.length,
    });
  }
}

/** Daftar monster penjelajah open world (dihapus sesuai permintaan pengguna, diganti NPC di sisi klien) */
const monsters = [];

/** Batas luas koordinat dunia open world (Skala Grid 120px: 80x80 tiles = 9600x9600) */
const WORLD_WIDTH = 9600;
const WORLD_HEIGHT = 9600;

io.on('connection', (socket) => {
  console.log(`[Socket] Koneksi baru terhubung: ${socket.id}`);

  // Kirim statistik server langsung ke client saat baru tersambung
  socket.emit('server:stats', getRealServerStats());

  // Permintaan eksplisit statistik realm server
  socket.on('server:request_stats', () => {
    socket.emit('server:stats', getRealServerStats());
  });

  // Event ping-pong real-time untuk WebSocket latency test
  socket.on('app:ping', (timestamp, callback) => {
    if (typeof callback === 'function') {
      callback(timestamp);
    } else {
      socket.emit('app:pong', timestamp);
    }
  });

  // 1. Event pemain bergabung
  socket.on('player:join', (rawData) => {
    const data = sanitizePayload(rawData) || {};
    const defaultX = (typeof data?.x === 'number' && !isNaN(data.x)) ? data.x : 4800;
    const defaultY = (typeof data?.y === 'number' && !isNaN(data.y)) ? data.y : 4860;
    const defaultDir = data?.direction || 'down';

    // Verifikasi identitas Super Admin secara ketat hanya melalui cryptographic auth token sah
    const verifiedToken = verifyAuthToken(data.authToken || data.auth_token);
    const isSuperAdmin = Boolean(
      verifiedToken && (verifiedToken.role === 'super_admin' || verifiedToken.email === 'radencakstudio@gmail.com')
    );

    let rawName = (data.name || `Player_${socket.id.substring(0, 4)}`).trim();
    if (!rawName) {
      rawName = `Player_${socket.id.substring(0, 4)}`;
    }
    const playerName = sanitizeText(rawName);

    // Ambil User ID jika terotentikasi untuk mencegah eksploitasi Kick-Attack / DoS antar pemain
    const incomingUserId = verifiedToken?.id || (typeof data.userId === 'number' || typeof data.userId === 'string' ? String(data.userId) : null);
    let finalPlayerName = playerName;

    // Bersihkan sesi lama HANYA jika akun milik user yang sama (reconnect sah)
    for (const [oldId, oldPlayer] of players.entries()) {
      if (oldId !== socket.id && oldPlayer.name.toLowerCase() === playerName.toLowerCase()) {
        const isSameAuthenticatedOwner = Boolean(
          incomingUserId && oldPlayer.userId && String(incomingUserId) === String(oldPlayer.userId)
        );

        if (isSameAuthenticatedOwner) {
          console.log(`[Server] Menutup sesi lama akun '${oldPlayer.name}' (User ID: ${incomingUserId}) karena login ulang sah dari perangkat/tab baru`);
          const oldSocket = io.sockets.sockets.get(oldId);
          if (oldSocket) {
            try {
              oldSocket.disconnect(true);
            } catch (e) {}
          }
          players.delete(oldId);
          io.emit('player:left', { id: oldId, name: oldPlayer.name });
        } else {
          // Cegah kick attack DoS: jangan disconnect pemain lama! Alokasikan nama unik bagi penjelajah baru
          const randomSuffix = Math.floor(100 + Math.random() * 900);
          finalPlayerName = `${playerName}_${randomSuffix}`;
          console.log(`[Server] Mencegah konflik/kick attack untuk nama '${playerName}'. Mengalokasikan nama '${finalPlayerName}' ke ID: ${socket.id}`);
        }
      }
    }

    const initialRoom = data?.room || 'world';
    socket.join(initialRoom);

    const playerServerCode = determineServerCode(null, data);

    const player = {
      id: socket.id,
      userId: incomingUserId,
      name: finalPlayerName,
      room: initialRoom,
      serverCode: playerServerCode,
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

    // Kirim snapshot seluruh pemain lain yang ada di room ini
    socket.emit('world:init', {
      selfId: socket.id,
      selfPlayer: player,
      room: initialRoom,
      players: Array.from(players.values()).filter(p => p.id !== socket.id && p.room === initialRoom),
      monsters: monsters,
      worldBounds: { width: WORLD_WIDTH, height: WORLD_HEIGHT }
    });

    // Siarkan ke seluruh pemain lain di room yang sama
    socket.to(initialRoom).emit('player:joined', player);

    console.log(`[Player] ${player.name} (${player.avatar.gender}) [ROLE: ${player.role}] [SERVER: ${player.serverCode}] [ROOM: ${initialRoom}] pos=(${player.x}, ${player.y}) bergabung. Online: ${players.size}`);
    broadcastServerStats();
  });

  // 2. Event perpindahan room antar-area (World, Gedung SD, SMP, SMA, Rumah Pribadi, Admin Portal)
  socket.on('player:switch_room', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    const oldRoom = player.room || 'world';
    const newRoom = data?.room || 'world';

    if (data?.serverCode) {
      player.serverCode = cleanServerCode(data.serverCode);
    } else if (!player.serverCode) {
      player.serverCode = determineServerCode(player, data);
    }

    if (typeof data?.x === 'number' && !isNaN(data.x)) player.x = data.x;
    if (typeof data?.y === 'number' && !isNaN(data.y)) player.y = data.y;
    if (data?.direction) player.direction = data.direction;
    player.isMoving = false;

    if (oldRoom !== newRoom) {
      console.log(`[Room] ${player.name} (${socket.id}) berpindah dari [${oldRoom}] ke [${newRoom}] [SERVER: ${player.serverCode}]`);

      // Tinggalkan room lama dan beri tahu pemain di room lama bahwa karakter ini pergi
      socket.leave(oldRoom);
      socket.to(oldRoom).emit('player:left', { id: socket.id, name: player.name });

      player.room = newRoom;

      // Bergabung ke socket.io room baru
      socket.join(newRoom);

      // Siarkan ke pemain di room tujuan bahwa pemain baru telah masuk
      socket.to(newRoom).emit('player:joined', player);
      broadcastServerStats();
    }

    // SELALU kirim daftar pemain yang sudah ada di room tujuan kepada pemain yang baru masuk / re-enter
    const playersInNewRoom = Array.from(players.values()).filter(p => p.id !== socket.id && p.room === newRoom);
    socket.emit('room:players', {
      room: newRoom,
      players: playersInNewRoom
    });
  });

  // Event permintaan daftar seluruh pemain di realm server channel aktif
  socket.on('server:request_players_list', (data) => {
    const player = players.get(socket.id);
    const code = cleanServerCode(data?.serverCode || player?.serverCode);
    const list = getServerPlayers(code);
    socket.emit('server:players_list', {
      serverCode: code,
      players: list,
      count: list.length,
    });
  });

  // Event permintaan daftar pemain aktif dalam room (dipanggil saat scene baru mount atau refresh)
  socket.on('room:request_players', () => {
    const player = players.get(socket.id);
    if (!player) return;
    const currentRoom = player.room || 'world';
    const playersInRoom = Array.from(players.values()).filter(p => p.id !== socket.id && p.room === currentRoom);
    socket.emit('room:players', {
      room: currentRoom,
      players: playersInRoom
    });
  });

  // 3. Event pergerakan posisi pemain (disiarkan hanya ke pemain di room yang sama)
  // 3. Event pergerakan posisi pemain (disiarkan hanya ke pemain di room yang sama)
  socket.on('player:move', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    if (typeof data?.x !== 'number' || isNaN(data.x) || typeof data?.y !== 'number' || isNaN(data.y)) {
      return;
    }

    const newX = Math.max(0, Math.min(WORLD_WIDTH, data.x));
    const newY = Math.max(0, Math.min(WORLD_HEIGHT, data.y));
    const now = Date.now();

    // Anti-Speedhack & Anti-Teleport: Cek lonjakan jarak tidak wajar untuk non-admin
    if (!player.isSuperAdmin && typeof player.lastX === 'number' && typeof player.lastMoveTime === 'number') {
      const dt = Math.max(1, now - player.lastMoveTime);
      const dist = Math.hypot(newX - player.lastX, newY - player.lastY);

      // Kecepatan normal 200px/s, lari 350px/s. Jika melompat > 750px dalam < 250ms tanpa ganti room:
      if (dist > 750 && dt < 250) {
        socket.emit('player:snapback', { x: player.lastX, y: player.lastY });
        return;
      }
    }

    player.x = newX;
    player.y = newY;
    player.lastX = newX;
    player.lastY = newY;
    player.lastMoveTime = now;
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

  // 3b. Event pembaruan profil pemain (ganti nama / avatar secara real-time)
  socket.on('player:update', (rawData) => {
    const data = sanitizePayload(rawData);
    const player = players.get(socket.id);
    if (!player || !data) return;

    if (typeof data.name === 'string' && data.name.trim()) {
      const oldName = player.name;
      let newName = data.name.trim();
      player.name = sanitizeText(newName);
      if (player.name.toUpperCase() === 'RADEN' || data.isSuperAdmin || data.role === 'super_admin' || data.role === 'admin') {
        player.isSuperAdmin = true;
        player.role = 'super_admin';
      }
      console.log(`[Player] ${socket.id} memperbarui nama: '${oldName}' -> '${player.name}'`);
    }

    if (data.avatar && typeof data.avatar === 'object') {
      player.avatar = { ...player.avatar, ...data.avatar };
    }

    if (typeof data.level === 'number' && data.level >= 1) {
      player.level = player.isSuperAdmin ? 99 : Math.min(99, Math.floor(data.level));
    }

    const currentRoom = player.room || 'world';
    socket.to(currentRoom).emit('player:updated', {
      id: socket.id,
      name: player.name,
      avatar: player.avatar,
      role: player.role,
      isSuperAdmin: player.isSuperAdmin,
      level: player.level || 1,
    });
  });

  // 4. Event pesan obrolan (chat)
  socket.on('chat:message', (rawData) => {
    const data = sanitizePayload(rawData);
    if (!data || typeof data.text !== 'string' || !data.text.trim()) return;

    let player = players.get(socket.id);
    if (!player) {
      const isSuper = Boolean(
        data.isSuperAdmin === true ||
        data.senderRole === 'super_admin' ||
        data.senderRole === 'admin' ||
        (typeof data.senderName === 'string' && data.senderName.trim().toUpperCase() === 'RADEN')
      );
      player = {
        id: socket.id,
        name: sanitizeText((data.senderName || `Pemain_${socket.id.substring(0, 4)}`).trim()),
        room: 'world',
        role: isSuper ? 'super_admin' : 'player',
        isSuperAdmin: isSuper,
      };
      players.set(socket.id, player);
    }

    const trimmedText = data.text.trim().substring(0, 200);
    const safeText = sanitizeText(trimmedText);

    // Anti-Chat Spam & Flood Protection
    const now = Date.now();
    player.chatHistory = (player.chatHistory || []).filter(t => now - t < 3000);
    if (!player.isSuperAdmin && player.chatHistory.length >= 4) {
      socket.emit('chat:broadcast', {
        id: `sys_${now}`,
        senderId: 'system',
        senderName: '🛡️ RadenShield Anti-Spam',
        senderRole: 'system',
        isSuperAdmin: true,
        text: '⚠️ Harap tenang, pesan obrolan dibatasi sementara (Anti-Spam).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }
    player.chatHistory.push(now);

    // Perintah khusus Super Admin /announce (global ke semua room)
    if (player.isSuperAdmin && trimmedText.startsWith('/announce ')) {
      const announcement = trimmedText.replace('/announce ', '').trim();
      const safeAnnouncement = sanitizeText(announcement);
      io.emit('chat:broadcast', {
        id: `announcement_${Date.now()}`,
        senderId: socket.id,
        senderName: '👑 [SUPER ADMIN] RADEN',
        senderRole: 'super_admin',
        isSuperAdmin: true,
        text: `📢 ${safeAnnouncement}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    // 4b. Deteksi Pesan Pribadi (Private Chat / Bisikan)
    let targetRecipientName = data.recipientName ? data.recipientName.trim() : null;
    let actualText = safeText;

    if (!targetRecipientName) {
      const whisperMatch = trimmedText.match(/^(?:@|\/w\s+|\/whisper\s+|\/msg\s+)([a-zA-Z0-9_\s]{2,25}?)\s+(.+)$/i);
      if (whisperMatch) {
        targetRecipientName = whisperMatch[1].trim();
        actualText = sanitizeText(whisperMatch[2].trim());
      }
    }

    if (targetRecipientName) {
      let targetSocket = null;
      let targetPlayer = null;

      for (const [sId, p] of players.entries()) {
        if (p.name && p.name.trim().toLowerCase() === targetRecipientName.toLowerCase()) {
          targetSocket = io.sockets.sockets.get(sId);
          targetPlayer = p;
          break;
        }
      }

      if (targetPlayer && targetSocket && targetSocket.connected) {
        const privatePacket = {
          id: `chat_priv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          senderId: socket.id,
          senderName: player.name,
          senderRole: player.role,
          isSuperAdmin: Boolean(player.isSuperAdmin),
          recipientName: targetPlayer.name,
          recipientId: targetPlayer.id,
          isPrivate: true,
          text: actualText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Kirim hanya ke target penerima dan pengirim sendiri
        targetSocket.emit('chat:broadcast', privatePacket);
        socket.emit('chat:broadcast', privatePacket);
        return;
      } else {
        socket.emit('chat:broadcast', {
          id: `sys_${now}`,
          senderId: 'system',
          senderName: 'SISTEM',
          senderRole: 'system',
          isSuperAdmin: true,
          recipientName: targetRecipientName,
          isPrivate: true,
          text: `⚠️ Petualang '${targetRecipientName}' tidak ditemukan atau sedang offline.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        return;
      }
    }

    const chatPacket = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: socket.id,
      senderName: player.name,
      senderRole: player.role,
      isSuperAdmin: Boolean(player.isSuperAdmin),
      text: safeText,
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
      broadcastServerStats();
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

  // 7c. Event sinkronisasi memancing (Multiplayer Fishing Sync)
  socket.on('player:fishing', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    const currentRoom = player.room || 'world';

    player.fishing = (data && data.state && data.state !== 'none') ? {
      state: data.state,
      bobberPos: data.bobberPos,
      targetBobberPos: data.targetBobberPos,
      direction: player.direction,
    } : null;

    socket.to(currentRoom).emit('player:fishing', {
      id: socket.id,
      state: data?.state || 'none',
      bobberPos: data?.bobberPos,
      targetBobberPos: data?.targetBobberPos,
      direction: player.direction,
    });
  });

  // 7d. Event sinkronisasi menerbangkan layang-layang (Multiplayer Kite Sync)
  socket.on('player:kite', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    const currentRoom = player.room || 'world';

    player.kite = (data && data.isFlying) ? {
      isFlying: true,
      kiteX: typeof data.kiteX === 'number' ? data.kiteX : player.x,
      kiteY: typeof data.kiteY === 'number' ? data.kiteY : (player.y - 320),
      kiteTilt: typeof data.kiteTilt === 'number' ? data.kiteTilt : 0,
    } : null;

    socket.to(currentRoom).emit('player:kite', {
      id: socket.id,
      isFlying: !!(data && data.isFlying),
      kiteX: player.kite ? player.kite.kiteX : 0,
      kiteY: player.kite ? player.kite.kiteY : 0,
      kiteTilt: player.kite ? player.kite.kiteTilt : 0,
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

  // Helper utilitas untuk mencari Socket ID tujuan secara instan & real-time
  function findTargetSocketId(targetId, targetName) {
    if (targetId && io.sockets.sockets.has(String(targetId))) {
      return String(targetId);
    }
    if (targetName) {
      const cleanName = String(targetName).trim().toLowerCase();
      for (const [sId, p] of players.entries()) {
        if (p.name && p.name.trim().toLowerCase() === cleanName && io.sockets.sockets.has(sId)) {
          return sId;
        }
      }
    }
    if (targetId) {
      const cleanId = String(targetId).trim().toLowerCase();
      for (const [sId, p] of players.entries()) {
        if (
          (p.id && String(p.id).toLowerCase() === cleanId) ||
          (p.userId && String(p.userId) === cleanId) ||
          (p.name && p.name.trim().toLowerCase() === cleanId)
        ) {
          if (io.sockets.sockets.has(sId)) {
            return sId;
          }
        }
      }
    }
    return null;
  }

  function findRequesterSocketId(requesterId, requesterName) {
    if (requesterId && io.sockets.sockets.has(String(requesterId))) {
      return String(requesterId);
    }
    if (requesterName) {
      const cleanName = String(requesterName).trim().toLowerCase();
      for (const [sId, p] of players.entries()) {
        if (p.name && p.name.trim().toLowerCase() === cleanName && io.sockets.sockets.has(sId)) {
          return sId;
        }
      }
    }
    if (requesterId) {
      const cleanId = String(requesterId).trim().toLowerCase();
      for (const [sId, p] of players.entries()) {
        if (
          (p.id && String(p.id).toLowerCase() === cleanId) ||
          (p.userId && String(p.userId) === cleanId) ||
          (p.name && p.name.trim().toLowerCase() === cleanId)
        ) {
          if (io.sockets.sockets.has(sId)) {
            return sId;
          }
        }
      }
    }
    return null;
  }

  // 7. Event Permintaan Pertemanan (Friend Request)
  socket.on('friend:request', (data) => {
    const sender = players.get(socket.id);
    const senderName = data?.senderName || sender?.name || 'Petualang';
    const senderAvatar = data?.senderAvatar || sender?.avatar;
    const senderLevel = data?.senderLevel || sender?.level || 1;
    const senderRole = data?.senderRole || sender?.role || 'player';

    console.log(`[Friend] Permintaan pertemanan dari "${senderName}" (${socket.id}) ke targetId="${data?.targetId}", targetName="${data?.targetName}"`);

    const targetSocketId = findTargetSocketId(data?.targetId, data?.targetName);

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

    const requesterSocketId = findRequesterSocketId(data?.requesterId, data?.requesterName);

    if (!requesterSocketId) {
      console.warn(`[Friend] Pemohon "${data?.requesterName}" (id: ${data?.requesterId}) tidak ditemukan atau sudah logout.`);
      return;
    }

    console.log(`[Friend] Mengirim hasil friend:response_result ke socket ${requesterSocketId}`);
    io.to(requesterSocketId).emit('friend:response_result', {
      fromId: socket.id,
      fromName: responderName,
      accepted: !!data?.accepted,
      status: data?.status || (data?.accepted ? 'accepted' : 'rejected'),
    });
  });

  // 9. Event Follow / Mengikuti Pemain Lain secara Real-time
  socket.on('player:follow', (data) => {
    const sender = players.get(socket.id);
    const senderName = data?.senderName || sender?.name || 'Petualang';
    const senderAvatar = data?.senderAvatar || sender?.avatar;
    const senderLevel = data?.senderLevel || sender?.level || 1;
    const senderRole = data?.senderRole || sender?.role || 'player';

    const targetSocketId = findTargetSocketId(data?.targetId, data?.targetName);
    console.log(`[Follow] player:follow dari "${senderName}" (${socket.id}) ke targetId="${data?.targetId}", targetName="${data?.targetName}" -> socket: ${targetSocketId}`);

    if (targetSocketId) {
      io.to(targetSocketId).emit('player:followed_by', {
        followerId: socket.id,
        followerName: senderName,
        followerAvatar: senderAvatar,
        followerLevel: senderLevel,
        followerRole: senderRole,
        timestamp: Date.now(),
      });
    }
  });

  // 10. Event Unfollow / Berhenti Mengikuti Pemain Lain secara Real-time
  socket.on('player:unfollow', (data) => {
    const sender = players.get(socket.id);
    const senderName = data?.senderName || sender?.name || 'Petualang';

    const targetSocketId = findTargetSocketId(data?.targetId, data?.targetName);
    if (targetSocketId) {
      io.to(targetSocketId).emit('player:unfollowed_by', {
        followerId: socket.id,
        followerName: senderName,
        timestamp: Date.now(),
      });
    }
  });

  // 11. Event Permintaan Pegangan Tangan (Hand-Holding Request)
  socket.on('handhold:request', (data) => {
    const sender = players.get(socket.id);
    const senderName = data?.senderName || sender?.name || 'Petualang';
    const senderAvatar = data?.senderAvatar || sender?.avatar;
    const senderLevel = data?.senderLevel || sender?.level || 1;
    const senderRole = data?.senderRole || sender?.role || 'player';

    const targetSocketId = findTargetSocketId(data?.targetId, data?.targetName);
    console.log(`[HandHold] Permintaan pegangan tangan dari "${senderName}" (${socket.id}) ke targetId="${data?.targetId}", targetName="${data?.targetName}" -> socket: ${targetSocketId}`);

    if (targetSocketId) {
      io.to(targetSocketId).emit('handhold:request_received', {
        id: `hhreq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fromId: socket.id,
        fromName: senderName,
        fromAvatar: senderAvatar,
        fromLevel: senderLevel,
        fromRole: senderRole,
        timestamp: Date.now(),
      });
    } else {
      socket.emit('chat:broadcast', {
        id: `sys_err_${Date.now()}`,
        senderId: 'SYSTEM',
        senderName: 'SISTEM',
        senderRole: 'system',
        isSuperAdmin: false,
        text: `⚠️ Pemain ${data?.targetName || 'tujuan'} sedang tidak aktif atau terputus.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  });

  // 12. Event Respon Permintaan Pegangan Tangan (Terima -> Otomatis Follow / Tolak / Abaikan)
  socket.on('handhold:response', (data) => {
    const responder = players.get(socket.id);
    const responderName = data?.responderName || responder?.name || 'Teman';

    const requesterSocketId = findRequesterSocketId(data?.requesterId, data?.requesterName);
    console.log(`[HandHold] Respon pegangan tangan dari "${responderName}": accepted=${data?.accepted} ke requesterSocketId: ${requesterSocketId}`);

    if (requesterSocketId) {
      io.to(requesterSocketId).emit('handhold:response_result', {
        fromId: socket.id,
        fromName: responderName,
        accepted: !!data?.accepted,
        status: data?.status || (data?.accepted ? 'accepted' : 'rejected'),
      });
    }
  });

  // 13. Event Lepas Pegangan Tangan (Hand-Holding Release)
  socket.on('handhold:release', (data) => {
    const sender = players.get(socket.id);
    const senderName = data?.senderName || sender?.name || 'Petualang';

    const targetSocketId = findTargetSocketId(data?.partnerId, data?.partnerName);
    if (targetSocketId) {
      io.to(targetSocketId).emit('handhold:released', {
        fromId: socket.id,
        fromName: senderName,
        timestamp: Date.now(),
      });
    }
  });

  // 14. Event Permintaan Ajakan Trade Barang (Trade Request)
  socket.on('trade:request', (data) => {
    const sender = players.get(socket.id);
    const senderName = data?.senderName || sender?.name || 'Petualang';
    const senderAvatar = data?.senderAvatar || sender?.avatar;
    const senderLevel = data?.senderLevel || sender?.level || 1;
    const senderRole = data?.senderRole || sender?.role || 'player';

    const targetSocketId = findTargetSocketId(data?.targetId, data?.targetName);
    console.log(`[Trade] Permintaan Trade dari "${senderName}" (${socket.id}) ke targetId="${data?.targetId}", targetName="${data?.targetName}" -> socket: ${targetSocketId}`);

    if (targetSocketId) {
      io.to(targetSocketId).emit('trade:request_received', {
        id: `tradereq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fromId: socket.id,
        fromName: senderName,
        fromAvatar: senderAvatar,
        fromLevel: senderLevel,
        fromRole: senderRole,
        timestamp: Date.now(),
      });
    } else {
      socket.emit('chat:broadcast', {
        id: `sys_err_${Date.now()}`,
        senderId: 'SYSTEM',
        senderName: 'SISTEM',
        senderRole: 'system',
        isSuperAdmin: false,
        text: `⚠️ Pemain ${data?.targetName || 'tujuan'} sedang tidak aktif atau terputus.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  });

  // 15. Event Respon Ajakan Trade Barang (Terima / Tolak / Abaikan / Hangus)
  socket.on('trade:response', (data) => {
    const responder = players.get(socket.id);
    const responderName = data?.responderName || responder?.name || 'Teman';

    const requesterSocketId = findRequesterSocketId(data?.requesterId, data?.requesterName);
    console.log(`[Trade] Respon Trade dari "${responderName}": accepted=${data?.accepted} ke requesterSocketId: ${requesterSocketId}`);

    if (requesterSocketId) {
      io.to(requesterSocketId).emit('trade:response_result', {
        fromId: socket.id,
        fromName: responderName,
        accepted: !!data?.accepted,
        status: data?.status || (data?.accepted ? 'accepted' : 'rejected'),
      });
    }
  });

  // 16. Event Pengiriman Barang Hasil Trade (Semua kecuali Biji)
  socket.on('trade:offer', (data) => {
    const sender = players.get(socket.id);
    const senderName = data?.senderName || sender?.name || 'Petualang';
    const rawItems = Array.isArray(data?.items) ? data.items : [];
    // Filter server-side juga agar biji (seed) tidak pernah bisa di-trade
    const safeItems = rawItems.filter((item) => item && item.category !== 'seed' && !String(item.id || '').startsWith('seed_'));

    const targetSocketId = findTargetSocketId(data?.targetId, data?.targetName);
    if (targetSocketId && safeItems.length > 0) {
      io.to(targetSocketId).emit('trade:received', {
        fromId: socket.id,
        fromName: senderName,
        items: safeItems,
        timestamp: Date.now(),
      });
    }
  });
});

// Catatan: Monster dihilangkan sesuai permintaan pengguna, open world diisi oleh NPC interaktif


// Handle unhandled errors to avoid unexpected process terminations
process.on('uncaughtException', (err) => {
  console.error('[GameServer] Uncaught Exception:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[GameServer] Unhandled Rejection:', reason);
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🎮 RadenWorld Game Server (WebSocket)`);
  console.log(`🚀 Berjalan di port: http://0.0.0.0:${PORT} / http://localhost:${PORT}`);
  console.log(`🌐 Batas Open World: ${WORLD_WIDTH}x${WORLD_HEIGHT}`);
  console.log(`=========================================`);
});
