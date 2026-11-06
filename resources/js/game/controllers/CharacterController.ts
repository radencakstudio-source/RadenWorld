/**
 * ============================================================================
 * FILE: resources/js/game/controllers/CharacterController.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Pengontrol Karakter modular (Character Controller) untuk RadenWorld.
 * 
 * FITUR:
 * 1. MOVEMENT SYSTEM:
 *    - Kontrol Keyboard (WASD & Panah), Analog Virtual Joystick (Sentuh HP),
 *      dan Navigasi Otomatis (Point & Click / Tap-to-Move).
 *    - Normalisasi pergerakan diagonal (0.7071) agar kecepatan tetap konsisten.
 *    - Sinkronisasi arah hadap ('up' | 'down' | 'left' | 'right') dan animasi.
 *    - Kunci pergerakan (saat dialog, mengetik, atau sedang memancing).
 * 
 * 2. JUMPING SYSTEM (Lompat 2.5D Top-Down):
 *    - Karakter terangkat ke atas secara visual (parabola Z-height) saat melompat.
 *    - GARIS INDIKATOR TITIK JATUH ("garis2 di bawah nya sesuai titik jatuhnya"):
 *      * Garis putus-putus lingkaran luar (Outer Dashed Target Ellipse) di lantai.
 *      * Garis putus-putus lingkaran dalam (Inner Dashed Ellipse).
 *      * Garis bidik silang (Crosshair dashed ticks) di pusat titik jatuh.
 *      * Garis panduan vertikal putus-putus (Vertical Dashed Drop-Line) dari kaki
 *        karakter melayang turun lurus ke titik lantai di bawahnya.
 *      * Efek debu / riak pendaratan (Landing Dust Ripples) saat menyentuh tanah.
 * 
 * 3. FISHING SYSTEM (Mancing):
 *    - Siklus memancing lengkap: CASTING -> WAITING -> BITE -> REELING -> CAUGHT.
 *    - Menggambar visual joran, senar pancing melengkung (bezier curve), dan
 *      pelampung merah-putih dengan riak air animasi.
 *    - Reaksi tanda seru "!" saat ikan menyambar (Bite Alert).
 *    - Tabel ikan tangkapan (Mujair, Lele, Nila, Gurame, Patin, Arwana Emas).
 *    - Hadiah koin emas & kristal langsung masuk ke saldo pemain.
 * ============================================================================
 */

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Direction, JumpVisualStage } from '../types';
import { EventBus } from '../core/EventBus';
import { SoundManager } from '../core/SoundManager';
import { NetworkManager } from '../core/NetworkManager';
import { InventoryManager } from '../core/InventoryManager';
import { PotionManager } from '../core/PotionManager';
import { WorldFarming } from '../scenes/world/WorldFarming';
import { KeybindingManager } from '../core/KeybindingManager';

export type CharacterActionState = 'grounded' | 'jumping' | 'fishing';

export type FishingState = 'none' | 'charging' | 'casting' | 'waiting' | 'bite' | 'minigame' | 'reeling' | 'caught';

export interface IRunPuffBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  birthTime: number;
  duration: number;
  color: number;
  strokeColor: number;
}

export interface IFishData {
  id: string;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  weightKg: number;
  goldReward: number;
  description: string;
  waterType?: 'Air Tawar' | 'Air Laut' | 'Air Payau';
}

export const FISH_LOOT_TABLE: IFishData[] = [
  // ========================================================================
  // 1. IKAN COMMON (AIR TAWAR, LAUT & PAYAU NUSANTARA)
  // ========================================================================
  {
    id: 'lele',
    name: 'Ikan Lele Sangkuriang',
    rarity: 'Common',
    weightKg: 0.8,
    goldReward: 35,
    description: 'Ikan air tawar berkumis tangguh khas perairan nusantara dengan tarikan bertenaga.',
    waterType: 'Air Tawar',
  },
  {
    id: 'mujair',
    name: 'Ikan Mujair Danau Blitar',
    rarity: 'Common',
    weightKg: 0.45,
    goldReward: 30,
    description: 'Ikan air tawar lincah yang pertama kali dibudidayakan Mbah Moedjair di Blitar, Jawa Timur.',
    waterType: 'Air Tawar',
  },
  {
    id: 'nila',
    name: 'Ikan Nila Merah Gesit',
    rarity: 'Common',
    weightKg: 0.95,
    goldReward: 45,
    description: 'Ikan air tawar bersisik merah merona dengan daging tebal berprotein tinggi favorit kolam Indonesia.',
    waterType: 'Air Tawar',
  },
  {
    id: 'mas',
    name: 'Ikan Mas Sinyonya',
    rarity: 'Common',
    weightKg: 1.2,
    goldReward: 50,
    description: 'Ikan air tawar bersisik kuning keemasan lincah favorit pemancing kolam Sunda dan Jawa.',
    waterType: 'Air Tawar',
  },
  {
    id: 'kembung',
    name: 'Ikan Kembung Banjar',
    rarity: 'Common',
    weightKg: 0.35,
    goldReward: 40,
    description: 'Ikan laut ekonomis padat omega-3 yang melimpah ruah di perairan selat nusantara.',
    waterType: 'Air Laut',
  },
  {
    id: 'tongkol',
    name: 'Ikan Tongkol Komo',
    rarity: 'Common',
    weightKg: 1.1,
    goldReward: 60,
    description: 'Ikan perenang cepat samudera nusantara dengan daging merah padat favorit tongkol balado.',
    waterType: 'Air Laut',
  },
  {
    id: 'bandeng',
    name: 'Ikan Bandeng Juwana',
    rarity: 'Common',
    weightKg: 0.75,
    goldReward: 50,
    description: 'Ikan perairan payau/pesisir gesit bertulang halus primadona tambak pantai utara Jawa.',
    waterType: 'Air Payau',
  },

  // ========================================================================
  // 2. IKAN UNCOMMON (AIR TAWAR, LAUT & KARANG NUSANTARA)
  // ========================================================================
  {
    id: 'gurame',
    name: 'Ikan Gurame Soang',
    rarity: 'Uncommon',
    weightKg: 1.8,
    goldReward: 90,
    description: 'Gurame air tawar montok bernilai tinggi favorit jamuan kuliner bakar khas Sunda.',
    waterType: 'Air Tawar',
  },
  {
    id: 'gabus',
    name: 'Ikan Gabus Haruan',
    rarity: 'Uncommon',
    weightKg: 1.5,
    goldReward: 100,
    description: 'Predator air tawar rawa nusantara berkepala ular kaya protein albumin penyembuh luka.',
    waterType: 'Air Tawar',
  },
  {
    id: 'bawal_bintang',
    name: 'Ikan Bawal Bintang Riau',
    rarity: 'Uncommon',
    weightKg: 1.6,
    goldReward: 115,
    description: 'Ikan laut bertubuh pipih lebar perenang lincah di perairan karang kepulauan Riau.',
    waterType: 'Air Laut',
  },
  {
    id: 'cakalang',
    name: 'Ikan Cakalang Manado',
    rarity: 'Uncommon',
    weightKg: 2.5,
    goldReward: 135,
    description: 'Ikan pelagis samudera Sulawesi yang gagah, bahan baku cakalang fufu asap khas Minahasa.',
    waterType: 'Air Laut',
  },
  {
    id: 'baronang',
    name: 'Ikan Baronang Angin',
    rarity: 'Uncommon',
    weightKg: 0.9,
    goldReward: 95,
    description: 'Ikan karang pemakan lumut dengan tarikan sentakan khas pemancing dermaga karang pesisir.',
    waterType: 'Air Laut',
  },

  // ========================================================================
  // 3. IKAN RARE (SUNGAI DALAM & LAUT DALAM NUSANTARA)
  // ========================================================================
  {
    id: 'patin',
    name: 'Ikan Patin Sungai Musi',
    rarity: 'Rare',
    weightKg: 4.2,
    goldReward: 250,
    description: 'Ikan berkumis jumbo penghuni lubuk sungai Musi Sumatera Selatan dengan tarikan dahsyat!',
    waterType: 'Air Tawar',
  },
  {
    id: 'baung',
    name: 'Ikan Baung Sungai Kampar',
    rarity: 'Rare',
    weightKg: 3.5,
    goldReward: 230,
    description: 'Ikan air tawar liar bertubuh licin favorit kuliner gulai asam pedas khas Riau.',
    waterType: 'Air Tawar',
  },
  {
    id: 'belida',
    name: 'Ikan Belida Batanghari',
    rarity: 'Rare',
    weightKg: 4.8,
    goldReward: 320,
    description: 'Ikan purba berbadan pipih ikonik Sumatera & Kalimantan bahan pempek asli Palembang.',
    waterType: 'Air Tawar',
  },
  {
    id: 'kakap_merah',
    name: 'Ikan Kakap Merah Laut Jawa',
    rarity: 'Rare',
    weightKg: 3.8,
    goldReward: 270,
    description: 'Ikan laut dalam bersisik merah cerah primadona boga bahari dan restoran pesisir Indonesia.',
    waterType: 'Air Laut',
  },
  {
    id: 'tenggiri',
    name: 'Ikan Tenggiri Batang Laut',
    rarity: 'Rare',
    weightKg: 4.5,
    goldReward: 290,
    description: 'Predator laut bertaring tajam perenang kilat bahan utama otak-otak dan siomay nusantara.',
    waterType: 'Air Laut',
  },
  {
    id: 'kerapu_cantang',
    name: 'Ikan Kerapu Cantang Bali',
    rarity: 'Rare',
    weightKg: 5.2,
    goldReward: 360,
    description: 'Ikan karang eksotis bernilai ekspor tinggi dengan loreng tutul khas terumbu karang tropis Indonesia.',
    waterType: 'Air Laut',
  },

  // ========================================================================
  // 4. IKAN LEGENDARY (PUSAKA SUNGAI & MONSTER SAMUDERA NUSANTARA)
  // ========================================================================
  {
    id: 'arwana_super_red',
    name: 'Ikan Arwana Super Red Kapuas',
    rarity: 'Legendary',
    weightKg: 6.5,
    goldReward: 950,
    description: 'Ikan naga merah endemik sungai Kapuas Kalimantan Barat, pusaka legendaris lambang kemakmuran nusantara!',
    waterType: 'Air Tawar',
  },
  {
    id: 'tuna_sirip_kuning',
    name: 'Ikan Tuna Sirip Kuning Maluku',
    rarity: 'Legendary',
    weightKg: 18.5,
    goldReward: 1200,
    description: 'Monster samudera Banda bertubuh torpedo raksasa dengan tenaga tarikan luar biasa dahsyat!',
    waterType: 'Air Laut',
  },
];

export class CharacterController {
  private player: Player;
  private scene: Phaser.Scene;
  private sound: SoundManager;

  // Status Pergerakan
  private speed: number = 380;
  private isMovementDisabled: boolean = false;
  private isRunning: boolean = false;
  private lastRunDustTime: number = 0;
  private joystickVector: { x: number; y: number } | null = null;
  private targetDestination: { x: number; y: number } | null = null;
  private onArrivalCallback: (() => void) | null = null;

  // Pelacakan input tombol berlawanan (Anti Moonwalking / Jalan Mundur)
  private leftDownTime: number = 0;
  private rightDownTime: number = 0;
  private upDownTime: number = 0;
  private downDownTime: number = 0;
  private prevLeft: boolean = false;
  private prevRight: boolean = false;
  private prevUp: boolean = false;
  private prevDown: boolean = false;

  // Status Karakter
  private actionState: CharacterActionState = 'grounded';

