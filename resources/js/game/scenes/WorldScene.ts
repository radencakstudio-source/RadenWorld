/**
 * ============================================================================
 * FILE: resources/js/game/scenes/WorldScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene utama 2D Open World di Phaser 3 yang mengatur dunia permainan:
 * 1. Peta tanah bermotif catur (Checkerboard Dark & Light Grid) 3200x3200 pixel.
 * 2. Pemain lokal dengan avatar unik (gender, warna kulit, baju, celana, topi).
 * 3. Pemain lain di open world yang sinkron via Socket.io.
 * 4. Sistem kamera pelacak (lerp tracking) dan NPC interaktif.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { RemotePlayer } from '../entities/RemotePlayer';
import { Monster } from '../entities/Monster';
import { NetworkManager } from '../core/NetworkManager';
import { EventBus } from '../core/EventBus';
import { IPlayerData, IMonsterData, IChatMessage, IWorldInitData, IAvatarCustomization } from '../types';

export class WorldScene extends Phaser.Scene {
  private player: Player | null = null;
  private remotePlayers: Map<string, RemotePlayer> = new Map();
  private monsters: Map<string, Monster> = new Map();
  private networkManager: NetworkManager;

  public readonly worldWidth: number = 3200;
  public readonly worldHeight: number = 3200;

  private pendingPlayerName: string | null = null;
  private pendingAvatar: IAvatarCustomization | null = null;
  private spawnNearHouseDoor: boolean = false;

  // Zona Bangunan & Pintu Interaktif
  private playerHouseDoor = { x: 1520, y: 1750 };
  private blacksmithZone = { x: 1460, y: 1490 };
  private alchemistZone = { x: 1740, y: 1490 };
  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private privateRoomId: string = 'safe-01';

  constructor() {
    super({ key: 'WorldScene' });
    this.networkManager = NetworkManager.getInstance();
  }

  public init(data?: { name?: string; avatar?: IAvatarCustomization; spawnNearHouse?: boolean; privateRoomId?: string }): void {
    if (data?.name) this.pendingPlayerName = data.name;
    if (data?.avatar) this.pendingAvatar = data.avatar;
    if (data?.spawnNearHouse) this.spawnNearHouseDoor = true;
    if (data?.privateRoomId) this.privateRoomId = data.privateRoomId;
  }

  public create(): void {
    // 1. Batas fisika dunia
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // 2. Render grafis lingkungan alam dengan pola catur (Checkerboard Grid)
    this.createWorldEnvironment();

    // 3. Pasang pendengar event multiplayer
    this.setupMultiplayerListeners();

    // 4. Hubungkan sinyal dari UI React via EventBus
    EventBus.on('join-game', (userData: { name: string; avatar: IAvatarCustomization }) => {
      this.spawnLocalPlayer(userData.name, userData.avatar);
    });

    EventBus.on('send-chat', (text: string) => {
      if (this.player) {
        this.player.showSpeechBubble(text);
      }
      this.networkManager.sendChat(text);
    });

    // 5. Spawn langsung jika berpindah dari HouseScene
    if (this.pendingPlayerName && this.pendingAvatar) {
      this.spawnLocalPlayer(this.pendingPlayerName, this.pendingAvatar, this.spawnNearHouseDoor);
    }

    // 6. Tombol interaksi keyboard 'E' (abaikan jika sedang mengetik di input chat)
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    // Hubungkan klik tombol interaksi dari HUD
    EventBus.on('trigger-interaction', () => {
      this.triggerCurrentInteraction();
    });

    // Hubungkan event beralih scene (misal tombol Back browser atau Teleport Admin Portal)
    const handleSwitchScene = (data: { scene: string; privateRoomId?: string; adminToken?: string }) => {
      if (data.scene === 'HouseScene') {
        this.cameras.main.stopFollow();
        this.networkManager.disconnect();
        this.scene.start('HouseScene', {
          name: this.player?.getEntityName() || this.pendingPlayerName || 'Petualang',
          avatar: this.player?.getAvatar() || this.pendingAvatar,
          privateRoomId: data.privateRoomId || this.privateRoomId,
        });
      } else if (data.scene === 'AdminPortalScene') {
        this.cameras.main.stopFollow();
        this.networkManager.disconnect();
        this.scene.start('AdminPortalScene', {
          name: this.player?.getEntityName() || this.pendingPlayerName || 'RADEN',
          avatar: this.player?.getAvatar() || this.pendingAvatar,
          adminToken: data.adminToken || 'raden-master-key',
        });
      }
    };
    EventBus.on('switch-scene', handleSwitchScene);

    this.events.on('shutdown', () => {
      EventBus.off('switch-scene', handleSwitchScene);
      EventBus.emit('interaction-prompt', null);
    });

    EventBus.emit('game-ready');
  }

  /**
   * Menggambar tanah berpola catur (Checkerboard) gelap & terang
   */
  private createWorldEnvironment(): void {
    // 1. Buat tekstur kotak catur 2x2 (128x128 pixel, masing-masing tile 64x64)
    if (!this.textures.exists('chessboard-ground')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      const darkColor = 0x14532d;   // Hijau Tua Gelap (Kotak Gelap)
      const lightColor = 0x16a34a;  // Hijau Terang (Kotak Terang)

      // Kotak (0,0) Gelap
      g.fillStyle(darkColor, 1);
      g.fillRect(0, 0, 64, 64);

      // Kotak (1,0) Terang
      g.fillStyle(lightColor, 1);
      g.fillRect(64, 0, 64, 64);

      // Kotak (0,1) Terang
      g.fillStyle(lightColor, 1);
      g.fillRect(0, 64, 64, 64);

      // Kotak (1,1) Gelap
      g.fillStyle(darkColor, 1);
      g.fillRect(64, 64, 64, 64);

      // Garis grid batas kotak catur
      g.lineStyle(1, 0x0f291e, 0.35);
      g.strokeRect(0, 0, 64, 64);
      g.strokeRect(64, 0, 64, 64);
      g.strokeRect(0, 64, 64, 64);
      g.strokeRect(64, 64, 64, 64);

      g.generateTexture('chessboard-ground', 128, 128);
      g.destroy();
    }

    // Pasang TileSprite tanah catur melingkupi seluruh peta 3200x3200 pixel
    const ground = this.add.tileSprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      this.worldWidth,
      this.worldHeight,
      'chessboard-ground'
    );
    ground.setDepth(-100);

    const bgGraphics = this.add.graphics();

    // Plaza kota Sanctuary di pusat peta (1600, 1600)
    bgGraphics.fillStyle(0x334155, 1);
    bgGraphics.fillCircle(1600, 1600, 260);
    bgGraphics.fillStyle(0x475569, 1);
    bgGraphics.fillCircle(1600, 1600, 220);

    // Jalan batu salib (Utara-Selatan & Timur-Barat)
    bgGraphics.fillStyle(0x334155, 0.9);
    bgGraphics.fillRect(1560, 0, 80, this.worldHeight);
    bgGraphics.fillRect(0, 1560, this.worldWidth, 80);

    // Danau Biru di Timur Laut
    bgGraphics.fillStyle(0x0284c7, 0.85);
    bgGraphics.fillEllipse(2400, 800, 480, 320);
    bgGraphics.fillStyle(0x38bdf8, 0.4);
    bgGraphics.fillEllipse(2400, 800, 440, 280);

    // Telaga di Barat Daya
    bgGraphics.fillStyle(0x0284c7, 0.85);
    bgGraphics.fillEllipse(800, 2400, 380, 260);

    // Sebar pohon & batu alam
    this.spawnNatureDecorations();

    // Monumen Air Mancur Plaza
    const fountain = this.add.graphics();
    fountain.fillStyle(0x0284c7, 1);
    fountain.fillCircle(1600, 1600, 45);
    fountain.lineStyle(4, 0xf59e0b, 1);
    fountain.strokeCircle(1600, 1600, 45);

    this.add.text(1600, 1530, '★ SANCTUARY PLAZA ★', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '14px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // NPC Sage Raden
    const npcX = 1660;
    const npcY = 1580;
    const npc = this.add.image(npcX, npcY, 'npc-sprite').setDisplaySize(40, 40);
    this.add.text(npcX, npcY - 32, 'Sage Raden', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '12px',
      color: '#a78bfa',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    npc.setInteractive({ useHandCursor: true });
    npc.on('pointerdown', () => {
      EventBus.emit('new-chat-message', {
        id: `npc_${Date.now()}`,
        senderId: 'npc',
        senderName: 'Sage Raden',
        text: 'Selamat datang di RadenWorld! Gerakkan karaktermu di tanah berpola catur ini dengan tombol WASD atau tombol virtual layar.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    // ==============================================================
    // 1. RUMAH PEMAIN (PLAYER HOUSE) - Selatan Plaza (1520, 1680)
    // ==============================================================
    const houseG = this.add.graphics();
    // Dinding kayu rumah
    houseG.fillStyle(0x78350f, 1);
    houseG.fillRoundedRect(1460, 1630, 120, 90, 6);
    houseG.lineStyle(2, 0x451a03, 1);
    houseG.strokeRoundedRect(1460, 1630, 120, 90, 6);
    // Atap pelana merah bata
    houseG.fillStyle(0x991b1b, 1);
    houseG.fillTriangle(1440, 1630, 1520, 1570, 1600, 1630);
    // Cerobong asap
    houseG.fillStyle(0x475569, 1);
    houseG.fillRect(1560, 1565, 16, 25);
    // Pintu rumah
    houseG.fillStyle(0x0f172a, 1);
    houseG.fillRect(1502, 1685, 36, 35);
    houseG.fillStyle(0xf59e0b, 1);
    houseG.fillCircle(1530, 1702, 3);
    // Keset / Pintu Masuk
    houseG.fillStyle(0xd97706, 0.7);
    houseG.fillRect(1495, 1720, 50, 10);

    this.add.text(1520, 1610, '🏠 RUMAH PEMAIN', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // ==============================================================
    // 2. TOKO PANDAI BESI (BLACKSMITH ARYA) - Barat Laut (1460, 1490)
    // ==============================================================
    const forgeG = this.add.graphics();
    // Bangunan bengkel batu
    forgeG.fillStyle(0x334155, 1);
    forgeG.fillRoundedRect(1400, 1440, 110, 80, 6);
    // Atap genteng besi
    forgeG.fillStyle(0x1e293b, 1);
    forgeG.fillTriangle(1385, 1440, 1455, 1390, 1525, 1440);
    // Tungku api & bara
    forgeG.fillStyle(0xd97706, 1);
    forgeG.fillRect(1420, 1475, 26, 26);
    forgeG.fillStyle(0xef4444, 1);
    forgeG.fillCircle(1433, 1488, 7);
    // Paron besi (Anvil)
    forgeG.fillStyle(0x64748b, 1);
    forgeG.fillRect(1470, 1485, 22, 16);

    this.add.text(1455, 1425, '⚒ TOKO SENJATA & ARMOR', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '10px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const blacksmithNpc = this.add.image(1460, 1500, 'npc-sprite').setDisplaySize(38, 38);
    this.add.text(1460, 1472, 'Blacksmith Arya', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#f97316',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    blacksmithNpc.setInteractive({ useHandCursor: true });
    blacksmithNpc.on('pointerdown', () => {
      EventBus.emit('new-chat-message', {
        id: `npc_bs_${Date.now()}`,
        senderId: 'npc',
        senderName: 'Blacksmith Arya',
        text: 'Pedang dan armor kualitas terbaik ditempa di sini! Siapkan gold-mu petualang.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    // ==============================================================
    // 3. TOKO RAMUAN ALKIMIA (ALCHEMIST SARI) - Timur Laut (1740, 1490)
    // ==============================================================
    const alcG = this.add.graphics();
    // Bangunan toko kayu & kaca
    alcG.fillStyle(0x1e3a8a, 0.9);
    alcG.fillRoundedRect(1690, 1440, 110, 80, 6);
    // Atap kerucut ungu magis
    alcG.fillStyle(0x6b21a8, 1);
    alcG.fillTriangle(1675, 1440, 1745, 1390, 1815, 1440);
    // Kuali ramuan hijau berkilau
    alcG.fillStyle(0x0f172a, 1);
    alcG.fillCircle(1715, 1490, 14);
    alcG.fillStyle(0x10b981, 1);
    alcG.fillCircle(1715, 1488, 10);
    // Botol ramuan biru & merah di etalase
    alcG.fillStyle(0x38bdf8, 1);
    alcG.fillRect(1750, 1480, 8, 14);
    alcG.fillStyle(0xef4444, 1);
    alcG.fillRect(1762, 1480, 8, 14);

    this.add.text(1745, 1425, '🧪 TOKO RAMUAN ALKIMIA', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '10px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const alchemistNpc = this.add.image(1740, 1500, 'npc-sprite').setDisplaySize(38, 38);
    this.add.text(1740, 1472, 'Alchemist Sari', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '11px',
      color: '#34d399',
      stroke: '#0f172a',
      strokeThickness: 3,
    }).setOrigin(0.5);

    alchemistNpc.setInteractive({ useHandCursor: true });
    alchemistNpc.on('pointerdown', () => {
      EventBus.emit('new-chat-message', {
        id: `npc_alc_${Date.now()}`,
        senderId: 'npc',
        senderName: 'Alchemist Sari',
        text: 'Ramuan energi dan penyembuh siap untukmu, petualang terhormat!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });
  }

  private spawnNatureDecorations(): void {
    const natureObjects: { x: number; y: number; key: string }[] = [];

    // Hutan utara
    for (let i = 0; i < 28; i++) {
      const x = 300 + (i % 7) * 140 + (Math.sin(i) * 40);
      const y = 300 + Math.floor(i / 7) * 140 + (Math.cos(i) * 40);
      natureObjects.push({ x, y, key: 'tree-asset' });
    }

    // Bebatuan timur
    for (let i = 0; i < 18; i++) {
      const x = 2500 + (i % 6) * 100 + (Math.sin(i) * 30);
      const y = 2200 + Math.floor(i / 6) * 110 + (Math.cos(i) * 30);
      natureObjects.push({ x, y, key: i % 2 === 0 ? 'rock-asset' : 'tree-asset' });
    }

    // Hutan selatan
    for (let i = 0; i < 20; i++) {
      const x = 1800 + (i % 5) * 150 + (Math.sin(i) * 45);
      const y = 2300 + Math.floor(i / 5) * 130 + (Math.cos(i) * 35);
      natureObjects.push({ x, y, key: 'tree-asset' });
    }

    // Peti harta karun
    const chests = [
      { x: 1450, y: 1450 },
      { x: 2600, y: 700 },
      { x: 750, y: 2200 },
      { x: 2200, y: 2600 },
    ];

    chests.forEach(c => {
      const chest = this.add.image(c.x, c.y, 'chest-asset').setDisplaySize(32, 32);
      chest.setInteractive({ useHandCursor: true });
      chest.on('pointerdown', () => {
        chest.setTint(0xfacc15);
        this.tweens.add({
          targets: chest,
          scaleX: 1.2,
          scaleY: 1.2,
          yoyo: true,
          duration: 200,
        });
        EventBus.emit('new-chat-message', {
          id: `chest_${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          text: 'Peti ditemukan! Berisi 50 Gold & 10 Experience Points.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      });
    });

    natureObjects.forEach(obj => {
      const item = this.add.image(obj.x, obj.y, obj.key);
      if (obj.key === 'tree-asset') {
        item.setDisplaySize(54, 68);
        item.setDepth(obj.y);
      } else {
        item.setDisplaySize(42, 32);
        item.setDepth(obj.y - 10);
      }
    });
  }

  public spawnLocalPlayer(name: string, avatar: IAvatarCustomization, nearHouse: boolean = false): void {
    if (this.player) {
      this.cameras.main.stopFollow();
      this.player.destroy();
      this.player = null;
    }

    const spawnX = nearHouse ? 1520 : 1600 + Math.floor((Math.random() - 0.5) * 80);
    const spawnY = nearHouse ? 1750 : 1600 + Math.floor((Math.random() - 0.5) * 80);

    this.player = new Player(
      this,
      spawnX,
      spawnY,
      'local_player',
      name,
      avatar,
      100,
      100
    );

    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.15);

    this.networkManager.connect();
    const isSuperAdmin = name.toUpperCase() === 'RADEN';
    this.networkManager.joinGame(name, avatar, isSuperAdmin ? 'super_admin' : 'player', isSuperAdmin);

    this.time.delayedCall(800, () => {
      this.player?.showSpeechBubble(isSuperAdmin ? '👑 Salam sejahtera, RadenWorld!' : 'Halo dunia!');
    });
  }

  private setupMultiplayerListeners(): void {
    this.networkManager.onWorldInit((data: IWorldInitData) => {
      data.players.forEach(p => this.addRemotePlayer(p));
      data.monsters.forEach(m => this.addOrUpdateMonster(m));
      EventBus.emit('player-count-updated', this.remotePlayers.size + 1);
    });

    this.networkManager.onPlayerJoined((playerData: IPlayerData) => {
      this.addRemotePlayer(playerData);
      EventBus.emit('player-count-updated', this.remotePlayers.size + 1);

      EventBus.emit('new-chat-message', {
        id: `join_${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: `${playerData.name} telah memasuki open world!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    this.networkManager.onPlayerMoved((data) => {
      const remotePlayer = this.remotePlayers.get(data.id);
      if (remotePlayer) {
        remotePlayer.setNetworkState(data.x, data.y, data.direction, data.isMoving);
      }
    });

    this.networkManager.onPlayerLeft((data) => {
      const remotePlayer = this.remotePlayers.get(data.id);
      if (remotePlayer) {
        remotePlayer.destroy();
        this.remotePlayers.delete(data.id);
        EventBus.emit('player-count-updated', this.remotePlayers.size + 1);

        EventBus.emit('new-chat-message', {
          id: `leave_${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          text: `${data.name} meninggalkan open world.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    this.networkManager.onChatBroadcast((chat: IChatMessage) => {
      EventBus.emit('new-chat-message', chat);
      const remote = this.remotePlayers.get(chat.senderId);
      if (remote) {
        remote.showSpeechBubble(chat.text);
      }
    });

    this.networkManager.onMonstersSync((monstersData: IMonsterData[]) => {
      monstersData.forEach(m => {
        let monster = this.monsters.get(m.id);
        if (!monster) {
          this.addOrUpdateMonster(m);
        } else {
          monster.setNetworkTarget(m.x, m.y);
        }
      });
    });
  }

  private addRemotePlayer(p: IPlayerData): void {
    if (this.remotePlayers.has(p.id)) return;
    const remote = new RemotePlayer(
      this,
      p.x,
      p.y,
      p.id,
      p.name,
      p.avatar || {
        gender: 'male',
        skinColor: '#fed7aa',
        shirtColor: '#2563eb',
        pantsColor: '#1e293b',
        hatType: 'none',
      },
      p.hp,
      p.maxHp
    );
    this.remotePlayers.set(p.id, remote);
  }

  private addOrUpdateMonster(m: IMonsterData): void {
    let monster = this.monsters.get(m.id);
    if (!monster) {
      monster = new Monster(this, m.x, m.y, m.id, m.name, m.type, m.hp, m.maxHp);
      this.monsters.set(m.id, monster);
    } else {
      monster.setNetworkTarget(m.x, m.y);
    }
  }

  public update(time: number, delta: number): void {
    if (this.player) {
      this.player.update(time, delta);
      this.player.setDepth(this.player.y);

      const px = this.player.x;
      const py = this.player.y;

      // Cek kedekatan dengan rumah pemain, toko pandai besi, toko alkimia
      const distHouse = Phaser.Math.Distance.Between(px, py, this.playerHouseDoor.x, this.playerHouseDoor.y);
      const distBlacksmith = Phaser.Math.Distance.Between(px, py, this.blacksmithZone.x, this.blacksmithZone.y);
      const distAlchemist = Phaser.Math.Distance.Between(px, py, this.alchemistZone.x, this.alchemistZone.y);

      let prompt: string | null = null;
      let locationName = this.getRegionName(px, py);

      if (distHouse < 75) {
        prompt = `TEKAN [E] / KLIK UNTUK MASUK KE RUMAH PRIBADI (${this.privateRoomId})`;
        locationName = 'SANCTUARY: RUMAH PEMAIN';
      } else if (distBlacksmith < 75) {
        prompt = 'TEKAN [E] / KLIK UNTUK BICARA DENGAN PANDAI BESI';
        locationName = 'SANCTUARY: TOKO PANDAI BESI';
      } else if (distAlchemist < 75) {
        prompt = 'TEKAN [E] / KLIK UNTUK BICARA DENGAN PENJUAL RAMUAN';
        locationName = 'SANCTUARY: TOKO ALKIMIA';
      }

      if (prompt !== this.activePrompt) {
        this.activePrompt = prompt;
        EventBus.emit('interaction-prompt', prompt);
      }

      if (time - this.lastStatsEmitTime > 60) {
        this.lastStatsEmitTime = time;
        EventBus.emit('player-stats-updated', {
          x: Math.round(px),
          y: Math.round(py),
          gridX: Math.floor(px / 64),
          gridY: Math.floor(py / 64),
          hp: this.player.getHealth(),
          maxHp: this.player.getMaxHealth(),
          name: this.player.getEntityName(),
          avatar: this.player.getAvatar(),
          roomName: locationName,
          inHouse: false,
          level: 1,
        });
      }
    }

    this.remotePlayers.forEach(p => {
      p.update(time, delta);
      p.setDepth(p.y);
    });

    this.monsters.forEach(m => {
      m.update(time, delta);
      m.setDepth(m.y);
    });
  }

  public triggerCurrentInteraction(): void {
    if (!this.player) return;
    const px = this.player.x;
    const py = this.player.y;

    // Masuk kembali ke rumah pribadi
    if (Phaser.Math.Distance.Between(px, py, this.playerHouseDoor.x, this.playerHouseDoor.y) < 85) {
      this.player.showSpeechBubble('Kembali ke rumah pribadi...');
      this.networkManager.disconnect();
      this.time.delayedCall(400, () => {
        let safeId = this.privateRoomId;
        try {
          const storedUser = localStorage.getItem('raden_player_user');
          if (storedUser) {
            const u = JSON.parse(storedUser);
            if (u.private_room_id) safeId = u.private_room_id;
          }
        } catch (e) {}
        const housePath = `/home/${safeId}`;
        if (window.location.pathname !== housePath) {
          window.history.pushState(null, '', housePath);
        }
        EventBus.emit('url-changed', housePath);
        this.scene.start('HouseScene', {
          name: this.player?.getEntityName() || this.pendingPlayerName || 'Petualang',
          avatar: this.player?.getAvatar() || this.pendingAvatar,
          privateRoomId: safeId,
        });
      });
      return;
    }

    // Interaksi dengan Pandai Besi Arya
    if (Phaser.Math.Distance.Between(px, py, this.blacksmithZone.x, this.blacksmithZone.y) < 85) {
      EventBus.emit('new-chat-message', {
        id: `npc_bs_${Date.now()}`,
        senderId: 'npc',
        senderName: 'Blacksmith Arya',
        text: 'Pedang dan armor kualitas terbaik siap melindungi petualanganmu di RadenWorld!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }

    // Interaksi dengan Alchemist Sari
    if (Phaser.Math.Distance.Between(px, py, this.alchemistZone.x, this.alchemistZone.y) < 85) {
      EventBus.emit('new-chat-message', {
        id: `npc_alc_${Date.now()}`,
        senderId: 'npc',
        senderName: 'Alchemist Sari',
        text: 'Ramuan energi dan penyembuh siap untukmu, petualang terhormat!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }
  }

  private getRegionName(x: number, y: number): string {
    if (Math.hypot(x - 1600, y - 1600) < 300) return 'SANCTUARY PLAZA: PUSAT KOTA';
    if (y < 800) return 'NORTH WHISPERING WOODS';
    if (x > 2200 && y < 1200) return 'AZURE MYSTIC LAKE';
    if (x > 2200 && y > 2000) return 'EASTERN GRANITE CRAGS';
    if (y > 2200) return 'SOUTHERN EMERALD MEADOW';
    return 'CATUR OPEN WILDLANDS';
  }
}
