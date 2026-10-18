/**
 * ============================================================================
 * FILE: resources/js/game/scenes/HouseScene.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Scene Interior Rumah Pribadi (Safe House).
 * 
 * SPESIFIKASI:
 * 1. Skala Grid: 1 Grid = 120px x 120px (Pola catur kayu gelap & amber).
 * 2. Karakter: 94.52px x 177px, di tengah kolom 1x2 petak (120x240px).
 * 3. Kamera: Zoom in & Zoom out yang halus (smooth lerp/tween) tanpa jittering.
 * 4. Interaksi: Lemari baju (ganti avatar), kasur, dapur, kamar mandi, dan pintu keluar.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EventBus } from '../core/EventBus';
import { NetworkManager } from '../core/NetworkManager';
import { IAvatarCustomization } from '../types';

export class HouseScene extends Phaser.Scene {
  private player: Player | null = null;
  private currentAvatar: IAvatarCustomization;
  private playerName: string = 'Petualang';

  // Batas ruangan rumah & ukuran grid: Dapat disesuaikan dinamis via Panel Arsitek Tahta Raden
  public roomWidth: number = 1680;
  public roomHeight: number = 1200;
  public readonly tileSize: number = 120;
  private customArchitectPropsGroup: (Phaser.GameObjects.Image | Phaser.GameObjects.GameObject)[] = [];
  private customArchitectTerrainsGroup: Phaser.GameObjects.Graphics[] = [];
  private customArchitectTerrainObstacles: Phaser.GameObjects.GameObject[] = [];

  // Objek interaktif & koordinat zona
  private exitDoorZone!: { x: number; y: number; width: number; height: number };
  private wardrobeZone!: { x: number; y: number };
  private bedZone!: { x: number; y: number };
  private kitchenZone!: { x: number; y: number };
  private bathroomZone!: { x: number; y: number };

  private activePrompt: string | null = null;
  private lastStatsEmitTime: number = 0;
  private lastPosSaveTime: number = 0;
  private lastGridX: number = -1;
  private lastGridY: number = -1;
  private lastRoomLabel: string = '';
  private privateRoomId: string = 'safe-01';

  // Kontrol zoom halus
  private targetZoom: number = 1.0;
  private isTransitioning: boolean = false;

  constructor() {
    super({ key: 'HouseScene' });
    this.currentAvatar = {
      gender: 'male',
      skinColor: '#fed7aa',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      hatType: 'none',
    };
  }

  public init(data?: { name?: string; avatar?: IAvatarCustomization; privateRoomId?: string }): void {
    this.isTransitioning = false;
    this.player = null as any;

    let savedName = '';
    let savedRoomId = '';
    let savedAvatar: IAvatarCustomization | null = null;
    try {
      const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
      if (u.name) savedName = u.name;
      if (u.private_room_id) savedRoomId = u.private_room_id;
      const a = localStorage.getItem('raden_player_avatar');
      if (a) savedAvatar = JSON.parse(a);
    } catch (e) {}

    if (data?.name) {
      this.playerName = data.name;
    } else if (savedName) {
      this.playerName = savedName;
    }

    if (data?.avatar) {
      this.currentAvatar = data.avatar;
    } else if (savedAvatar) {
      this.currentAvatar = savedAvatar;
    }

    if (data?.privateRoomId) {
      this.privateRoomId = data.privateRoomId;
    } else if (savedRoomId) {
      this.privateRoomId = savedRoomId;
    } else if (window.location.pathname.startsWith('/home/')) {
      const seg = window.location.pathname.replace('/home/', '').trim();
      if (seg) this.privateRoomId = seg;
    }

    // Muat konfigurasi dimensi rumah kustom dari Studio Arsitek Tahta Raden
    try {
      const saved = localStorage.getItem('raden_architect_house');
      if (saved) {
        const cfg = JSON.parse(saved);
        if (cfg.gridWidth && cfg.gridHeight) {
          this.roomWidth = cfg.gridWidth * this.tileSize;
          this.roomHeight = cfg.gridHeight * this.tileSize;
        }
      }
    } catch (e) {}
  }

  public create(): void {
    // 1. Batas fisika dinding rumah
    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);

    // 2. Berpindah ke room rumah pribadi (karakter keluar dari room Open World)
    NetworkManager.getInstance().switchRoom('house-' + this.privateRoomId, 840, 620);

    // 3. Render tata ruang interior rumah berpola catur 120x120px
    this.createHouseInterior();

    // 4. Spawn karakter pemain di tengah ruang tamu rumah
    this.spawnPlayerInHouse();

    // 4. Hubungkan event ganti avatar dari lemari
    const onAvatarUpdated = (newAvatar: IAvatarCustomization) => {
      if (newAvatar) {
        this.currentAvatar = newAvatar;
        if (this.player) {
          this.player.setAvatar(newAvatar);
        }
      }
    };
    EventBus.on('avatar-updated', onAvatarUpdated);

    // Hubungkan event bergabung ke game dari Home Screen
    const onJoinGame = (userData: { name: string; avatar: IAvatarCustomization; privateRoomId?: string }) => {
      if (userData?.name) this.playerName = userData.name;
      if (userData?.avatar) this.currentAvatar = userData.avatar;
      if (userData?.privateRoomId) this.privateRoomId = userData.privateRoomId;
      if (this.player) {
        this.player.setAvatar(this.currentAvatar);
        if (userData?.name) {
          this.player.setEntityName(userData.name);
        }
      } else {
        this.spawnPlayerInHouse();
      }
      this.emitStats(this.player?.x || 840, this.player?.y || 620, 'RUMAH PRIBADI: RUANG UTAMA');
    };
    EventBus.on('join-game', onJoinGame);

    // Hubungkan event klik tombol interaksi dari HUD
    const onTriggerInteraction = () => {
      this.triggerCurrentInteraction();
    };
    EventBus.on('trigger-interaction', onTriggerInteraction);

    // Tangani pembaruan denah rumah langsung dari Studio Arsitek Tahta Raden
    const onArchitectConfigUpdated = (data: { mapType: string; config: any }) => {
      if (data && data.mapType === 'house' && data.config) {
        if (data.config.gridWidth && data.config.gridHeight) {
          this.roomWidth = data.config.gridWidth * this.tileSize;
          this.roomHeight = data.config.gridHeight * this.tileSize;
          this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);
          this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
        }
        this.customArchitectPropsGroup.forEach((obj) => {
          if (obj && (obj as any).destroy) (obj as any).destroy();
        });
        this.customArchitectPropsGroup = [];
        this.spawnArchitectCustomProps();
      }
    };
    EventBus.on('architect-config-updated', onArchitectConfigUpdated);

    // 5. Tombol interaksi keyboard 'E'
    this.input.keyboard?.on('keydown-E', () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      this.triggerCurrentInteraction();
    });

    // Tap / Klik lantai ruangan untuk bergerak (Khusus PC & Mobile)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (pointer.rightButtonDown()) return;
      if (this.player?.isMovementLocked()) return;

      const wx = pointer.worldX;
      const wy = pointer.worldY;
      if (wx < 80 || wx > this.roomWidth - 80 || wy < 80 || wy > this.roomHeight - 80) return;

      if (this.player && this.player.active) {
        this.spawnTapRipple(wx, wy);
        this.player.navigateTo(wx, wy);
      }
    });

    // 6. Kontrol Kamera Zoom In & Zoom Out Halus (Tween)
    this.setupCameraZoomControls(1.0);

    // Beritahu HUD lokasi saat ini
    EventBus.emit('location-updated', 'RUMAH PRIBADI: RUANG UTAMA');

    const onSendChat = (text: string) => {
      if (this.player && this.player.active && this.player.scene) {
        this.player.showSpeechBubble(text);
      }
    };
    EventBus.on('send-chat', onSendChat);

    const onTriggerExpression = (data: { type: 'normal' | 'smile' | 'shock' | 'angry' }) => {
      if (this.player && this.player.active && this.player.scene) {
        this.player.triggerExpression(data.type);
      }
    };
    EventBus.on('trigger-expression', onTriggerExpression);

    const onLocalSpeaking = (data: { isSpeaking: boolean }) => {
      if (this.player && this.player.active) {
        this.player.setSpeaking(data.isSpeaking);
      }
    };
    EventBus.on('local-player-speaking', onLocalSpeaking);

    // Bersihkan listener saat shutdown dan destroy
    const cleanupScene = () => {
      this.cameras?.main?.stopFollow();
      EventBus.off('avatar-updated', onAvatarUpdated);
      EventBus.off('join-game', onJoinGame);
      EventBus.off('send-chat', onSendChat);
      EventBus.off('trigger-expression', onTriggerExpression);
      EventBus.off('local-player-speaking', onLocalSpeaking);
      EventBus.off('trigger-interaction', onTriggerInteraction);
      EventBus.off('architect-config-updated', onArchitectConfigUpdated);
      EventBus.emit('interaction-prompt', null);
      if (this.player) {
        this.player.destroy();
        this.player = null as any;
      }
    };

    this.events.on('shutdown', cleanupScene);
    this.events.on('destroy', cleanupScene);
  }

  /**
   * Kontrol zoom kamera yang halus & responsif 60 FPS (Scroll Wheel, Keyboard +/-, HUD buttons)
   */
  private setupCameraZoomControls(defaultZoom: number = 1.0): void {
    this.targetZoom = defaultZoom;
    this.cameras.main.setZoom(defaultZoom);
    this.cameras.main.setRoundPixels(true);

    // 1. Mouse wheel zoom instan & mulus
    const onWheel = (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number) => {
      const zoomFactor = deltaY > 0 ? 0.90 : 1.10;
      this.targetZoom = Phaser.Math.Clamp(this.targetZoom * zoomFactor, 0.6, 2.0);
    };
    this.input.on('wheel', onWheel);

    // 2. Event dari UI HUD / Keyboard
    const handleZoomIn = () => {
      this.targetZoom = Phaser.Math.Clamp(this.targetZoom * 1.15, 0.6, 2.0);
    };
    const handleZoomOut = () => {
      this.targetZoom = Phaser.Math.Clamp(this.targetZoom * 0.85, 0.6, 2.0);
    };
    const handleZoomReset = () => {
      this.targetZoom = defaultZoom;
    };
    const handleZoomSet = (zoom: number) => {
      this.targetZoom = Phaser.Math.Clamp(zoom, 0.6, 2.0);
    };

    EventBus.on('camera-zoom-in', handleZoomIn);
    EventBus.on('camera-zoom-out', handleZoomOut);
    EventBus.on('camera-zoom-reset', handleZoomReset);
    EventBus.on('camera-zoom-set', handleZoomSet);

    this.input.keyboard?.on('keydown-PLUS', handleZoomIn);
    this.input.keyboard?.on('keydown-NUMPAD_ADD', handleZoomIn);
    this.input.keyboard?.on('keydown-MINUS', handleZoomOut);
    this.input.keyboard?.on('keydown-NUMPAD_SUBTRACT', handleZoomOut);

    this.events.on('shutdown', () => {
      this.input.off('wheel', onWheel);
      EventBus.off('camera-zoom-in', handleZoomIn);
      EventBus.off('camera-zoom-out', handleZoomOut);
      EventBus.off('camera-zoom-reset', handleZoomReset);
      EventBus.off('camera-zoom-set', handleZoomSet);
    });
  }

  private smoothZoomTo(newZoom: number): void {
    this.targetZoom = Phaser.Math.Clamp(newZoom, 0.6, 2.0);
  }

  /**
   * Menggambar denah rumah interior 120x120px catur kayu gelap & amber, dinding kayu, dan furnitur
   */
  private createHouseInterior(): void {
    const g = this.add.graphics();
    const tileSize = this.tileSize;
    // Lantai Catur Kayu 120x120px Ringan 60 FPS via TileSprite (1 draw call)
    const floorTile = this.add.tileSprite(
      this.roomWidth / 2,
      this.roomHeight / 2,
      this.roomWidth,
      this.roomHeight,
      'house-checker-tile'
    );
    floorTile.setDepth(-100);

    // Karpet besar di ruang tamu (Tengah)
    g.fillStyle(0xb45309, 0.85);
    g.fillRoundedRect(540, 420, 600, 420, 24);
    g.lineStyle(3, 0xf59e0b, 0.95);
    g.strokeRoundedRect(540, 420, 600, 420, 24);

    // Meja kopi di tengah karpet
    g.fillStyle(0x3f1d0b, 1);
    g.fillRoundedRect(760, 580, 160, 100, 12);
    g.lineStyle(2, 0xd97706, 1);
    g.strokeRoundedRect(760, 580, 160, 100, 12);

    // Dinding batas luar rumah
    g.fillStyle(0x0f172a, 1);
    g.fillRect(0, 0, this.roomWidth, 80); // Dinding atas
    g.fillRect(0, 0, 80, this.roomHeight); // Dinding kiri
    g.fillRect(this.roomWidth - 80, 0, 80, this.roomHeight); // Dinding kanan
    g.fillRect(0, this.roomHeight - 70, this.roomWidth, 70); // Dinding bawah

    // Sekat Ruangan Kamar Mandi (Kanan Bawah)
    g.fillRect(1160, 720, 440, 24);

    // ==============================================================
    // 1. KAMAR TIDUR (BEDROOM) - Kiri Atas
    // ==============================================================
    this.bedZone = { x: 280, y: 280 };
    // Rangka kasur
    g.fillStyle(0x451a03, 1);
    g.fillRoundedRect(160, 160, 220, 260, 12);
    // Kasur putih
    g.fillStyle(0xf8fafc, 1);
    g.fillRoundedRect(172, 172, 196, 236, 8);
    // Selimut biru
    g.fillStyle(0x2563eb, 1);
    g.fillRoundedRect(172, 230, 196, 178, 6);
    // Bantal
    g.fillStyle(0xe2e8f0, 1);
    g.fillRoundedRect(190, 180, 160, 40, 6);

    this.add.text(270, 130, '🛏️ TEMPAT TIDUR', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#f59e0b',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // ==============================================================
    // 2. LEMARI PAKAIAN (WARDROBE) - Kiri Tengah
    // ==============================================================
    this.wardrobeZone = { x: 520, y: 220 };
    // Lemari kayu jati
    g.fillStyle(0x522304, 1);
    g.fillRoundedRect(440, 130, 160, 130, 10);
    g.lineStyle(2.5, 0xd97706, 1);
    g.strokeRoundedRect(440, 130, 160, 130, 10);
    // Gagang pintu lemari emas
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(510, 195, 5);
    g.fillCircle(530, 195, 5);

    this.add.text(520, 105, '🚪 LEMARI (GANTI AVA)', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#f59e0b',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // ==============================================================
    // 3. DAPUR MEMASAK (KITCHEN) - Kanan Atas
    // ==============================================================
    this.kitchenZone = { x: 1300, y: 240 };
    // Meja konter dapur
    g.fillStyle(0x334155, 1);
    g.fillRoundedRect(1140, 130, 320, 110, 10);
    // Kompor & api
    g.fillStyle(0x0f172a, 1);
    g.fillRect(1180, 145, 75, 75);
    g.fillStyle(0xef4444, 1);
    g.fillCircle(1217, 182, 14);
    // Kulkas perak
    g.fillStyle(0x94a3b8, 1);
    g.fillRoundedRect(1380, 110, 75, 150, 6);

    this.add.text(1300, 100, '🍳 DAPUR MEMASAK', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#f59e0b',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // ==============================================================
    // 4. KAMAR MANDI (BATHROOM) - Kanan Bawah
    // ==============================================================
    this.bathroomZone = { x: 1380, y: 950 };
    // Lantai keramik porselen biru muda
    g.fillStyle(0x0284c7, 0.35);
    g.fillRect(1170, 750, 420, 370);
    // Bathtub porselen
    g.fillStyle(0xf1f5f9, 1);
    g.fillRoundedRect(1280, 880, 200, 100, 16);
    // Air bathtub
    g.fillStyle(0x38bdf8, 0.85);
    g.fillRoundedRect(1292, 892, 176, 76, 10);

    this.add.text(1380, 820, '🚿 KAMAR MANDI', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#f59e0b',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // ==============================================================
    // 5. PINTU KELUAR KE WORLD (EXIT DOOR) - Tengah Bawah
    // ==============================================================
    this.exitDoorZone = { x: 840, y: 1130, width: 140, height: 60 };
    // Karpet selamat jalan
    g.fillStyle(0x0f172a, 1);
    g.fillRoundedRect(750, 1070, 180, 55, 6);
    g.lineStyle(3, 0xf59e0b, 1);
    g.strokeRoundedRect(750, 1070, 180, 55, 6);

    // Lubang pintu keluar
    g.fillStyle(0x0284c7, 1);
    g.fillRect(770, 1115, 140, 35);

    this.add.text(840, 1090, '🚪 PINTU KELUAR KE WORLD', {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: '13px',
      color: '#fef08a',
      fontStyle: 'bold',
      stroke: '#0a0f1d',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // 6. Muat dan spawn seluruh prop kustom rumah dari Studio Arsitek Tahta Raden
    this.spawnArchitectCustomProps();

    // 7. Muat dan spawn seluruh lapisan lantai / medan kustom rumah
    this.spawnArchitectCustomTerrains();

    // 8. Sinkronisasi realtime jika konfigurasi diubah di Studio Arsitek Tahta Raden
    EventBus.on('architect-config-updated', (data: { mapType: string }) => {
      if (data?.mapType === 'house') {
        this.spawnArchitectCustomProps();
        this.spawnArchitectCustomTerrains();
      }
    });
  }

  /**
   * Menempatkan aset prop visual yang pas dan rata pada petak grid di dalam rumah
   */
  private addGridProp(
    key: string,
    gx: number,
    gy: number,
    gw: number,
    gh: number,
    isObstacle: boolean = true
  ): Phaser.GameObjects.Image | null {
    if (!this.textures.exists(key)) return null;

    const pixelW = gw * this.tileSize;
    const pixelH = gh * this.tileSize;
    const centerX = gx * this.tileSize + pixelW / 2;
    const centerY = gy * this.tileSize + pixelH / 2;

    const img = this.add.image(centerX, centerY, key);
    img.setDisplaySize(pixelW, pixelH);
    img.setDepth((gy + gh) * this.tileSize);

    return img;
  }

  /**
   * Merender aset-aset kustom yang ditempatkan oleh pengguna melalui Studio Arsitek Tahta Raden
   */
  private spawnArchitectCustomProps(): void {
    try {
      this.customArchitectPropsGroup.forEach((p: any) => {
        if (p && p.active && typeof p.destroy === 'function') p.destroy();
      });
      this.customArchitectPropsGroup = [];

      const saved = localStorage.getItem('raden_architect_house');
      if (!saved) return;
      const cfg = JSON.parse(saved);
      if (!cfg.customProps || !Array.isArray(cfg.customProps)) return;

      cfg.customProps.forEach((prop: any) => {
        if (prop.id && String(prop.id).startsWith('def_')) return;
        const spawned = this.addGridProp(
          prop.key,
          prop.gx,
          prop.gy,
          prop.gw || 1,
          prop.gh || 1,
          prop.isObstacle ?? true
        );
        if (spawned) {
          this.customArchitectPropsGroup.push(spawned);
        }
      });
    } catch (e) {
      console.warn('[HouseScene] Gagal memuat custom architect props:', e);
    }
  }

  /**
   * Merender lapisan lantai kustom di dalam rumah
   */
  private spawnArchitectCustomTerrains(): void {
    try {
      this.customArchitectTerrainsGroup.forEach(g => {
        if (g && g.active && typeof g.destroy === 'function') g.destroy();
      });
      this.customArchitectTerrainsGroup = [];

      const saved = localStorage.getItem('raden_architect_house');
      if (!saved) return;
      const cfg = JSON.parse(saved);
      if (!cfg.customTerrains || !Array.isArray(cfg.customTerrains)) return;

      const tg = this.add.graphics();
      tg.setDepth(-85);

      cfg.customTerrains.forEach((t: any) => {
        if (t.id && String(t.id).startsWith('def_')) return;
        const x = t.gx * this.tileSize;
        const y = t.gy * this.tileSize;
        const w = (t.gw || 1) * this.tileSize;
        const h = (t.gh || 1) * this.tileSize;

        if (t.type === 'wood') {
          tg.fillStyle(0x92400e, 0.95);
          tg.fillRect(x, y, w, h);
          tg.lineStyle(2, 0x78350f, 0.8);
          tg.strokeRect(x, y, w, h);
        } else if (t.type === 'plaza') {
          tg.fillStyle(0x334155, 0.95);
          tg.fillRect(x, y, w, h);
          tg.lineStyle(3, 0xf59e0b, 0.7);
          tg.strokeRect(x, y, w, h);
        }
      });

      this.customArchitectTerrainsGroup.push(tg);
    } catch (e) {
      console.warn('[HouseScene] Gagal memuat custom architect terrains:', e);
    }
  }

  /**
   * Spawn karakter pemain di dalam rumah
   */
  private spawnPlayerInHouse(): void {
    if (this.player) {
      this.cameras?.main?.stopFollow();
      this.player.destroy();
      this.player = null;
    }

    // Posisi awal di dalam rumah: pulihkan posisi terakhir jika ada
    let startX = 840;
    let startY = 620;
    try {
      const saved = localStorage.getItem(`raden_pos_house_${this.privateRoomId}`);
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.x === 'number' && typeof p.y === 'number') {
          if (p.x >= 120 && p.x <= this.roomWidth - 120 && p.y >= 120 && p.y <= this.roomHeight - 120) {
            startX = p.x;
            startY = p.y;
          }
        }
      }
    } catch (e) {}

    if (!this.playerName || this.playerName === 'Petualang') {
      try {
        const u = JSON.parse(localStorage.getItem('raden_player_user') || '{}');
        if (u.name) this.playerName = u.name;
      } catch (e) {}
    }

    this.player = new Player(
      this,
      startX,
      startY,
      'local_player',
      this.playerName,
      this.currentAvatar,
      100,
      100
    );

    this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.centerOn(startX, startY);
    this.cameras.main.startFollow(this.player, true, 1.0, 1.0);
    this.smoothZoomTo(1.0);

    // Emit koordinat dan stats langsung saat spawn agar HUD terisi seketika
    this.emitStats(startX, startY, 'RUMAH PRIBADI: RUANG UTAMA');

    this.time.delayedCall(500, () => {
      this.player?.showSpeechBubble('Rumah yang nyaman! Waktunya bersiap.');
    });
  }

  private emitStats(px: number, py: number, roomLabel: string): void {
    EventBus.emit('player-stats-updated', {
      x: Math.round(px),
      y: Math.round(py),
      gridX: Math.floor(px / this.tileSize),
      gridY: Math.floor(py / this.tileSize),
      name: this.playerName,
      avatar: this.currentAvatar,
      roomName: `${roomLabel} (SAFE: ${this.privateRoomId})`,
      inHouse: true,
      level: 1,
      privateRoomId: this.privateRoomId,
    });
  }

  public update(time: number, delta: number): void {
    // Zoom lerp ultra mulus 60 FPS
    if (Math.abs(this.cameras.main.zoom - this.targetZoom) > 0.001) {
      this.cameras.main.setZoom(
        Phaser.Math.Linear(this.cameras.main.zoom, this.targetZoom, Math.min(1, delta * 0.018))
      );
    }

    if (!this.player || this.isTransitioning || (typeof window !== 'undefined' && window.location.pathname === '/')) return;

    this.player.update(time, delta);
    this.player.setDepth(this.player.y + 60);

    const px = this.player.x;
    const py = this.player.y;

    // 1. Cek Pintu Keluar
    const distDoor = Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y);
    // 2. Cek Lemari
    const distWardrobe = Phaser.Math.Distance.Between(px, py, this.wardrobeZone.x, this.wardrobeZone.y);
    // 3. Cek Kasur
    const distBed = Phaser.Math.Distance.Between(px, py, this.bedZone.x, this.bedZone.y);
    // 4. Cek Dapur
    const distKitchen = Phaser.Math.Distance.Between(px, py, this.kitchenZone.x, this.kitchenZone.y);
    // 5. Cek Kamar Mandi
    const distBath = Phaser.Math.Distance.Between(px, py, this.bathroomZone.x, this.bathroomZone.y);

    let prompt: string | null = null;
    let roomLabel = 'RUMAH PRIBADI: RUANG TAMU';

    if (distDoor < 110) {
      prompt = 'TEKAN [E] / KLIK UNTUK KELUAR KE WORLD';
      roomLabel = 'RUMAH PRIBADI: PINTU KELUAR';
    } else if (distWardrobe < 110) {
      prompt = 'TEKAN [E] / KLIK UNTUK BUKA LEMARI (GANTI AVA)';
      roomLabel = 'RUMAH PRIBADI: LEMARI PAKAIAN';
    } else if (distBed < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK ISTIRAHAT DI KASUR';
      roomLabel = 'RUMAH PRIBADI: TEMPAT TIDUR';
    } else if (distKitchen < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK MEMASAK DI DAPUR';
      roomLabel = 'RUMAH PRIBADI: DAPUR';
    } else if (distBath < 120) {
      prompt = 'TEKAN [E] / KLIK UNTUK KE KAMAR MANDI';
      roomLabel = 'RUMAH PRIBADI: KAMAR MANDI';
    }

    if (prompt !== this.activePrompt) {
      this.activePrompt = prompt;
      EventBus.emit('interaction-prompt', prompt);
    }

    const gridX = Math.floor(px / this.tileSize);
    const gridY = Math.floor(py / this.tileSize);
    const labelChanged = roomLabel !== this.lastRoomLabel;
    const periodicTimeout = time - this.lastStatsEmitTime > 3000;

    if (labelChanged || periodicTimeout) {
      this.lastStatsEmitTime = time;
      this.lastGridX = gridX;
      this.lastGridY = gridY;
      this.lastRoomLabel = roomLabel;
      this.emitStats(px, py, roomLabel);
    }

    if (time - this.lastPosSaveTime > 5000) {
      this.lastPosSaveTime = time;
      try {
        localStorage.setItem(
          `raden_pos_house_${this.privateRoomId}`,
          JSON.stringify({ x: Math.round(px), y: Math.round(py) })
        );
      } catch (e) {}
    }
  }

  public triggerCurrentInteraction(): void {
    if (!this.player || this.isTransitioning) return;
    const px = this.player.x;
    const py = this.player.y;

    // Cek Pintu Keluar -> Pindah ke WorldScene
    if (Phaser.Math.Distance.Between(px, py, this.exitDoorZone.x, this.exitDoorZone.y) < 130) {
      this.transitionToWorld();
      return;
    }

    // Cek Lemari -> Buka Modal Ganti Avatar
    if (Phaser.Math.Distance.Between(px, py, this.wardrobeZone.x, this.wardrobeZone.y) < 130) {
      EventBus.emit('open-wardrobe', this.currentAvatar);
      return;
    }

    // Cek Kasur -> Efek Tidur
    if (Phaser.Math.Distance.Between(px, py, this.bedZone.x, this.bedZone.y) < 130) {
      this.player.showSpeechBubble('Zzz... Istirahat sejenak di kasur empuk 💤');
      return;
    }

    // Cek Dapur -> Memasak
    if (Phaser.Math.Distance.Between(px, py, this.kitchenZone.x, this.kitchenZone.y) < 130) {
      this.player.showSpeechBubble('Memasak hidangan lezat berenergi 🍲');
      return;
    }

    // Cek Kamar Mandi -> Mandi
    if (Phaser.Math.Distance.Between(px, py, this.bathroomZone.x, this.bathroomZone.y) < 130) {
      this.player.showSpeechBubble('Segarnya mandi & cuci muka di kamar mandi 🚿');
      return;
    }
  }

  private transitionToWorld(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.player?.showSpeechBubble('Menuju ke Open World...');

    this.time.delayedCall(400, () => {
      if (window.location.pathname !== '/world') {
        window.history.pushState(null, '', '/world');
      }
      EventBus.emit('url-changed', '/world');
      NetworkManager.getInstance().switchRoom('world', 1380, 960);
      this.cameras?.main?.stopFollow();
      this.scene.start('WorldScene', {
        name: this.playerName,
        avatar: this.currentAvatar,
        spawnNearHouse: true,
        privateRoomId: this.privateRoomId,
      });
    });
  }

  private spawnTapRipple(x: number, y: number): void {
    const circle = this.add.graphics();
    circle.lineStyle(2, 0xf59e0b, 0.9);
    circle.strokeCircle(x, y, 10);
    circle.setDepth(y + 2);

    this.tweens.add({
      targets: circle,
      scale: 2.2,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => circle.destroy(),
    });
  }
}