  // ==========================================================================
  // PARAMETER SISTEM LOMPAT (JUMPING SYSTEM) - FISIKA MARIO RETRO
  // ==========================================================================
  private isJumping: boolean = false;
  private isCharging: boolean = false;
  private jumpCount: number = 0;
  private readonly maxJumps: number = 2; // Mendukung Lompat 2x (Double Jump)
  private currentJumpZ: number = 0; // Ketinggian visual Z saat ini dalam pixel
  private jumpVelocityZ: number = 0; // Kecepatan vertikal ke atas (px/detik)
  private readonly jumpGravityZ: number = -1900; // Gravitasi lompatan gesit & lincah
  private readonly jumpLaunchVz: number = 640; // Kecepatan awal lompat pertama instan & ringan (~108px puncak)
  private readonly doubleJumpLaunchVz: number = 520; // Dorongan ekstra lompat kedua di udara
  private jumpLaunchVx: number = 0;
  private jumpLaunchVy: number = 0;

  // Timer transisi visual tahap lompatan (Charge -> Jump -> InAir -> Landing)
  private chargeTimer: Phaser.Time.TimerEvent | null = null;
  private inAirTimer: Phaser.Time.TimerEvent | null = null;
  private landingTimer: Phaser.Time.TimerEvent | null = null;

  // Pelacakan Efek Ramuan Apotek Farma (Terkoneksi ke PotionManager Singleton)
  /**
   * Cek apakah pemain berada di zona lapangan minigame (Sepakbola, Basket, Volly).
   * Seluruh efek ramuan dinonaktifkan di area ini sesuai aturan permainan.
   */
  public isInSportsMinigameArea(): boolean {
    return false;
  }

  /**
   * Cek apakah efek ramuan tertentu sedang aktif dan tidak berada di lapangan olahraga
   */
  public isPotionActive(type: string): boolean {
    if (this.isInSportsMinigameArea()) return false;
    return PotionManager.getInstance().isBuffActive(type);
  }

  /**
   * Mengaktifkan efek ramuan dengan durasi detik
   */
  public applyPotionBuff(type: string, durationSec: number): void {
    PotionManager.getInstance().applyBuff(type, undefined, undefined, durationSec);
  }

  // Pelacakan terhalang rintangan saat navigasi otomatis (Anti-stuck pada dinding/objek)
  private lastNavPosX: number = 0;
  private lastNavPosY: number = 0;
  private navStuckTime: number = 0;

  /** Objek Graphics Phaser untuk menggambar garis-garis titik pendaratan di lantai */
  private landingGraphics: Phaser.GameObjects.Graphics;

  /** Objek Graphics untuk partikel debu/riak pendaratan */
  private landingDustGraphics: Phaser.GameObjects.Graphics;
  private landingDustTime: number = 0;
  private landingDustPos: { x: number; y: number } = { x: 0, y: 0 };

  /** Objek Graphics & array untuk efek bola-bola bulat saat berlari (Sprint Dust Balls) */
  private runDustGraphics: Phaser.GameObjects.Graphics;
  private runPuffBalls: IRunPuffBall[] = [];
  private runStepFoot: boolean = false;
  private enableMovementEffects: boolean = true;

  /** Objek Graphics untuk Tanda Kristal Melayang pada Klik/Tap Navigasi */
  private crystalGraphics: Phaser.GameObjects.Graphics;

  // Animasi Deformasi Squishy Mario (Squash & Stretch)
  private currentSquashX: number = 1.0;
  private currentSquashY: number = 1.0;
  private landingSquashTween: Phaser.Tweens.Tween | null = null;

  // ==========================================================================
  // PARAMETER SISTEM MEMANCING (FISHING SYSTEM)
  // ==========================================================================
  private fishingState: FishingState = 'none';
  private fishingStateStartTime: number = 0;
  private bobberPos: { x: number; y: number } = { x: 0, y: 0 };
  private targetBobberPos: { x: number; y: number } = { x: 0, y: 0 };
  private biteTimer: number = 0;
  private biteTimeout: number = 0;
  private lastCaughtFish: IFishData | null = null;

  // Parameter Lemparan Kail Berdasarkan Tahanan Tombol (Hold-to-Cast Mechanics)
  private castPower: number = 0.2; // 0.1 s/d 1.0 (kekuatan lemparan)
  private castPowerDir: number = 1; // 1 = naik, -1 = turun
  private lastCastPower: number = 0.5; // Mengukur jarak lemparan terakhir

  /** Objek Graphics untuk joran, senar pancing melengkung, pelampung & riak air */
  private fishingGraphics: Phaser.GameObjects.Graphics;
  private isFishingGraphicsDrawn: boolean = false;
  private isCrystalGraphicsDrawn: boolean = false;

  // Key controls
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyF!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;

  constructor(player: Player, scene: Phaser.Scene) {
    this.player = player;
    this.scene = scene;
    this.sound = SoundManager.getInstance();
    this.speed = player.getSpeed?.() || 380;

    // Buat lapisan visual grafis langsung di dalam Container Player untuk indikator pendaratan
    // (Bebas jitter 100% karena bergerak bersama matrix GPU transform pemain, bukan koordinat dunia terbulat)
    this.landingGraphics = scene.add.graphics();
    this.player.add(this.landingGraphics);
    this.player.sendToBack(this.landingGraphics);
    this.landingGraphics.setPosition(0, 0);

    this.landingDustGraphics = scene.add.graphics();
    this.landingDustGraphics.setDepth(player.y - 1);

    this.runDustGraphics = scene.add.graphics();
    this.runDustGraphics.setDepth(player.y - 1);

    // Buat lapisan grafis untuk Tanda Kristal Melayang titik tujuan navigasi
    this.crystalGraphics = scene.add.graphics();
    this.crystalGraphics.setDepth(99999);

    // Buat lapisan grafis di atas pemain untuk joran dan senar pancing
    this.fishingGraphics = scene.add.graphics();
    this.fishingGraphics.setDepth(player.y + 100);

    this.setupInputs();
    this.bindEvents();
  }

  /**
   * Mengatur listener tombol aksi keyboard khusus
   */
  private setupInputs(): void {
    if (this.scene.input.keyboard) {
      this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false);
      this.keyF = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F, false);
      this.keyE = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E, false);
      this.keyShift = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false);

      // Listener tombol SHIFT (Lari Cepat / Sprint)
      this.keyShift.on('down', () => {
        if (this.isTyping()) return;
        this.isRunning = true;
      });
      this.keyShift.on('up', () => {
        if (this.isTyping()) return;
        this.isRunning = false;
      });

      // Listener tombol SPASI (Lompat / Double Jump / Strike Mancing)
      this.keySpace.on('down', () => {
        if (this.isTyping()) return;
        // Jika ada tombol UI yang sedang terfokus di browser, lepas fokus agar tidak terpicu
        if (document.activeElement && (document.activeElement as HTMLElement).blur && document.activeElement !== document.body) {
          (document.activeElement as HTMLElement).blur();
        }
        if (this.fishingState === 'bite') {
          this.strikeFish();
        } else if (this.fishingState === 'none') {
          this.jump();
        }
      });

      // Listener tombol F fleksibel (Menanam Biji / Memancing Pancing / Cangkul / Penyiram / Panen)
      this.keyF.on('down', () => {
        if (this.isTyping()) return;
        this.handleFlexibleToolKeyDown();
      });

      this.keyF.on('up', () => {
        if (this.isTyping()) return;
        this.handleFlexibleToolKeyUp();
      });
    }
  }

  /**
   * Aksi Fleksibel Tombol [F] & Tombol Mobile:
   * - Sedang mancing -> Strike / Batalkan
   * - Dekat tanaman siap panen -> Panen langsung!
   * - Memegang Biji/Bibit (seed_*) -> Tanam di lahan Kebun Tani
   * - Memegang Joran Pancing (tool_rod_* / tool_fishing_rod_*) -> Mancing (Hold-to-Cast)
   * - Memegang Cangkul / Penyiram -> Gemburkan tanah / Siram tanaman
   * - Memegang Makanan / Ramuan -> Konsumsi langsung
   */
  public handleFlexibleToolKeyDown(): void {
    // 0. Jika minigame memancing sedang terbuka di layar, serahkan 100% input ke FishingMinigame UI
    if (this.fishingState === 'minigame') {
      return;
    }

    if (this.fishingState === 'bite') {
      this.strikeFish();
      return;
    }
    if (this.fishingState === 'waiting' || this.fishingState === 'casting') {
      this.stopFishing('Membatalkan memancing...');
      return;
    }
    if (this.fishingState === 'charging') {
      // Pemain sedang menahan tombol [F] untuk menimbang lemparan kail (Hold-to-Cast).
      // Jangan lepaskan kail di sini! Auto-repeat keyboard di PC harus diabaikan agar bar kekuatan bisa terus terisi!
      return;
    }
    if (this.fishingState === 'caught') {
      this.stopFishing();
      return;
    }
    if (this.fishingState !== 'none') return;

    const inv = InventoryManager.getInstance();
    const activeItem = inv.getActiveItem();

    // Prioritas 1: Pegang Joran Pancing -> Memancing (Hold-to-Cast)!
    // Diprioritaskan utama agar tidak pernah terganggu oleh kebun, panen, atau cangkul
    if (InventoryManager.isRodItem(activeItem)) {
      this.startChargingCast();
      return;
    }

    // Prioritas 2: Panen tanaman matang di depan/bawah kaki pemain (jika memegang cangkul atau tangan biasa)
    if (this.scene.scene.key === 'WorldScene' && WorldFarming.hasRipeCropNearPlayer(this.player)) {
      WorldFarming.tryHarvestNearPlayer(this.player);
      return;
    }

    // Prioritas 3: Pegang Biji / Bibit -> Tanam di Kebun Tani!
    if (InventoryManager.isSeedItem(activeItem) && activeItem) {
      if (this.scene.scene.key !== 'WorldScene') {
        this.sound.playError();
        this.player.showSpeechBubble('🌱 Keluar gedung dulu dan pergi ke Kebun Tani [58, 5] untuk menanam!');
        return;
      }
      WorldFarming.handleSeedAction(this.player, activeItem);
      return;
    }

    // Prioritas 4: Pegang Cangkul -> Gemburkan / Panen!
    if (InventoryManager.isHoeItem(activeItem)) {
      if (this.scene.scene.key !== 'WorldScene') {
        this.sound.playError();
        this.player.showSpeechBubble('⛏️ Cangkul hanya bisa dipakai di Kebun Tani [58, 5]!');
        return;
      }
      WorldFarming.handleHoeAction(this.player);
      return;
    }

    // Prioritas 5: Pegang Tong Penyiram -> Siram Tanaman atau Isi Air di Pantai/Laut!
    if (InventoryManager.isWateringCanItem(activeItem)) {
      if (this.scene.scene.key !== 'WorldScene') {
        this.sound.playError();
        this.player.showSpeechBubble('💧 Keluar gedung dulu untuk menyiram kebun atau isi air di pantai!');
        return;
      }

      const px = this.player.x;
      const py = this.player.y;
      const gx = Math.floor(px / 120);
      const gy = Math.floor(py / 120);

      // Cek apakah pemain berada di bibir air pantai/lautan untuk isi tong air
      const isFacingWater = this.findWaterAhead(90, 440);
      const isBeachOrOcean = gy >= 63 || (gx >= 61 && gy >= 16);

      if ((isFacingWater || isBeachOrOcean) && !WorldFarming.isFarmGrid(gx, gy)) {
        const currentWater = activeItem.extraData?.water ?? 10;
        if (currentWater >= 10) {
          this.sound.playClick();
          this.player.showSpeechBubble('🪣 Tong air sudah penuh (10/10)!\nBawa ke Kebun Tani Pak Tani Somad [61, 10] untuk menyiram.');
          return;
        }

        activeItem.extraData = { ...(activeItem.extraData || {}), water: 10, maxWater: 10 };
        activeItem.description =
          'Tong penyiram tanaman (10/10 air). Syarat menanam: 1. cangkul, 2. siram air, 3. tanam bibit, 4. tunggu 24 jam, 5. panen. Tekan [F] di bibir pantai/laut untuk isi ulang.';
        inv.updateItem(inv.getActiveSlotIndex(), activeItem);
        this.sound.playFishSplash();
        this.player.showSpeechBubble(
          '🌊💧 TONG AIR TERISI PENUH (10/10)!\nAir segar dari pantai/laut siap dipakai menyiram kebun.'
        );
        return;
      }

      WorldFarming.handleWateringAction(this.player);
      return;
    }

    // Prioritas 6: Pegang Makanan / Ramuan -> Pakai langsung!
    if (activeItem && (activeItem.category === 'consumable' || activeItem.category === 'crop') && activeItem.usable) {
      const res = inv.useItem(inv.getActiveSlotIndex());
      if (res.message) {
        this.player.showSpeechBubble(res.message);
      }
      return;
    }

    // Slot kosong atau material biasa -> Beri petunjuk kontekstual cerdas
    this.sound.playClick();
    if (this.findWaterAhead(80, 440)) {
      this.player.showSpeechBubble('🎣 Pilih Joran Pancing di Hotbar [1-6] untuk memancing!');
    } else if (
      this.scene.scene.key === 'WorldScene' &&
      WorldFarming.isFarmGrid(Math.floor(this.player.x / 120), Math.floor(this.player.y / 120))
    ) {
      this.player.showSpeechBubble('🌱 Pilih Bibit Tanaman di Hotbar [1-6] untuk menanam di kebun!');
    } else {
      this.player.showSpeechBubble('🖐️ Pegang Pancing [🎣] untuk mancing, atau Bibit [🌱] untuk menanam!');
    }
  }

  public handleFlexibleToolKeyUp(): void {
    if (this.fishingState === 'charging') {
      this.releaseCast();
    }
  }

  /**
   * Mendaftarkan event bus untuk kompatibilitas UI React (Mobile & Desktop)
   */
  private bindEvents(): void {
    const onJoystickMove = (vec: { x: number; y: number }) => {
      this.joystickVector = vec;
      this.targetDestination = null;
      this.crystalGraphics.clear();
      this.onArrivalCallback = null;
    };
    const onJoystickEnd = () => {
      this.joystickVector = null;
    };

    const onPlayerJump = () => {
      if (this.fishingState === 'bite') {
        this.strikeFish();
      } else {
        this.jump();
      }
    };

    const onPlayerFish = () => {
      this.handleFlexibleToolKeyDown();
    };

    const onFishChargeStart = () => {
      this.handleFlexibleToolKeyDown();
    };

    const onFishChargeRelease = () => {
      this.handleFlexibleToolKeyUp();
    };

    const onPlayerAction = () => {
      if (this.fishingState === 'bite') {
        this.strikeFish();
      }
    };

    const onPlayerStrike = () => {
      if (this.fishingState === 'bite') {
        this.strikeFish();
      }
    };

    const onFishingMinigameSuccess = (data: { fish: IFishData }) => {
      if (this.fishingState === 'minigame') {
        this.finishCatch(data?.fish || this.lastCaughtFish || FISH_LOOT_TABLE[0]);
      }
    };

    const onFishingMinigameFailed = () => {
      if (this.fishingState === 'minigame') {
        this.stopFishing('Yah, ikannya lepas kabur! Coba lagi...');
      }
    };

    EventBus.on('joystick-move', onJoystickMove);
    EventBus.on('joystick-end', onJoystickEnd);
    EventBus.on('player-jump', onPlayerJump);
    EventBus.on('player-fish', onPlayerFish);
    EventBus.on('player-action', onPlayerAction);
    EventBus.on('player-strike', onPlayerStrike);
    EventBus.on('fishing-charge-start', onFishChargeStart);
    EventBus.on('fishing-charge-release', onFishChargeRelease);
    EventBus.on('fish-charge-release', onFishChargeRelease);
    EventBus.on('fishing-cast-release', onFishChargeRelease);
    EventBus.on('fishing-minigame-success', onFishingMinigameSuccess);
    EventBus.on('fishing-minigame-failed', onFishingMinigameFailed);

    const onPlayerRunStart = () => {
      this.isRunning = true;
    };
    const onPlayerRunEnd = () => {
      this.isRunning = false;
    };
    const onPlayerRunToggle = (forced?: boolean) => {
      this.isRunning = typeof forced === 'boolean' ? forced : !this.isRunning;
    };

    EventBus.on('player-run-start', onPlayerRunStart);
    EventBus.on('player-run-end', onPlayerRunEnd);
    EventBus.on('player-run-toggle', onPlayerRunToggle);

    const onPotionConsumed = (data: { potionType: string; potionName: string; durationSec: number }) => {
      this.applyPotionBuff(data.potionType, data.durationSec);
      this.player.showSpeechBubble(`✨ Efek ${data.potionName} Aktif! (${data.durationSec}s)`);
    };
    EventBus.on('player-consumed-potion', onPotionConsumed);

    try {
      const gs = JSON.parse(localStorage.getItem('raden_game_settings') || '{}');
      if (gs.enableMovementEffects === false) {
        this.enableMovementEffects = false;
      }
    } catch (e) {}

    const onGraphicsSettingsUpdated = (data: any) => {
      if (typeof data?.enableMovementEffects === 'boolean') {
        this.enableMovementEffects = data.enableMovementEffects;
        if (!this.enableMovementEffects) {
          this.landingDustGraphics?.clear();
          this.runDustGraphics?.clear();
        }
      }
    };
    EventBus.on('graphics-settings-updated', onGraphicsSettingsUpdated);

    this.player.once(Phaser.GameObjects.Events.DESTROY, () => {
      EventBus.off('joystick-move', onJoystickMove);
      EventBus.off('joystick-end', onJoystickEnd);
      EventBus.off('player-jump', onPlayerJump);
      EventBus.off('player-fish', onPlayerFish);
      EventBus.off('player-action', onPlayerAction);
      EventBus.off('player-strike', onPlayerStrike);
      EventBus.off('fishing-charge-start', onFishChargeStart);
      EventBus.off('fishing-charge-release', onFishChargeRelease);
      EventBus.off('fish-charge-release', onFishChargeRelease);
      EventBus.off('fishing-cast-release', onFishChargeRelease);
      EventBus.off('fishing-minigame-success', onFishingMinigameSuccess);
      EventBus.off('fishing-minigame-failed', onFishingMinigameFailed);
      EventBus.off('player-run-start', onPlayerRunStart);
      EventBus.off('player-run-end', onPlayerRunEnd);
      EventBus.off('player-run-toggle', onPlayerRunToggle);
      EventBus.off('player-consumed-potion', onPotionConsumed);
      EventBus.off('graphics-settings-updated', onGraphicsSettingsUpdated);
      this.landingGraphics?.destroy();
      this.landingDustGraphics?.destroy();
      this.runDustGraphics?.destroy();
      this.crystalGraphics?.destroy();
      this.fishingGraphics?.destroy();
      if (this.chargeTimer) this.chargeTimer.remove();
      if (this.inAirTimer) this.inAirTimer.remove();
      if (this.landingTimer) this.landingTimer.remove();
    });
  }

  /** Cek apakah pemain sedang mengetik di input box chat / form */
  private isTyping(): boolean {
    const active = document.activeElement;
    return active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA';
  }

  // ==========================================================================
  // IMPLEMENTASI SISTEM LOMPAT (JUMPING)
  // Lompatan 1 (4 Tahap): 1. Charge -> 2. Jump -> 3. InAir -> 4. Landing
  // Lompatan 2 (3 Tahap): 1. Jump -> 2. InAir -> 3. Landing
  // ==========================================================================

  // Waktu peluncuran lompatan terakhir (untuk debounce double jump saat spam)
  private lastLaunchTime: number = 0;

  /**
   * Memicu aksi lompat karakter (Mendukung Lompat Pertama 4-Tahap & Double Jump 3-Tahap)
   */
  public jump(): boolean {
    // Tidak boleh lompat jika sedang mancing atau pergerakan terkunci
    if (this.fishingState !== 'none' || this.isMovementLocked()) {
      return false;
    }

    // Batasi maksimum lompatan (Lompat pertama dari tanah, lompat kedua di udara, lompat ketiga jika ada Ramuan)
    const effectiveMaxJumps = this.isPotionActive('triple_jump') ? 3 : this.maxJumps;
    if (this.jumpCount >= effectiveMaxJumps) {
      return false;
    }

    // Jika sedang dalam masa charge persiapan lompat 1, tahan agar tidak dobel input sebelum lepas landas
    if (this.isCharging) {
      return false;
    }

    // Jika sedang dalam pose landing recovery, batalkan dan kembalikan bentuk skala normal
    if (this.landingSquashTween) {
      this.landingSquashTween.stop();
      this.landingSquashTween = null;
      this.player.resetSquashStretch();
    }
    if (this.landingTimer) {
      this.landingTimer.remove();
      this.landingTimer = null;
    }

    if (this.jumpCount === 0) {
      // ======================================================================
      // LOMPATAN PERTAMA (RESPONSIF, INSTAN & RINGAN TANPA DELAY)
      // Karakter langsung lepas landas seketika saat tombol ditekan
      // ======================================================================
      this.jumpCount = 1;
      this.isJumping = true;
      this.isCharging = false;
      this.actionState = 'jumping';
      this.currentJumpZ = 0;
      this.jumpVelocityZ = this.jumpLaunchVz + (this.isPotionActive('high_jump') ? 240 : 0);
      this.lastLaunchTime = this.scene.time.now;

      // Bersihkan timer lama jika ada
      if (this.chargeTimer) {
        this.chargeTimer.remove();
        this.chargeTimer = null;
      }

      // Suara & animasi langsung lepas landas
      this.sound.playJump(false);
      this.player.setJumpVisualStage('jump');

      // Efek Squishy Halus: Angkat vertikal melesat (stretch 5%)
      this.currentSquashX = 0.96;
      this.currentSquashY = 1.05;
      this.player.setSquashStretch(this.currentSquashX, this.currentSquashY);

      // SINKRONISASI JARINGAN MULTIPLAYER KE SERVER
      NetworkManager.getInstance().sendJump(1, this.player.x, this.player.y);

      // Flash putih sekejap dan hembusan debu lepas landas
      this.player.triggerJumpWhiteFlash(90);
      this.triggerLandingDust(this.player.x, this.player.y + 12);

      EventBus.emit('player-jump-started', {
        x: this.player.x,
        y: this.player.y,
        jumpCount: 1,
        jumpZ: this.currentJumpZ,
      });

      return true;
    } else if (this.jumpCount === 1) {
      // ======================================================================
      // LOMPATAN KEDUA / DOUBLE JUMP (3 TAHAP: Jump -> InAir -> Landing)
      // Tanpa tahap charge, langsung dorongan takeoff di udara!
      // ======================================================================
      // Anti-spam protection: Karakter harus sudah benar-benar di udara
      // (ketinggian Z > 10px dan minimal 100ms setelah peluncuran lompat pertama)
      const now = this.scene.time.now;
      if (this.currentJumpZ < 10 || (now - this.lastLaunchTime < 100)) {
        return false;
      }

      this.jumpCount = 2;
      this.isJumping = true;
      this.isCharging = false;
      this.actionState = 'jumping';

      if (this.chargeTimer) {
        this.chargeTimer.remove();
        this.chargeTimer = null;
      }

      // 1. TAHAP JUMP LANGSUNG DI UDARA (Dorongan vertikal kedua)
      this.jumpVelocityZ = this.doubleJumpLaunchVz + (this.isPotionActive('high_jump') ? 260 : 0); // 560 px/s (+260 dengan ramuan)
      this.sound.playJump(true);
      this.player.setJumpVisualStage('jump');

      // Efek Squishy Halus: Dorongan vertikal kedua (stretch 5%)
      this.currentSquashX = 0.96;
      this.currentSquashY = 1.05;
      this.player.setSquashStretch(this.currentSquashX, this.currentSquashY);

      // Partikel kabut/riak udara di bawah kaki di ketinggian melayang saat ini
      this.triggerLandingDust(this.player.x, this.player.y - this.currentJumpZ + 12);
      this.player.showSpeechBubble('⭐ Double Jump!', 750);

      // SINKRONISASI JARINGAN MULTIPLAYER KE SERVER
      NetworkManager.getInstance().sendJump(2, this.player.x, this.player.y);
      this.player.triggerJumpWhiteFlash(150);

      EventBus.emit('player-jump-started', {
        x: this.player.x,
        y: this.player.y,
        jumpCount: 2,
        jumpZ: this.currentJumpZ,
      });

      return true;
    } else if (this.jumpCount === 2 && this.isPotionActive('triple_jump')) {
      // ======================================================================
      // LOMPATAN KETIGA / TRIPLE JUMP (KHUSUS EFEK RAMUAN APOTEK)
      // ======================================================================
      const now = this.scene.time.now;
      if (this.currentJumpZ < 10 || (now - this.lastLaunchTime < 100)) {
        return false;
      }

      this.jumpCount = 3;
      this.isJumping = true;
      this.isCharging = false;
      this.actionState = 'jumping';

      this.jumpVelocityZ = this.doubleJumpLaunchVz + 60;
      this.sound.playJump(true);
      this.player.setJumpVisualStage('jump');

      this.triggerLandingDust(this.player.x, this.player.y - this.currentJumpZ + 12);
      this.player.showSpeechBubble('🌟 Triple Jump (Ramuan)!', 800);

      NetworkManager.getInstance().sendJump(3, this.player.x, this.player.y);
      this.player.triggerJumpWhiteFlash(150);

      EventBus.emit('player-jump-started', {
        x: this.player.x,
        y: this.player.y,
        jumpCount: 3,
        jumpZ: this.currentJumpZ,
      });

      return true;
    }

    return false;
  }

  /**
   * Update frame per frame untuk fisika vertikal gravitasi lompat,
   * transisi tahap visual dinamis sesuai ketinggian & kecepatan vertikal,
   * serta deformasi Squishy Mario (Squash & Stretch) yang proporsional dan halus
   */
  private updateJump(time: number, delta: number): void {
    if (!this.isJumping) return;

    if (this.isCharging) {
      // Tahap 1: Karakter masih di tanah bersiap melompat (Charge Crouch)
      this.drawLandingIndicator();
      return;
    }

    const dt = Math.min(0.05, delta / 1000); // delta waktu dalam detik

    // Terapkan akselerasi gravitasi Z ke kecepatan vertikal
    this.jumpVelocityZ += this.jumpGravityZ * dt;
    this.currentJumpZ += this.jumpVelocityZ * dt;

    // Geser elemen visual karakter ke atas (Z visual offset)
    this.player.setVisualYOffset(-Math.max(0, this.currentJumpZ));

    // Gambar garis indikator pendaratan yang 100% mulus (smooth tanpa flickering/geser)
    this.drawLandingIndicator();

    // ========================================================================
    // EVALUASI TAHAPAN LOMPAT & EFEK SQUISHY HALUS BERDASARKAN FISIKA
    // 2. Animasi jump saat sebelum lompat max tertinggi (Vz > 40 px/s)
    // 3. Saat sampai atas baru animasi inAir sampai turun (Apex & Descent)
    // 4. Saat hampir menyentuh ground pakai animasi landing (Z <= 40 px saat turun)
    // ========================================================================
    let targetStage: JumpVisualStage = 'inAir';
    let targetSx = 1.0;
    let targetSy = 1.0;

    if (this.jumpVelocityZ > 40) {
      // 2. TAHAP JUMP: Meluncur naik sebelum mencapai titik tertinggi (Subtle Stretch)
      targetStage = 'jump';
      targetSx = 0.96;
      targetSy = 1.05;
    } else if (this.currentJumpZ > 40 || this.jumpVelocityZ >= 0) {
      // 3. TAHAP INAIR: Saat sampai atas (Puncak / Apex) sampai meluncur turun
      targetStage = 'inAir';
      if (Math.abs(this.jumpVelocityZ) <= 100) {
        // Melayang tenang di puncak lengkungan tertinggi (Proporsi Asli Alami)
        targetSx = 1.0;
        targetSy = 1.0;
      } else {
        // Sedang meluncur jatuh ke bawah (Falling halus)
        targetSx = 0.98;
        targetSy = 1.03;
      }
    } else {
      // 4. TAHAP LANDING: Saat hampir menyentuh ground (Z <= 40 px dan sedang meluncur turun)
      targetStage = 'landing';
      targetSx = 1.03;
      targetSy = 0.97;
    }

    // Terapkan tahap visual sprite jika ada pergantian
    if (this.player.getJumpVisualStage() !== targetStage) {
      this.player.setJumpVisualStage(targetStage);
    }

    // Terapkan interpolasi Deformasi Squishy halus selama di udara
    this.currentSquashX += (targetSx - this.currentSquashX) * Math.min(1.0, dt * 12);
    this.currentSquashY += (targetSy - this.currentSquashY) * Math.min(1.0, dt * 12);
    this.player.setSquashStretch(this.currentSquashX, this.currentSquashY);

    // ========================================================================
    // SENTUH TANAH (TOUCHDOWN / IMPACT PENDARATAN)
    // Karakter menyentuh tanah dan menyerap hentakan dengan Squishy Recoil halus
    // ========================================================================
    if (this.currentJumpZ <= 0 && this.jumpVelocityZ <= 0) {
      this.isJumping = false;
      this.jumpCount = 0; // Reset counter lompat saat mendarat
      this.actionState = 'grounded';
      this.currentJumpZ = 0;
      this.jumpVelocityZ = 0;
      this.player.setVisualYOffset(0);

      // Bersihkan garis indikator pendaratan
      this.landingGraphics.clear();

      // Memicu efek partikel debu/riak pendaratan
      this.triggerLandingDust(this.player.x, this.player.y);

      // Mainkan efek suara mendarat (Thud)
      this.sound.playLand();

      // Karakter tetap di animasi Landing saat menapak tanah
      this.player.setJumpVisualStage('landing');

      // EFEK SQUISHY MENDARAT CEPAT & LINCAH (~3%)
      this.currentSquashX = 1.03;
      this.currentSquashY = 0.97;
      this.player.setSquashStretch(this.currentSquashX, this.currentSquashY);

      if (this.landingSquashTween) {
        this.landingSquashTween.stop();
      }
      const squashTarget = { sx: 1.03, sy: 0.97 };
      this.landingSquashTween = this.scene.tweens.add({
        targets: squashTarget,
        sx: 1.0,
        sy: 1.0,
        duration: 60,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          this.currentSquashX = squashTarget.sx;
          this.currentSquashY = squashTarget.sy;
          this.player.setSquashStretch(squashTarget.sx, squashTarget.sy);
        },
        onComplete: () => {
          this.currentSquashX = 1.0;
          this.currentSquashY = 1.0;
          this.player.resetSquashStretch();
          this.landingSquashTween = null;
          // Kembali ke pose jalan/idle setelah benturan pendaratan selesai
          if (!this.isJumping) {
            this.player.setJumpVisualStage('none');
          }
        },
      });

      EventBus.emit('player-landed', {
        x: this.player.x,
        y: this.player.y,
      });
    }
  }

  /**
   * Menggambar indikator proyeksi pendaratan di lantai yang 100% MULUS & STABIL (Bebas Jitter):
   * Digambar langsung di dalam container Player pada koordinat lokal (0, 12)
   * sehingga bergerak presisi bersama matrix transform GPU karakter tanpa selisih pembulatan pixel!
   */
  private drawLandingIndicator(): void {
    this.landingGraphics.clear();

    const maxRefHeight = 220;
    // 1. Bayangan dasar di tanah (menyesuaikan skala dengan ketinggian melayang Z)
    const shadowAlpha = Math.max(0.18, 0.52 * (1 - this.currentJumpZ / maxRefHeight));
    const shadowScale = Math.max(0.48, 1 - (this.currentJumpZ / maxRefHeight) * 0.45);

    const lx = 0;
    const ly = 12;

    this.landingGraphics.fillStyle(0x000000, shadowAlpha);
    this.landingGraphics.fillEllipse(lx, ly, 56 * shadowScale, 20 * shadowScale);

    // Warna indikator: Cyan elektrik saat Double Jump, Emas Amber saat lompat biasa
    const isDouble = this.jumpCount === 2;
    const mainColor = isDouble ? 0x38bdf8 : 0xffe600;
    const accentColor = isDouble ? 0xa5f3fc : 0xffffff;
    const lineAlpha = 0.9;

    // 2. Garis Panduan Vertikal: Berjangkar statis dari lantai (0, 12) ke kaki pemain di udara (0, 12 - currentJumpZ)
    const playerFeetAirY = ly - this.currentJumpZ;
    if (this.currentJumpZ > 8) {
      this.landingGraphics.lineStyle(1.5, mainColor, 0.6);
      const dashStep = 8;
      for (let y = ly; y > playerFeetAirY; y -= dashStep * 2) {
        const topY = Math.max(playerFeetAirY, y - dashStep);
        this.landingGraphics.lineBetween(lx, y, lx, topY);
      }
    }

    // 3. Lingkaran Luar Halus Stabil di Lantai (Smooth Outer Ring, Bebas Jitter)
    const rx = 34;
    const ry = 17;
    this.landingGraphics.lineStyle(2, mainColor, lineAlpha);
    this.landingGraphics.strokeEllipse(lx, ly, rx * 2, ry * 2);

    // 4. Lingkaran Dalam Aksen (Inner Accent Ring)
    this.landingGraphics.lineStyle(1, accentColor, lineAlpha * 0.65);
    this.landingGraphics.strokeEllipse(lx, ly, 44, 22);

    // 5. Garis Bidik Silang 4 Arah (Crosshair Ticks Presisi)
    this.landingGraphics.lineStyle(2, mainColor, lineAlpha);
    // Kiri & Kanan
    this.landingGraphics.lineBetween(lx - rx - 8, ly, lx - rx + 3, ly);
    this.landingGraphics.lineBetween(lx + rx - 3, ly, lx + rx + 8, ly);
    // Atas & Bawah
    this.landingGraphics.lineBetween(lx, ly - ry - 6, lx, ly - ry + 2);
    this.landingGraphics.lineBetween(lx, ly + ry - 2, lx, ly + ry + 6);

    // Titik Pusat Bidik
    this.landingGraphics.fillStyle(accentColor, lineAlpha);
    this.landingGraphics.fillCircle(lx, ly, 2.5);
  }

  /**
   * Memicu efek riak debu pendaratan (Landing Dust Ripples)
   */
  private triggerLandingDust(x: number, y: number): void {
    if (!this.enableMovementEffects) return;
    this.landingDustTime = this.scene.time.now;
    this.landingDustPos = { x, y: y + 12 };
  }

  /**
   * Update efek riak debu setelah mendarat
   */
  private updateLandingDust(time: number): void {
    if (!this.enableMovementEffects || this.landingDustTime === 0) {
      if (this.landingDustGraphics) this.landingDustGraphics.clear();
      return;
    }

    const elapsed = time - this.landingDustTime;
    const dur = 280; // 280ms animasi pudar
    if (elapsed > dur) {
      this.landingDustTime = 0;
      this.landingDustGraphics.clear();
      return;
    }

    const progress = elapsed / dur;
    const alpha = (1 - progress) * 0.7;
    const rOuter = 20 + progress * 26;

    this.landingDustGraphics.clear();
    this.landingDustGraphics.setDepth(this.player.y - 1);

    // Riak luar
    this.landingDustGraphics.lineStyle(2, 0xffe600, alpha);
    this.landingDustGraphics.strokeEllipse(this.landingDustPos.x, this.landingDustPos.y, rOuter * 2, rOuter);

    // Riak dalam
    this.landingDustGraphics.lineStyle(1.5, 0xffffff, alpha * 0.8);
    this.landingDustGraphics.strokeEllipse(this.landingDustPos.x, this.landingDustPos.y, (rOuter - 10) * 2, rOuter - 10);
  }

  /**
   * Memicu efek partikel bola-bola imut saat karakter berlari kencang (Sprint)
   * Bergaya kartun RPG: bola-bola debu bulat (puff balls) yang menggelinding di lantai
   * tepat di bawah telapak kaki (bergantian kaki kiri dan kanan), BUKAN melayang ke atas (bukan lompat).
   */
  private triggerRunDustBall(time: number, vx: number, vy: number): void {
    if (!this.enableMovementEffects) return;
    const dirLen = Math.hypot(vx, vy) || 1;
    const normX = vx / dirLen;
    const normY = vy / dirLen;

    // Vektor tegak lurus (perpendicular) untuk membedakan langkah kaki kiri dan kanan
    const perpX = -normY;
    const perpY = normX;

    // Bergantian kaki kiri (-1) dan kaki kanan (+1)
    this.runStepFoot = !this.runStepFoot;
    const footSide = this.runStepFoot ? 1 : -1;

    // Posisi kontak telapak kaki persis di permukaan lantai (player.y + 52)
    const footX = this.player.x - normX * 10 + perpX * (footSide * 8);
    const footY = this.player.y + 52 - normY * 5 + perpY * (footSide * 3);

    // Buat 1 kluster kartun berisi 3 bola bulat imut bertumpuk (1 bola utama, 1 bola samping, 1 bola kecil mengekor)
    // 1. Bola Utama di titik hentakan kaki
    this.runPuffBalls.push({
      x: footX + (Math.random() - 0.5) * 3,
      y: footY + (Math.random() - 0.5) * 2,
      vx: -normX * (15 + Math.random() * 10),
      vy: -normY * (6 + Math.random() * 6), // Menggelinding di lantai, tidak melayang ke atas
      baseRadius: 9.5 + Math.random() * 2.2, // Radius ~9.5 - 11.7px
      birthTime: time,
      duration: 280 + Math.random() * 50,
      color: 0xffffff,
      strokeColor: 0x5c3a21,
    });

    // 2. Bola Samping sekunder (sedikit lebih kecil di samping hentakan)
    this.runPuffBalls.push({
      x: footX - normX * 6 + perpX * (footSide * 4) + (Math.random() - 0.5) * 2,
      y: footY - normY * 3 + perpY * (footSide * 2) + (Math.random() - 0.5) * 2,
      vx: -normX * (19 + Math.random() * 8),
      vy: -normY * (7 + Math.random() * 5),
      baseRadius: 6.8 + Math.random() * 1.6, // Radius ~6.8 - 8.4px
      birthTime: time,
      duration: 250 + Math.random() * 40,
      color: 0xfff8ea,
      strokeColor: 0x5c3a21,
    });

    // 3. Bola Kecil mengekor di belakang
    this.runPuffBalls.push({
      x: footX - normX * 12 + (Math.random() - 0.5) * 3,
      y: footY - normY * 6 + (Math.random() - 0.5) * 2,
      vx: -normX * (23 + Math.random() * 8),
      vy: -normY * (8 + Math.random() * 5),
      baseRadius: 4.4 + Math.random() * 1.2, // Radius ~4.4 - 5.6px
      birthTime: time,
      duration: 210 + Math.random() * 40,
      color: 0xffeed9,
      strokeColor: 0x5c3a21,
    });

    // Batasi maksimum bola aktif untuk performa tinggi (60fps)
    if (this.runPuffBalls.length > 36) {
      this.runPuffBalls.splice(0, this.runPuffBalls.length - 36);
    }
  }

  /**
   * Update visual dan pergerakan bola-bola debu lari (Sprint Dust Balls)
   * Menggambar bola-bola kartun bulat sempurna dengan garis tepi biskuit dan pantulan 3D.
   */
  private updateRunDust(time: number, delta: number): void {
    if (!this.enableMovementEffects || this.runPuffBalls.length === 0) {
      if (this.runDustGraphics) this.runDustGraphics.clear();
      return;
    }

    const dt = delta / 1000;
    this.runDustGraphics.clear();

    // Sesuaikan kedalaman: jika lari ke atas (utara), debu di depan kaki; jika ke bawah, di belakang kaki
    const isMovingUp = this.player.body && (this.player.body as Phaser.Physics.Arcade.Body).velocity.y < -10;
    this.runDustGraphics.setDepth(isMovingUp ? this.player.y + 62 : this.player.y + 50);

    const activeBalls: IRunPuffBall[] = [];

    for (let i = 0; i < this.runPuffBalls.length; i++) {
      const ball = this.runPuffBalls[i];
      const elapsed = time - ball.birthTime;
      if (elapsed > ball.duration) {
        continue;
      }

      // Fisika menggelinding di lantai: perlambatan gesekan tanah (ground friction)
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      ball.vx *= 0.88;
      ball.vy *= 0.88;

      const progress = elapsed / ball.duration;
      // Animasi pop-and-shrink: Meletup membesar sejenak (0 - 25% durasi) lalu mengecil lembut
      const scale = progress < 0.25
        ? 0.55 + (progress / 0.25) * 0.55
        : 1.10 - ((progress - 0.25) / 0.75) * 0.65;
      const currentRadius = Math.max(1.0, ball.baseRadius * scale);
      const alpha = Math.max(0, 1 - Math.pow(progress, 1.4));

      // 1. Isi Bola Bulat Kartun (Solid Pastel Cream / White)
      this.runDustGraphics.fillStyle(ball.color, alpha);
      this.runDustGraphics.fillCircle(ball.x, ball.y, currentRadius);

      // 2. Garis Tepi Biskuit Kokoa Tegas (1.5px Outline #5C3A21)
      this.runDustGraphics.lineStyle(1.5, ball.strokeColor, alpha * 0.9);
      this.runDustGraphics.strokeCircle(ball.x, ball.y, currentRadius);

      // 3. Highlight Pantulan Kilau Bulat 3D di sudut kiri-atas bola
      if (currentRadius > 3.0) {
        const hlRad = Math.max(1.0, currentRadius * 0.28);
        const hlOffset = currentRadius * 0.30;
        this.runDustGraphics.fillStyle(0xffffff, alpha * 0.95);
        this.runDustGraphics.fillCircle(
          ball.x - hlOffset,
          ball.y - hlOffset,
          hlRad
        );
      }

      activeBalls.push(ball);
    }

    this.runPuffBalls = activeBalls;
  }

  // ==========================================================================
  // IMPLEMENTASI SISTEM MEMANCING (FISHING)
  // ==========================================================================

  /**
   * Menangani tombol aksi mancing (Key F atau tombol UI Mancing)
   */
  public handleFishingKeyPress(): void {
    if (this.isMovementLocked() && this.fishingState === 'none') {
      return;
    }

    if (this.fishingState === 'none') {
      this.startFishing();
    } else if (this.fishingState === 'waiting' || this.fishingState === 'casting') {
      // Pemain menarik joran lebih awal (batal memancing)
      this.stopFishing('Membatalkan memancing...');
    } else if (this.fishingState === 'bite') {
      // Pemain berhasil menanggapi tanda seru sambaran ikan!
      this.strikeFish();
    } else if (this.fishingState === 'caught') {
      // Tutup status tangkapan
      this.stopFishing();
    }
  }

  /**
   * Mengecek apakah koordinat dunia (worldX, worldY) merupakan perairan sah untuk memancing
   * Hanya mengizinkan Lautan Timur, Samudra Selatan, Tepi Pantai, dan Kolam Air Mancur Plaza
   */
  public isWaterAt(worldX: number, worldY: number): boolean {
    // Memancing HANYA bisa dilakukan di WorldScene (Open World), dilarang di dalam ruangan (Sekolah/Rumah)
    if (this.scene.scene.key !== 'WorldScene') {
      return false;
    }

    const ts = 120; // 1 petak grid = 120px
    const gx = Math.floor(worldX / ts);
    const gy = Math.floor(worldY / ts);

    // 1. Dilarang jika kail jatuh di atas papan jalan kayu dermaga (trotoar-2)
    const isDockWalkway =
      (gx >= 61 && gx <= 73 && (gy === 26 || gy === 27)) || // Dermaga 1
      (gx >= 61 && gx <= 73 && (gy === 39 || gy === 40)) || // Dermaga 2 (Danu)
      (gx >= 61 && gx <= 73 && (gy === 53 || gy === 54));   // Dermaga 3

    if (isDockWalkway) {
      return false; // Jatuh di lantai kayu dermaga, bukan di air
    }

    // 2. Lautan Kristal Timur (gx: 63..80, gy: 16..64)
    if (gx >= 63 && gx <= 80 && gy >= 16 && gy <= 64) {
      return true;
    }

    // 3. Samudra Selatan Lepas & Bibir Ombak Pantai Selatan (worldY >= 9420)
    if (worldY >= 9420) {
      return true;
    }

    // 4. Perairan Sisi Timur Pantai Selatan (gx >= 79 di gy: 70..78)
    if (gx >= 79 && gy >= 70 && gy <= 78) {
      return true;
    }

    return false;
  }

  /**
   * Memulai proses memancing (Casting)
   * Hanya berhasil jika karakter menghadap dan melempar ke perairan!
   */
  /**
   * Memeriksa apakah ada air di depan karakter dalam jarak lemparan
   */
  private findWaterAhead(minDist: number = 80, maxDist: number = 440): { x: number; y: number; dist: number } | null {
    const dir = this.player.getDirection();
    let bestWater: { x: number; y: number; dist: number } | null = null;

    // Pindai titik perairan dari dekat ke jauh
    for (let dist = minDist; dist <= maxDist; dist += 25) {
      let testX = this.player.x;
      let testY = this.player.y;
      if (dir === 'up') testY -= dist;
      else if (dir === 'down') testY += dist;
      else if (dir === 'left') testX -= dist;
      else if (dir === 'right') testX += dist;

      if (this.isWaterAt(testX, testY)) {
        bestWater = { x: testX, y: testY, dist };
      }
    }

    return bestWater;
  }

  /**
   * Memulai Menahan Tombol untuk Menimbang Kekuatan Lemparan Kail (Hold-to-Cast)
   */
  public startChargingCast(): boolean {
    if (this.isJumping || this.isMovementLocked()) return false;
    if (this.fishingState !== 'none') return false;

    // Pastikan karakter menghadap ke perairan
    const waterCheck = this.findWaterAhead(80, 440);
    if (!waterCheck) {
      if (this.scene.scene.key !== 'WorldScene') {
        this.player.showSpeechBubble('🚫 Kamu tidak bisa memancing di dalam ruangan!');
      } else {
        this.player.showSpeechBubble('🌊 Hadapkan karakter ke air untuk memancing!\n(Dermaga, Tepi Laut, atau Pantai)');
      }
      this.sound.playHover();
      return false;
    }

    this.fishingState = 'charging';
    this.actionState = 'fishing';
    this.fishingStateStartTime = this.scene.time.now;
    this.castPower = 0.15;
    this.castPowerDir = 1;

    // Hentikan pergerakan karakter seketika
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    this.sound.playClick();
    this.player.showSpeechBubble('⏳ Tahan [F] untuk menimbang jarak lemparan!');

    NetworkManager.getInstance().sendFishing('charging');
    EventBus.emit('fishing-charging-started');
    return true;
  }

  /**
   * Melepaskan Tombol untuk Melempar Kail Sesuai Jarak & Kekuatan yang Ditimbang
   */
  public releaseCast(): boolean {
    if (this.fishingState !== 'charging') return false;

    this.lastCastPower = Phaser.Math.Clamp(this.castPower, 0.25, 1.0);
    const dir = this.player.getDirection();

    // Hitung jarak lemparan (110px s/d 440px)
    const minDist = 110;
    const maxDist = 440;
    const targetDist = minDist + this.lastCastPower * (maxDist - minDist);

    // Cari perairan terdekat dengan sasaran jarak tersebut
    let bestPos: { x: number; y: number } | null = null;
    let minDiff = 99999;

    for (let dist = 80; dist <= 480; dist += 20) {
      let testX = this.player.x;
      let testY = this.player.y;
      if (dir === 'up') testY -= dist;
      else if (dir === 'down') testY += dist;
      else if (dir === 'left') testX -= dist;
      else if (dir === 'right') testX += dist;

      if (this.isWaterAt(testX, testY)) {
        const diff = Math.abs(dist - targetDist);
        if (diff < minDiff) {
          minDiff = diff;
          bestPos = { x: testX, y: testY };
        }
      }
    }

    if (!bestPos) {
      this.stopFishing('🚫 Kail tidak mencapai perairan!');
      return false;
    }

    this.fishingState = 'casting';
    this.fishingStateStartTime = this.scene.time.now;
    this.bobberPos = { x: this.player.x, y: this.player.y - 20 };
    this.targetBobberPos = { x: bestPos.x, y: bestPos.y };

    this.sound.playFishCast();

    const powerPct = Math.round(this.lastCastPower * 100);
    const powerLabel = this.lastCastPower > 0.75 ? '🌟 LEMPARAN JAUH (Peluang Ikan Langka & Jumbo!)' : this.lastCastPower > 0.4 ? '🎯 LEMPARAN SEDANG' : '🌱 LEMPARAN DEKAT (Ikan Kecil)';
    this.player.showSpeechBubble(`🎣 Lemparan ${powerPct}%\n${powerLabel}`);

    NetworkManager.getInstance().sendFishing('casting', this.bobberPos, this.targetBobberPos);

    EventBus.emit('fishing-started', {
      x: this.player.x,
      y: this.player.y,
      targetX: bestPos.x,
      targetY: bestPos.y,
      power: this.lastCastPower,
    });

    return true;
  }

  /**
   * Memulai proses memancing cepat (Fallback jika tombol F hanya ditekan singkat)
   */
  public startFishing(): boolean {
    if (this.isJumping || this.isMovementLocked()) return false;
    this.castPower = 0.5;
    return this.startChargingCast() && this.releaseCast();
  }

  /**
   * Menghentikan aktivitas memancing
   */
  public stopFishing(message?: string): void {
    if (this.fishingState === 'none') return;

    this.fishingState = 'none';
    this.actionState = 'grounded';
    this.fishingGraphics.clear();

    NetworkManager.getInstance().sendFishing('none');

    if (message) {
      this.player.showSpeechBubble(message);
    }

    EventBus.emit('fishing-ended');
  }

  /**
   * Pemain menekan tombol strike saat ikan menyambar (Bite Alert)
   * Membuka Minigame Memancing Interaktif Bergaya Stardew Valley!
   * Skala Kelangkaan, Berat, dan Ukuran Ikan dipengaruhi oleh Jarak/Power Lemparan!
   */
  public strikeFish(): void {
    if (this.fishingState !== 'bite') return;

    this.fishingState = 'minigame';
    this.fishingStateStartTime = this.scene.time.now;

    this.sound.playFishSplash();
    this.player.showSpeechBubble('⚡ STRIKE! Tahan joran agar kotak hijau pas di ikan!');

    NetworkManager.getInstance().sendFishing('minigame', this.bobberPos, this.targetBobberPos);

    const p = this.lastCastPower; // 0.1 s/d 1.0
    const activeRod = InventoryManager.getInstance().getActiveItem();
    let luckBonus = 0;
    if (activeRod?.id === 'tool_fishing_rod_carbon') luckBonus += 14;
    if (this.isPotionActive('luck_3')) luckBonus += 34;
    else if (this.isPotionActive('luck_2')) luckBonus += 22;
    else if (this.isPotionActive('luck_1')) luckBonus += 12;

    const roll = Math.max(0, Math.random() * 100 - luckBonus);
    let candidateFish: IFishData;

    const legendaryPool = FISH_LOOT_TABLE.filter((f) => f.rarity === 'Legendary');
    const rarePool = FISH_LOOT_TABLE.filter((f) => f.rarity === 'Rare');
    const uncommonPool = FISH_LOOT_TABLE.filter((f) => f.rarity === 'Uncommon');
    const commonPool = FISH_LOOT_TABLE.filter((f) => f.rarity === 'Common');

    const pickRandom = (pool: IFishData[]) => pool[Math.floor(Math.random() * pool.length)];

    if (p > 0.75) {
      // 1. LEMPARAN JAUH (Power > 75%): Peluang tinggi Ikan Pusaka / Monster Laut Nusantara!
      if (roll < 22) {
        candidateFish = { ...pickRandom(legendaryPool) };
      } else if (roll < 60) {
        candidateFish = { ...pickRandom(rarePool) };
      } else if (roll < 88) {
        candidateFish = { ...pickRandom(uncommonPool) };
      } else {
        candidateFish = { ...pickRandom(commonPool) };
      }
      // Ikan lemparan jauh jauh lebih berat dan besar (1.3x s/d 2.2x)
      const weightMult = 1.3 + Math.random() * 0.9;
      candidateFish.weightKg = parseFloat((candidateFish.weightKg * weightMult).toFixed(2));
      candidateFish.goldReward = Math.round(candidateFish.goldReward * (1.2 + Math.random() * 0.6));
      candidateFish.name = `[JUMBO] ${candidateFish.name}`;
    } else if (p < 0.40) {
      // 2. LEMPARAN DEKAT (Power < 40%): Dominan Common (Lele, Mujair, Nila, Mas, Kembung, Tongkol, Bandeng)
      if (roll < 75) {
        candidateFish = { ...pickRandom(commonPool) };
      } else if (roll < 95) {
        candidateFish = { ...pickRandom(uncommonPool) };
      } else {
        candidateFish = { ...pickRandom(rarePool) };
      }
      // Ikan lemparan dekat berukuran lokal
      const weightMult = 0.65 + Math.random() * 0.35;
      candidateFish.weightKg = parseFloat((candidateFish.weightKg * weightMult).toFixed(2));
      candidateFish.goldReward = Math.max(20, Math.round(candidateFish.goldReward * 0.85));
      candidateFish.name = `[LOKAL] ${candidateFish.name}`;
    } else {
      // 3. LEMPARAN SEDANG (40% - 75%): Seimbang
      if (roll < 8) candidateFish = { ...pickRandom(legendaryPool) };
      else if (roll < 32) candidateFish = { ...pickRandom(rarePool) };
      else if (roll < 70) candidateFish = { ...pickRandom(uncommonPool) };
      else candidateFish = { ...pickRandom(commonPool) };

      const weightMult = 0.9 + Math.random() * 0.35;
      candidateFish.weightKg = parseFloat((candidateFish.weightKg * weightMult).toFixed(2));
    }

    this.lastCaughtFish = candidateFish;

    // Reset status bite dan buka Minigame Memancing Stardew Valley di layar!
    EventBus.emit('fishing-minigame-start');
    EventBus.emit('open-fishing-minigame', {
      fish: candidateFish,
      castPower: this.lastCastPower,
    });
  }

  /**
   * Menyelesaikan penangkapan ikan dan memberikan reward ke pemain
   * Menampung ikan hasil tangkapan langsung ke inventaris tas [B]!
   */
  private finishCatch(fish: IFishData): void {
    this.fishingState = 'caught';
    this.fishingStateStartTime = this.scene.time.now;

    NetworkManager.getInstance().sendFishing('caught', this.bobberPos, this.targetBobberPos);

    // Tambah reward koin emas ke local storage pemain
    try {
      const currentGold = parseInt(localStorage.getItem('raden_player_gold') || '0', 10);
      const newGold = currentGold + fish.goldReward;
      localStorage.setItem('raden_player_gold', newGold.toString());
    } catch (e) {}

    // Otomatis masukkan ikan hasil tangkapan ke Tas Petualang [B]
    const storedInBag = InventoryManager.getInstance().addCaughtFish(fish);

    // Mainkan nada sukses
    this.sound.playSuccess();

    const rarityBadge = fish.rarity === 'Legendary' ? '🌟 [LEGENDARIS]' : fish.rarity === 'Rare' ? '🐠 [LANGKA]' : '🐟';
    const rewardText = `+${fish.goldReward} Gold`;
    const bagStatus = storedInBag ? '\n🎒 Tersimpan rapi di Tas [B]!' : '\n⚠️ Tas penuh! Jual ikan di Tas [B].';

    this.player.showSpeechBubble(
      `🎉 DAPAT ${fish.name.toUpperCase()}!\nBerat: ${fish.weightKg} kg ${rarityBadge}\nHadiah: ${rewardText}${bagStatus}`
    );

    EventBus.emit('fishing-caught', {
      fish,
      goldEarned: fish.goldReward,
      rewardText,
      storedInBag,
    });

    // Otomatis kembalikan status memancing setelah 2 detik jika pemain tidak bergerak
    this.scene.time.delayedCall(2200, () => {
      if (this.fishingState === 'caught') {
        this.stopFishing();
      }
    });
  }

  /**
   * Update visual siklus memancing frame demi frame
   */
  private updateFishing(time: number, delta: number): void {
    if (this.fishingState === 'none') {
      if (this.isFishingGraphicsDrawn) {
        this.fishingGraphics.clear();
        this.isFishingGraphicsDrawn = false;
      }
      return;
    }

    this.isFishingGraphicsDrawn = true;
    this.fishingGraphics.clear();
    this.fishingGraphics.setDepth(this.player.y + 120);

    const elapsed = time - this.fishingStateStartTime;

    // 0. FASE CHARGING (Menahan Tombol untuk Menimbang Jarak Lemparan)
    if (this.fishingState === 'charging') {
      // Auto-cast safety timeout jika tombol ditahan > 6.5s atau event pointerup terlewat di browser mobile
      if (elapsed > 6500) {
        this.releaseCast();
        return;
      }

      const dt = Math.min(0.05, delta / 1000);
      this.castPower += this.castPowerDir * dt * 1.35;
      if (this.castPower >= 1.0) {
        this.castPower = 1.0;
        this.castPowerDir = -1;
      } else if (this.castPower <= 0.12) {
        this.castPower = 0.12;
        this.castPowerDir = 1;
      }

      // Gambarkan Meteran Kekuatan Lemparan di Atas Kepala Karakter
      const barW = 100;
      const barH = 12;
      const barX = this.player.x - barW / 2;
      const barY = this.player.y - 180;

      // Background hitam kaca
      this.fishingGraphics.fillStyle(0x050811, 0.9);
      this.fishingGraphics.fillRoundedRect(barX - 4, barY - 4, barW + 8, barH + 8, 6);
      this.fishingGraphics.lineStyle(2, 0xf59e0b, 1.0);
      this.fishingGraphics.strokeRoundedRect(barX - 4, barY - 4, barW + 8, barH + 8, 6);

      // Warna dinamis: Hijau -> Kuning -> Oranye -> Merah Crimson (Maksimal)
      let fillColor = 0x22c55e;
      if (this.castPower > 0.75) fillColor = 0xef4444; // Crimson Red (JAUH - Langka)
      else if (this.castPower > 0.45) fillColor = 0xf59e0b; // Amber (Sedang)

      this.fishingGraphics.fillStyle(fillColor, 1.0);
      this.fishingGraphics.fillRoundedRect(barX, barY, barW * this.castPower, barH, 4);

      // Garis penanda 75% (Zona Ikan Langka)
      this.fishingGraphics.lineStyle(2, 0xffffff, 0.9);
      this.fishingGraphics.lineBetween(barX + barW * 0.75, barY - 2, barX + barW * 0.75, barY + barH + 2);

      // Joran condong ke belakang siap melempar
      const dir = this.player.getDirection();
      const hx = this.player.x + (dir === 'left' ? 18 : -18);
      const hy = this.player.y - 75;
      this.fishingGraphics.lineStyle(3, 0xb45309, 1.0);
      this.fishingGraphics.lineBetween(this.player.x, this.player.y - 45, hx, hy);
      return;
    }

    // 1. FASE CASTING (Lempar Kail: 0 s/d 380ms)
    if (this.fishingState === 'casting') {
      const castProgress = Math.min(1, elapsed / 380);
      this.bobberPos.x = Phaser.Math.Linear(this.player.x, this.targetBobberPos.x, castProgress);
      // Lengkungan parabola lemparan kail di udara
      const arcZ = Math.sin(castProgress * Math.PI) * 45;
      this.bobberPos.y = Phaser.Math.Linear(this.player.y - 20, this.targetBobberPos.y, castProgress) - arcZ;

      if (castProgress >= 1) {
        this.fishingState = 'waiting';
        this.fishingStateStartTime = time;
        this.bobberPos = { ...this.targetBobberPos };
        NetworkManager.getInstance().sendFishing('waiting', this.bobberPos, this.targetBobberPos);
        // Waktu tunggu ikan menyambar: dipersingkat jika memiliki Ramuan Keberuntungan
        let rawBite = Phaser.Math.Between(2600, 5200);
        if (this.isPotionActive('luck_3')) rawBite = Math.round(rawBite * 0.25);
        else if (this.isPotionActive('luck_2')) rawBite = Math.round(rawBite * 0.5);
        else if (this.isPotionActive('luck_1')) rawBite = Math.round(rawBite * 0.7);
        this.biteTimeout = rawBite;
        this.sound.playFishSplash();
        this.player.showSpeechBubble(this.isPotionActive('luck_3') ? '🌟 Ramuan Berkah Laut aktif! Ikan langsung menyambar!' : 'Menunggu ikan menyambar...');
      }
    }
    // 2. FASE WAITING (Pelampung mengambang tenang di air)
    else if (this.fishingState === 'waiting') {
      // Ombak / riak kecil pelampung mengambang
      const bobY = Math.sin(time * 0.005) * 3;
      this.bobberPos.y = this.targetBobberPos.y + bobY;

      // Cek apakah waktu menunggu ikan menyambar sudah tiba
      if (elapsed >= this.biteTimeout) {
        this.fishingState = 'bite';
        this.fishingStateStartTime = time;
        NetworkManager.getInstance().sendFishing('bite', this.bobberPos, this.targetBobberPos);
        this.sound.playFishBite();
        this.player.triggerExpression('shock');
        this.player.showSpeechBubble('Ikan menyambar! Tarik [F/SPASI]', 2000);
        EventBus.emit('fishing-bite');
      }
    }
    // 3. FASE BITE (Ikan menyambar umpan! Pelampung bergetar hebat)
    else if (this.fishingState === 'bite') {
      // Pelampung tenggelam dan bergetar cepat
      const shakeX = (Math.random() - 0.5) * 6;
      const shakeY = 6 + Math.sin(time * 0.04) * 5;
      this.bobberPos.x = this.targetBobberPos.x + shakeX;
      this.bobberPos.y = this.targetBobberPos.y + shakeY;

      // Jendela reaksi tanggapan: 2.5 detik. Jika lewat, ikan lepas!
      if (elapsed > 2500) {
        this.sound.playLand();
        this.stopFishing('Aduh, ikannya kabur!');
        return;
      }
    }
    // 4. FASE MINIGAME (Ikan bertarung melawan joran, pelampung bergejolak cepat)
    else if (this.fishingState === 'minigame') {
      const shakeX = (Math.random() - 0.5) * 8;
      const shakeY = 4 + Math.sin(time * 0.04) * 6;
      this.bobberPos.x = this.targetBobberPos.x + shakeX;
      this.bobberPos.y = this.targetBobberPos.y + shakeY;
    }
    // 5. FASE REELING (Menarik kail)
    else if (this.fishingState === 'reeling') {
      const pullProgress = Math.min(1, elapsed / 500);
      this.bobberPos.x = Phaser.Math.Linear(this.targetBobberPos.x, this.player.x, pullProgress);
      this.bobberPos.y = Phaser.Math.Linear(this.targetBobberPos.y, this.player.y - 30, pullProgress);
    }
    // 6. FASE CAUGHT (Selesai menangkap ikan)
    else if (this.fishingState === 'caught') {
      if (elapsed > 2400) {
        this.stopFishing();
        return;
      }
      this.fishingGraphics.clear();
      return;
    }

    // ========================================================================
    // GAMBAR VISUAL JORAN, SENAR PANCING & PELAMPUNG
    // ========================================================================
    const dir = this.player.getDirection();
    const handX = this.player.x + (dir === 'left' ? -20 : dir === 'right' ? 20 : 0);
    const handY = this.player.y - 50;

    // A. Gambarkan Senar Pancing (Curved Bezier Line dengan Efek Gravitasi)
    const midX = (handX + this.bobberPos.x) / 2;
    const sag = this.fishingState === 'bite' ? -10 : 25; // Senar tegang saat digigit
    const midY = (handY + this.bobberPos.y) / 2 + sag;

    this.fishingGraphics.lineStyle(1.5, 0xffffff, 0.75);
    this.fishingGraphics.beginPath();
    this.fishingGraphics.moveTo(handX, handY);
    // Phaser Graphics quadratic curve approximation
    const steps = 16;
    for (let i = 1; i <= steps; i++) {
      const st = i / steps;
      const qx = (1 - st) * (1 - st) * handX + 2 * (1 - st) * st * midX + st * st * this.bobberPos.x;
      const qy = (1 - st) * (1 - st) * handY + 2 * (1 - st) * st * midY + st * st * this.bobberPos.y;
      this.fishingGraphics.lineTo(qx, qy);
    }
    this.fishingGraphics.strokePath();

    // B. Riak Air di Sekitar Pelampung
    const rippleRadius = 8 + (Math.sin(time * 0.008) + 1) * 6;
    const rippleAlpha = Math.max(0.1, 0.6 - (rippleRadius / 22));
    this.fishingGraphics.lineStyle(1.5, 0x38bdf8, rippleAlpha);
    this.fishingGraphics.strokeEllipse(this.bobberPos.x, this.bobberPos.y + 4, rippleRadius * 2, rippleRadius);

    // C. Gambar Pelampung (Bobber: Merah di atas, Putih di bawah)
    // Bagian merah (atas)
    this.fishingGraphics.fillStyle(0xef4444, 1.0);
    this.fishingGraphics.fillCircle(this.bobberPos.x, this.bobberPos.y - 2, 5);
    // Bagian putih (bawah)
    this.fishingGraphics.fillStyle(0xffffff, 1.0);
    this.fishingGraphics.fillCircle(this.bobberPos.x, this.bobberPos.y + 2, 4);

    // D. Tanda Seru Animasi di Atas Karakter saat Ikan Menggigit (Bite Indicator)
    if (this.fishingState === 'bite') {
      const alertY = this.player.y - 195;
      const bounce = Math.sin(time * 0.02) * 4;

      this.fishingGraphics.fillStyle(0xef4444, 0.95);
      this.fishingGraphics.lineStyle(2, 0xffffff, 1.0);
      this.fishingGraphics.fillCircle(this.player.x, alertY + bounce, 14);
      this.fishingGraphics.strokeCircle(this.player.x, alertY + bounce, 14);

      // Garis tanda seru putih
      this.fishingGraphics.lineStyle(3, 0xffffff, 1.0);
      this.fishingGraphics.lineBetween(this.player.x, alertY + bounce - 6, this.player.x, alertY + bounce + 1);
      this.fishingGraphics.fillStyle(0xffffff, 1.0);
      this.fishingGraphics.fillCircle(this.player.x, alertY + bounce + 6, 2);
    }
  }

  // ==========================================================================
  // PERGERAKAN KARAKTER (MOVEMENT CONTROLS)
  // ==========================================================================

  /**
   * Memeriksa apakah pergerakan pemain sedang terkunci
   */
  public isMovementLocked(): boolean {
    if (this.isMovementDisabled) return true;
    if (this.fishingState !== 'none') return true;
    return this.player.isMovementLocked();
  }

  public setMovementLocked(locked: boolean): void {
    this.isMovementDisabled = locked;
  }

  /**
   * Navigasi otomatis titik tujuan (Point & Click / Tap-to-move)
   * Dilengkapi Tanda Kristal Melayang dan penyesuaian arah hadap seketika
   */
  public navigateTo(targetX: number, targetY: number, onArrival?: () => void): void {
    if (this.isMovementLocked()) return;
    this.targetDestination = { x: targetX, y: targetY };
    this.onArrivalCallback = onArrival || null;
    this.lastNavPosX = this.player.x;
    this.lastNavPosY = this.player.y;
    this.navStuckTime = 0;

    // Segera hadapkan karakter ke arah titik tujuan yang di-klik/tap (Anti Jalan Mundur)
    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    if (Math.hypot(dx, dy) > 4) {
      this.syncFacingDirection(dx, dy);
    }
  }

  public stopNavigation(): void {
    this.targetDestination = null;
    this.onArrivalCallback = null;
    this.crystalGraphics.clear();
    this.navStuckTime = 0;
  }

  /**
   * Menyelaraskan arah hadap karakter (direction) 100% konsisten dengan vektor gerakan.
   * Menjamin karakter TIDAK AKAN PERNAH berjalan mundur (anti-moonwalk)
   * baik saat menggunakan keyboard, joystick virtual, maupun klik/tap ke titik tujuan.
   *
   * @param moveX Komponen horizontal pergerakan (dx atau vx)
   * @param moveY Komponen vertikal pergerakan (dy atau vy)
   */
  public syncFacingDirection(moveX: number, moveY: number): void {
    if (moveX === 0 && moveY === 0) return;

    const absX = Math.abs(moveX);
    const absY = Math.abs(moveY);
    const curDir = this.player.getDirection();

    // Arah yang secara fisik valid sesuai tanda (sign) vektor pergerakan
    const validHoriz: Direction | null = moveX !== 0 ? (moveX > 0 ? 'right' : 'left') : null;
    const validVert: Direction | null = moveY !== 0 ? (moveY > 0 ? 'down' : 'up') : null;

    // Toleransi deadband 6px / kecepatan untuk menentukan dominasi sumbu
    const dominanceThreshold = 6;

    if (absX > absY + dominanceThreshold && validHoriz) {
      // 1. Gerakan dominan horizontal
      this.player.setDirection(validHoriz);
    } else if (absY > absX + dominanceThreshold && validVert) {
      // 2. Gerakan dominan vertikal
      this.player.setDirection(validVert);
    } else {
      // 3. Gerakan diagonal seimbang (dekat 45 derajat)
      // Karakter HANYA boleh menghadap ke salah satu sumbu yang sedang bergerak maju (validHoriz atau validVert)!
      const isCurDirValid = (validHoriz && curDir === validHoriz) || (validVert && curDir === validVert);

      if (isCurDirValid) {
        // Arah lama sudah sesuai dengan salah satu sumbu maju, pertahankan agar tidak berkedip (no jitter)
      } else {
        // Arah lama bertentangan (misal arah 'left' padahal bergerak ke kanan-bawah)!
        // Wajib ganti seketika ke sumbu maju yang lebih besar, atau horizontal sebagai prioritas!
        if (absY > absX && validVert) {
          this.player.setDirection(validVert);
        } else if (validHoriz) {
          this.player.setDirection(validHoriz);
        } else if (validVert) {
          this.player.setDirection(validVert);
        }
      }
    }
  }

  /**
   * Menggambar Tanda Kristal Melayang (Glowing Diamond Crystal) di titik tujuan klik/tap
   * sampai karakter tiba di lokasi tersebut
   */
  private drawDestinationCrystal(cx: number, cy: number, time: number): void {
    this.isCrystalGraphicsDrawn = true;
    this.crystalGraphics.clear();
    this.crystalGraphics.setDepth(99999);

    // 1. Bayangan & Ring Berpendar di Lantai Dasar
    const pulse = Math.sin(time * 0.007);
    const groundPulseRadius = 14 + pulse * 2.5;

    // Bayangan lantai
    this.crystalGraphics.fillStyle(0x000000, 0.35);
    this.crystalGraphics.fillEllipse(cx, cy, 26, 12);

    // Lingkaran sihir cyan bercahaya di lantai
    this.crystalGraphics.lineStyle(1.5, 0x38bdf8, 0.75 + pulse * 0.2);
    this.crystalGraphics.strokeEllipse(cx, cy, groundPulseRadius * 2, groundPulseRadius);

    // Lingkaran luar berdenyut halus
    this.crystalGraphics.lineStyle(1, 0xbae6fd, 0.45);
    this.crystalGraphics.strokeEllipse(cx, cy, (groundPulseRadius + 6) * 2, groundPulseRadius + 3);

    // 2. Kristal Berlian 3D Melayang & Berdenyut
    // Ketinggian melayang dengan osilasi sinus halus
    const hoverY = cy - 36 + Math.sin(time * 0.006) * 5;

    // Garis sorot cahaya lembut dari kristal turun ke lantai
    this.crystalGraphics.lineStyle(1, 0x38bdf8, 0.3);
    this.crystalGraphics.lineBetween(cx, hoverY + 16, cx, cy);

    // Titik sudut Kristal Berlian 3D (Faceted Diamond)
    const topPt = { x: cx, y: hoverY - 18 };
    const leftPt = { x: cx - 11, y: hoverY - 2 };
    const rightPt = { x: cx + 11, y: hoverY - 2 };
    const bottomPt = { x: cx, y: hoverY + 16 };
    const centerPt = { x: cx, y: hoverY + 2 };

    // Faset Kiri Atas (Biru Langit Terang)
    this.crystalGraphics.fillStyle(0x38bdf8, 0.95);
    this.crystalGraphics.fillTriangle(topPt.x, topPt.y, leftPt.x, leftPt.y, centerPt.x, centerPt.y);

    // Faset Kanan Atas (Biru Langit Sedang)
    this.crystalGraphics.fillStyle(0x0ea5e9, 0.95);
    this.crystalGraphics.fillTriangle(topPt.x, topPt.y, rightPt.x, rightPt.y, centerPt.x, centerPt.y);

    // Faset Kiri Bawah (Biru Azure Dalam)
    this.crystalGraphics.fillStyle(0x0284c7, 0.95);
    this.crystalGraphics.fillTriangle(leftPt.x, leftPt.y, bottomPt.x, bottomPt.y, centerPt.x, centerPt.y);

    // Faset Kanan Bawah (Biru Safir Gelap)
    this.crystalGraphics.fillStyle(0x0369a1, 0.95);
    this.crystalGraphics.fillTriangle(rightPt.x, rightPt.y, bottomPt.x, bottomPt.y, centerPt.x, centerPt.y);

    // Kilau Pantulan Cahaya Putih Berlian (Specular Glint)
    this.crystalGraphics.fillStyle(0xffffff, 0.85);
    this.crystalGraphics.fillTriangle(topPt.x, topPt.y, leftPt.x + 3, leftPt.y - 4, centerPt.x - 2, centerPt.y - 4);

    // Garis Tepi Kristal Es
    this.crystalGraphics.lineStyle(1.5, 0xe0f2fe, 0.9);
    this.crystalGraphics.strokeTriangle(topPt.x, topPt.y, leftPt.x, leftPt.y, centerPt.x, centerPt.y);
    this.crystalGraphics.strokeTriangle(topPt.x, topPt.y, rightPt.x, rightPt.y, centerPt.x, centerPt.y);
    this.crystalGraphics.strokeTriangle(leftPt.x, leftPt.y, bottomPt.x, bottomPt.y, centerPt.x, centerPt.y);
    this.crystalGraphics.strokeTriangle(rightPt.x, rightPt.y, bottomPt.x, bottomPt.y, centerPt.x, centerPt.y);
  }

  /**
   * Loop pembaruan utama yang dipanggil setiap frame oleh Player.update()
   */
  public update(time: number, delta: number): { vx: number; vy: number; isMoving: boolean } {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body) return { vx: 0, vy: 0, isMoving: false };

    // Update siklus melompat dan pendaratan
    this.updateJump(time, delta);
    this.updateLandingDust(time);
    this.updateRunDust(time, delta);

    // Update siklus memancing
    this.updateFishing(time, delta);

    // Jika pemain baru saja menangkap ikan ('caught') dan melakukan input jalan (WASD, Panah, Joystick, atau Tap),
    // segera lepaskan status memancing seketika agar pemain langsung bebas berjalan tanpa nyangkut!
    if (this.fishingState === 'caught') {
      const cursors = this.player.getCursors?.();
      const keysWASD = this.player.getKeysWASD?.();
      const km = KeybindingManager.getInstance();
      const hasKeyInput = Boolean(
        cursors?.left?.isDown || keysWASD?.A?.isDown || km.isActionActive('moveLeft') ||
        cursors?.right?.isDown || keysWASD?.D?.isDown || km.isActionActive('moveRight') ||
        cursors?.up?.isDown || keysWASD?.W?.isDown || km.isActionActive('moveUp') ||
        cursors?.down?.isDown || keysWASD?.S?.isDown || km.isActionActive('moveDown')
      );
      const hasJoyInput = Boolean(this.joystickVector && (Math.abs(this.joystickVector.x) > 0.05 || Math.abs(this.joystickVector.y) > 0.05));
      if (hasKeyInput || hasJoyInput || this.targetDestination) {
        this.stopFishing();
      }
    }

    // Jika sedang memancing atau terkunci, tahan karakter agar tidak bergerak
    if (this.fishingState !== 'none' || this.isMovementLocked()) {
      body.setVelocity(0, 0);
      this.targetDestination = null;
      this.crystalGraphics.clear();
      this.onArrivalCallback = null;
      return { vx: 0, vy: 0, isMoving: false };
    }

    let vx = 0;
    let vy = 0;

    const cursors = this.player.getCursors?.();
    const keysWASD = this.player.getKeysWASD?.();
    const km = KeybindingManager.getInstance();

    const left = Boolean(cursors?.left?.isDown || keysWASD?.A?.isDown || km.isActionActive('moveLeft'));
    const right = Boolean(cursors?.right?.isDown || keysWASD?.D?.isDown || km.isActionActive('moveRight'));
    const up = Boolean(cursors?.up?.isDown || keysWASD?.W?.isDown || km.isActionActive('moveUp'));
    const down = Boolean(cursors?.down?.isDown || keysWASD?.S?.isDown || km.isActionActive('moveDown'));

    const hasManualInput = left || right || up || down;

    const shiftIsDown = Boolean(
      this.keyShift?.isDown ||
      cursors?.shift?.isDown ||
      km.isActionActive('sprint')
    );
    const isPlayerRunning = this.isRunning || shiftIsDown;

    const potionMultiplier = this.isPotionActive('speed') ? 1.4 : 1.0;
    const runMultiplier = isPlayerRunning ? 1.6 : 1.0;
    const currentSpeed = this.speed * potionMultiplier * runMultiplier;

    if (this.joystickVector && (Math.abs(this.joystickVector.x) > 0.05 || Math.abs(this.joystickVector.y) > 0.05)) {
      // 1. Input Analog Virtual Joystick Sentuh
      this.targetDestination = null;
      this.crystalGraphics.clear();
      this.onArrivalCallback = null;

      vx = this.joystickVector.x * currentSpeed;
      vy = this.joystickVector.y * currentSpeed;

      this.syncFacingDirection(vx, vy);
    } else if (hasManualInput) {
      // 2. Input Keyboard PC (WASD & Panah)
      this.targetDestination = null;
      this.crystalGraphics.clear();
      this.onArrivalCallback = null;

      // Catat timestamp saat tombol pertama kali ditekan
      if (left && !this.prevLeft) this.leftDownTime = time;
      if (right && !this.prevRight) this.rightDownTime = time;
      if (up && !this.prevUp) this.upDownTime = time;
      if (down && !this.prevDown) this.downDownTime = time;

      this.prevLeft = left;
      this.prevRight = right;
      this.prevUp = up;
      this.prevDown = down;

      // Resolusi tombol berlawanan: Tombol yang paling baru ditekan yang diutamakan!
      let moveX = 0;
      if (left && right) {
        moveX = this.leftDownTime > this.rightDownTime ? -1 : 1;
      } else if (left) {
        moveX = -1;
      } else if (right) {
        moveX = 1;
      }

      let moveY = 0;
      if (up && down) {
        moveY = this.upDownTime > this.downDownTime ? -1 : 1;
      } else if (up) {
        moveY = -1;
      } else if (down) {
        moveY = 1;
      }

      // Normalisasi kecepatan diagonal
      if (moveX !== 0 && moveY !== 0) {
        vx = moveX * currentSpeed * 0.7071;
        vy = moveY * currentSpeed * 0.7071;
      } else {
        vx = moveX * currentSpeed;
        vy = moveY * currentSpeed;
      }

      this.syncFacingDirection(vx, vy);
    } else if (this.targetDestination) {
      // 3. Navigasi Otomatis (Point & Click / Tap-to-move)
      const dx = this.targetDestination.x - this.player.x;
      const dy = this.targetDestination.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= 12) {
        // Tiba di tujuan: hilangkan tanda kristal dan jalankan callback
        this.targetDestination = null;
        this.crystalGraphics.clear();
        this.navStuckTime = 0;
        vx = 0;
        vy = 0;
        const cb = this.onArrivalCallback;
        this.onArrivalCallback = null;
        if (cb) cb();
      } else {
        // Cek apakah karakter terhalang rintangan fisik di tengah jalan (Stuck Check)
        const movedDist = Math.hypot(this.player.x - this.lastNavPosX, this.player.y - this.lastNavPosY);
        if (movedDist < 1.0) {
          this.navStuckTime += delta;
          if (this.navStuckTime > 380) {
            // Berhenti seketika jika mentok rintangan fisik lebih dari 380ms
            this.stopNavigation();
            this.sound.playError();
            this.player.showSpeechBubble('🚫 Perjalanan terhenti, jalan terhalang rintangan!', 1400);
            body.setVelocity(0, 0);
            return { vx: 0, vy: 0, isMoving: false };
          }
        } else {
          this.navStuckTime = 0;
          this.lastNavPosX = this.player.x;
          this.lastNavPosY = this.player.y;
        }

        const angle = Math.atan2(dy, dx);
        vx = Math.cos(angle) * currentSpeed;
        vy = Math.sin(angle) * currentSpeed;

        // Gambar tanda kristal melayang di titik tujuan selama belum sampai
        this.drawDestinationCrystal(this.targetDestination.x, this.targetDestination.y, time);

        // Sinkronisasi arah hadap konsisten (Anti Moonwalk)
        this.syncFacingDirection(dx, dy);
      }
    } else {
      // Tidak ada navigasi aktif: bersihkan grafis kristal jika sebelumnya aktif
      if (this.isCrystalGraphicsDrawn) {
        this.crystalGraphics.clear();
        this.isCrystalGraphicsDrawn = false;
      }
    }

    // Failsafe: Sinkronkan arah hadap ke fisik velocity
    if (vx !== 0 || vy !== 0) {
      this.syncFacingDirection(vx, vy);

      // Spawn bola-bola debu bulat imut saat berlari kencang atau efek ramuan speed aktif
      const isFastMovement = isPlayerRunning || this.isPotionActive('speed');
      if (isFastMovement && !this.isJumping && time - this.lastRunDustTime > 120) {
        this.lastRunDustTime = time;
        this.triggerRunDustBall(time, vx, vy);
      }
    }

    // Update efek transparansi ramuan invisible
    if (this.isPotionActive('invisible')) {
      if (this.player.alpha !== 0.25) this.player.setAlpha(0.25);
    } else {
      if (this.player.alpha !== 1.0) this.player.setAlpha(1.0);
    }

    body.setVelocity(vx, vy);

    return {
      vx,
      vy,
      isMoving: vx !== 0 || vy !== 0,
    };
  }

  // Getters
  public getIsJumping(): boolean {
    return this.isJumping;
  }

  public getJumpZ(): number {
    return this.currentJumpZ;
  }

  public getFishingState(): FishingState {
    return this.fishingState;
  }

  public getActionState(): CharacterActionState {
    return this.actionState;
  }

  public getLastCaughtFish(): IFishData | null {
    return this.lastCaughtFish;
  }

  public isPlayerRunning(): boolean {
    const shiftIsDown = Boolean(
      this.keyShift?.isDown ||
      this.player?.getCursors?.()?.shift?.isDown
    );
    return this.isRunning || shiftIsDown;
  }
}
