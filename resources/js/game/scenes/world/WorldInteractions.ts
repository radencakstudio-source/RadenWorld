/**
 * ============================================================================
 * FILE: resources/js/game/scenes/world/WorldInteractions.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Modul untuk mengelola interaksi objek, pintu gedung, penamaan wilayah,
 * dan transisi antar scene:
 * 1. Interface & koordinat pintu gedung standar (IWorldDoors).
 * 2. Penamaan nama wilayah dinamis (getRegionName) sesuai posisi pemain.
 * 3. Deteksi prompt interaksi jarak dekat (checkProximityPrompt).
 * 4. Interaksi tombol 'E' / Klik pada fasilitas utama (triggerCurrentInteraction).
 * 5. Pendekatan karakter ke pintu gedung (approachDoorAndEnter).
 * 6. Pemulihan HP di Rumah Sakit (healPlayerAtHospital).
 * 7. Transisi masuk ke Gedung Sekolah SD / SMP / SMA (transitionToSchool).
 * 8. Transisi masuk ke Rumah Pribadi (transitionToHouse).
 * ============================================================================
 */

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';
import { Player } from '../../entities/Player';
import { NetworkManager } from '../../core/NetworkManager';
import type { INpcConfig, IAvatarCustomization } from '../../types';

export interface IWorldDoorCoord {
  x: number;
  y: number;
}

export interface IWorldDoors {
  playerHouseDoor: IWorldDoorCoord;
  schoolSdDoor: IWorldDoorCoord;
  schoolSmpDoor: IWorldDoorCoord;
  schoolSmaDoor: IWorldDoorCoord;
  cafeDoor: IWorldDoorCoord;
  libraryDoor?: IWorldDoorCoord;
  policeDoor?: IWorldDoorCoord;
  bankDoor: IWorldDoorCoord;
  pharmacyDoor?: IWorldDoorCoord;
  hospitalDoor: IWorldDoorCoord;
  realtorDoor?: IWorldDoorCoord;
}

export const DEFAULT_WORLD_DOORS: IWorldDoors = {
  playerHouseDoor: { x: 1380, y: 840 },  // gx: 11.5, gy: 7 (Rumah di Kiri Atas)
  schoolSdDoor: { x: 3300, y: 1140 },    // gx: 27.5, gy: 9.5 (Gedung SD 5x10)
  schoolSmpDoor: { x: 4020, y: 1140 },   // gx: 33.5, gy: 9.5 (Gedung SMP 5x10)
  schoolSmaDoor: { x: 4740, y: 1140 },   // gx: 39.5, gy: 9.5 (Gedung SMA 5x10)
  cafeDoor: { x: 420, y: 3120 },         // gx: 3.5, gy: 26 (Cafe di gx: 1..5, gy: 21..25)
  libraryDoor: { x: 1740, y: 3120 },     // gx: 14.5, gy: 26 (Perpustakaan di gx: 12..16, gy: 21..25)
  policeDoor: { x: 420, y: 5040 },       // gx: 3.5, gy: 42 (Kantor Polisi di gx: 1..5, gy: 37..41)
  bankDoor: { x: 1740, y: 5040 },        // gx: 14.5, gy: 42 (Bank di gx: 12..16, gy: 37..41)
  pharmacyDoor: { x: 420, y: 6960 },     // gx: 3.5, gy: 58 (Apotek di gx: 1..5, gy: 53..57)
  hospitalDoor: { x: 420, y: 6960 },     // Alias Apotek / RS
  realtorDoor: { x: 1740, y: 6960 },     // gx: 14.5, gy: 58 (Makelar di gx: 12..16, gy: 53..57)
};

export class WorldInteractions {
  /**
   * Mengembalikan nama wilayah berdasarkan koordinat posisi pemain
   */
  public static getRegionName(
    x: number,
    y: number,
    tileSize: number,
    doors: IWorldDoors
  ): string {
    const gx = Math.floor(x / tileSize);
    const gy = Math.floor(y / tileSize);

    // 1. Kompleks Pendidikan SD - SMP - SMA (Utara Pusat)
    if (Math.hypot(x - doors.schoolSdDoor.x, y - doors.schoolSdDoor.y) < 240) return 'KOMPLEKS PENDIDIKAN: GEDUNG SD';
    if (Math.hypot(x - doors.schoolSmpDoor.x, y - doors.schoolSmpDoor.y) < 240) return 'KOMPLEKS PENDIDIKAN: GEDUNG SMP';
    if (Math.hypot(x - doors.schoolSmaDoor.x, y - doors.schoolSmaDoor.y) < 240) return 'KOMPLEKS PENDIDIKAN: GEDUNG SMA';
    if (gy <= 16 && gx >= 23 && gx <= 42) return 'KOMPLEKS PENDIDIKAN TERPADU';

    // 2. Kiri Atas: Kawasan Residensial
    if (Math.hypot(x - doors.playerHouseDoor.x, y - doors.playerHouseDoor.y) < 260) return 'KAWASAN RESIDENSIAL: RUMAH PEMAIN';
    if (gy <= 13 && gx <= 21) return 'TAMAN RESIDENSIAL BARAT LAUT';

    // 3. Timur Laut: Kawasan Persawahan & Pertanian
    if (gx >= 57 && gx <= 80 && gy >= 1 && gy <= 9) return 'LAHAN PERTANIAN & PERKEBUNAN SUBUR';
    if (gy <= 13 && gx >= 57) return 'KAWASAN PERSAWAHAN & PERTANIAN SUBUR';

    // 4. Barat: Kawasan Komersial & Layanan Publik (6 Gedung 5x5)
    if (gx >= 1 && gx <= 5 && gy >= 21 && gy <= 25) return 'KAWASAN KULINER: RADEN CAFE';
    if (gx >= 12 && gx <= 16 && gy >= 21 && gy <= 25) return 'KAWASAN LITERASI: PERPUSTAKAAN KOTA';
    if (gx >= 1 && gx <= 5 && gy >= 37 && gy <= 41) return 'LAYANAN PUBLIK: KANTOR POLISI';
    if (gx >= 12 && gx <= 16 && gy >= 37 && gy <= 41) return 'KAWASAN FINANSIAL: KANTOR BANK';
    if (gx >= 1 && gx <= 5 && gy >= 53 && gy <= 57) return 'KAWASAN KESEHATAN: APOTEK FARMA';
    if (gx >= 12 && gx <= 16 && gy >= 53 && gy <= 57) return 'KAWASAN PROPERTI: KANTOR MAKELAR';
    if (Math.hypot(x - doors.cafeDoor.x, y - doors.cafeDoor.y) < 260) return 'KAWASAN KULINER: RADEN CAFE';
    if (doors.libraryDoor && Math.hypot(x - doors.libraryDoor.x, y - doors.libraryDoor.y) < 260) return 'KAWASAN LITERASI: PERPUSTAKAAN KOTA';
    if (doors.policeDoor && Math.hypot(x - doors.policeDoor.x, y - doors.policeDoor.y) < 260) return 'LAYANAN PUBLIK: KANTOR POLISI';
    if (Math.hypot(x - doors.bankDoor.x, y - doors.bankDoor.y) < 260) return 'KAWASAN FINANSIAL: KANTOR BANK';
    if (Math.hypot(x - doors.hospitalDoor.x, y - doors.hospitalDoor.y) < 260) return 'KAWASAN KESEHATAN: APOTEK FARMA';
    if (doors.realtorDoor && Math.hypot(x - doors.realtorDoor.x, y - doors.realtorDoor.y) < 260) return 'KAWASAN PROPERTI: KANTOR MAKELAR';
    if (gx <= 18 && gy >= 14 && gy <= 63) return 'BOULEVARD LAYANAN PUBLIK & PERKANTORAN';

    // 5. Alun-Alun Pusat Kota (gx: 22..57, gy: 22..58)
    if (gx >= 24 && gx <= 33 && gy >= 53 && gy <= 57) return 'ALUN-ALUN: LAPANGAN SEPAK BOLA';
    if (gx >= 46 && gx <= 55 && gy >= 53 && gy <= 57) return 'ALUN-ALUN: LAPANGAN BASKET';
    if (gx >= 22 && gx <= 57 && gy >= 22 && gy <= 58) return 'Alun Alun';
    if (gx >= 22 && gx <= 57 && gy >= 16 && gy <= 61) return 'Alun Alun';

    // 6. Timur: Teluk Bahari & Dermaga
    if (gx >= 61 && gy >= 23 && gy <= 27) return 'DERMAGA 1: TELUK BAHARI UTARA';
    if (gx >= 61 && gy >= 37 && gy <= 41) return 'DERMAGA 2: ANJUNGAN NELAYAN DANU';
    if (gx >= 61 && gy >= 51 && gy <= 55) return 'DERMAGA 3: DERMAGA KAPAL WISATA';
    if (gx >= 60 && gy >= 14 && gy <= 64) return 'DERMAGA BAHARI & TELUK LAUT TIMUR';

    // 7. Selatan: Pantai & Samudra
    if (gy >= 79) return 'SAMUDRA LAUT LEPAS SELATAN';
    if (gy >= 64) return 'PANTAI PASIR KEEMASAN SELATAN';

    // 8. Jalan Raya Protokol
    if (gy <= 15) return 'JALAN PROTOKOL UTARA';
    if (gx <= 21) return 'JALAN PROTOKOL BARAT';
    if (gx >= 58) return 'JALAN PROTOKOL TIMUR';
    if (gy >= 62) return 'JALAN PROTOKOL SELATAN';

    return 'JALAN PROTOKOL LINGKAR KOTA';
  }

  /**
   * Memeriksa prompt interaksi yang sedang aktif berdasarkan posisi pemain
   */
  public static checkProximityPrompt(
    px: number,
    py: number,
    time: number,
    doorCooldownUntil: number,
    doors: IWorldDoors,
    npcs: INpcConfig[],
    tileSize: number,
    privateRoomId: string
  ): { prompt: string | null; locationName: string } {
    const distHouse = Phaser.Math.Distance.Between(px, py, doors.playerHouseDoor.x, doors.playerHouseDoor.y);
    const distSd = Phaser.Math.Distance.Between(px, py, doors.schoolSdDoor.x, doors.schoolSdDoor.y);
    const distSmp = Phaser.Math.Distance.Between(px, py, doors.schoolSmpDoor.x, doors.schoolSmpDoor.y);
    const distSma = Phaser.Math.Distance.Between(px, py, doors.schoolSmaDoor.x, doors.schoolSmaDoor.y);
    const distCafe = Phaser.Math.Distance.Between(px, py, doors.cafeDoor.x, doors.cafeDoor.y);
    const distLibrary = doors.libraryDoor ? Phaser.Math.Distance.Between(px, py, doors.libraryDoor.x, doors.libraryDoor.y) : 999;
    const distPolice = doors.policeDoor ? Phaser.Math.Distance.Between(px, py, doors.policeDoor.x, doors.policeDoor.y) : 999;
    const distBank = Phaser.Math.Distance.Between(px, py, doors.bankDoor.x, doors.bankDoor.y);
    const distPharmacy = (doors.pharmacyDoor || doors.hospitalDoor) ? Phaser.Math.Distance.Between(px, py, (doors.pharmacyDoor || doors.hospitalDoor).x, (doors.pharmacyDoor || doors.hospitalDoor).y) : 999;
    const distRealtor = doors.realtorDoor ? Phaser.Math.Distance.Between(px, py, doors.realtorDoor.x, doors.realtorDoor.y) : 999;

    let prompt: string | null = null;
    let locationName = this.getRegionName(px, py, tileSize, doors);

    if (distHouse < 130 && time > doorCooldownUntil) {
      prompt = `TEKAN [E] / KLIK UNTUK MASUK KE RUMAH PRIBADI (${privateRoomId})`;
      locationName = 'KAWASAN RESIDENSIAL: RUMAH PEMAIN';
    } else if (distSd < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SD';
      locationName = 'KOMPLEKS PENDIDIKAN: GEDUNG SD';
    } else if (distSmp < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SMP';
      locationName = 'KOMPLEKS PENDIDIKAN: GEDUNG SMP';
    } else if (distSma < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE GEDUNG SMA';
      locationName = 'KOMPLEKS PENDIDIKAN: GEDUNG SMA';
    } else if (distCafe < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MAMPIR KE RADEN CAFE ☕🥐';
      locationName = 'KAWASAN KULINER: RADEN CAFE';
    } else if (distLibrary < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MASUK KE PERPUSTAKAAN KOTA 📚';
      locationName = 'KAWASAN LITERASI: PERPUSTAKAAN KOTA';
    } else if (distPolice < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK LAPOR KE KANTOR POLISI 👮';
      locationName = 'LAYANAN PUBLIK: KANTOR POLISI';
    } else if (distBank < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK TRANSAKSI DI KANTOR BANK 🏦';
      locationName = 'KAWASAN FINANSIAL: KANTOR BANK';
    } else if (distPharmacy < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK MEMBELI OBAT / PULIHKAN HP DI APOTEK 💊✨';
      locationName = 'KAWASAN KESEHATAN: APOTEK FARMA';
    } else if (distRealtor < 130) {
      prompt = 'TEKAN [E] / KLIK UNTUK KONSULTASI MAKELAR PROPERTI 🏠';
      locationName = 'KAWASAN PROPERTI: KANTOR MAKELAR';
    } else if (
      ((Math.floor(px / tileSize) >= 21 && Math.floor(px / tileSize) <= 32) ||
       (Math.floor(px / tileSize) >= 44 && Math.floor(px / tileSize) <= 55)) &&
      Math.floor(py / tileSize) >= 39 &&
      Math.floor(py / tileSize) <= 51
    ) {
      prompt = 'TEKAN [E] / KLIK UNTUK MEMBUKA PAPAN INFORMASI (world/popup) 📢';
      locationName = 'ALUN-ALUN: PAPAN POPUP 10x10';
    } else {
      for (const npc of npcs) {
        const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
        if (dist < 100) {
          prompt = `TEKAN [E] / KLIK UNTUK BICARA DENGAN ${npc.name.toUpperCase()}`;
          break;
        }
      }

      if (!prompt) {
        const gx = Math.floor(px / tileSize);
        const gy = Math.floor(py / tileSize);
        if (gx >= 23 && gx <= 34 && gy >= 52 && gy <= 58) {
          prompt = 'TEKAN [E] / SENTUH UNTUK MAIN MINI GAME SEPAKBOLA ⚽';
        } else if (gx >= 45 && gx <= 56 && gy >= 52 && gy <= 58) {
          prompt = 'TEKAN [E] / SENTUH UNTUK MAIN MINI GAME BASKETBALL 🏀';
        } else {
          const isPierOrWaterfront = (
            (gx >= 61 && gx <= 74 && gy >= 23 && gy <= 56) ||
            (gy >= 68 && gy <= 78)
          );
          const isNearFountain = Math.hypot(px - 4800, py - 4800) <= 260;
          if (isPierOrWaterfront || isNearFountain) {
            prompt = 'TEKAN [F] / SENTUH MANCING UNTUK MEMANCING';
          }
        }
      }
    }

    return { prompt, locationName };
  }

  /**
   * Menavigasikan karakter ke pintu dan memicu transisi saat tiba
   */
  public static approachDoorAndEnter(
    player: Player | null,
    type: 'sd' | 'smp' | 'sma' | 'house',
    doorX: number,
    doorY: number,
    doors: IWorldDoors,
    openSchoolGradeSelectFn: (schoolType: 'sd' | 'smp' | 'sma', returnX: number, returnY: number) => void,
    transitionToHouseFn: () => void,
    spawnRippleFn: (x: number, y: number) => void
  ): void {
    if (!player || !player.active) return;
    const px = player.x;
    const py = player.y;
    const dist = Phaser.Math.Distance.Between(px, py, doorX, doorY);

    if (dist <= 130) {
      if (type === 'sd') openSchoolGradeSelectFn('sd', doors.schoolSdDoor.x, doors.schoolSdDoor.y + 120);
      else if (type === 'smp') openSchoolGradeSelectFn('smp', doors.schoolSmpDoor.x, doors.schoolSmpDoor.y + 120);
      else if (type === 'sma') openSchoolGradeSelectFn('sma', doors.schoolSmaDoor.x, doors.schoolSmaDoor.y + 120);
      else transitionToHouseFn();
    } else {
      spawnRippleFn(doorX, doorY + 60);
      player.navigateTo(doorX, doorY + 60, () => {
        if (type === 'sd') openSchoolGradeSelectFn('sd', doors.schoolSdDoor.x, doors.schoolSdDoor.y + 120);
        else if (type === 'smp') openSchoolGradeSelectFn('smp', doors.schoolSmpDoor.x, doors.schoolSmpDoor.y + 120);
        else if (type === 'sma') openSchoolGradeSelectFn('sma', doors.schoolSmaDoor.x, doors.schoolSmaDoor.y + 120);
        else transitionToHouseFn();
      });
    }
  }

  /**
   * Memulihkan energi HP pemain 100% di Rumah Sakit Kota
   */
  public static healPlayerAtHospital(
    player: Player | null,
    hospitalDoor: IWorldDoorCoord,
    tileSize: number,
    spawnRippleFn: (x: number, y: number) => void
  ): void {
    if (!player || !player.active) return;
    player.updateHealth(100, 100);
    player.showSpeechBubble('💉 Perawatan Rumah Sakit berhasil! Energimu pulih sepenuhnya (100 HP)! ✨', 2500);
    EventBus.emit('player-stats-updated', {
      x: Math.round(player.x),
      y: Math.round(player.y),
      gridX: Math.floor(player.x / tileSize),
      gridY: Math.floor(player.y / tileSize),
      hp: 100,
      maxHp: 100,
      name: player.getEntityName(),
      avatar: player.getAvatar(),
      roomName: 'KAWASAN KESEHATAN: RUMAH SAKIT KOTA',
      inHouse: false,
      level: 1,
    });
    spawnRippleFn(hospitalDoor.x, hospitalDoor.y);
  }

  /**
   * Menangani perpindahan scene ke Gedung Sekolah (SD, SMP, atau SMA)
   */
  public static transitionToSchool(
    scene: Phaser.Scene,
    player: Player | null,
    pendingPlayerName: string | null,
    pendingAvatar: IAvatarCustomization | null,
    schoolType: 'sd' | 'smp' | 'sma',
    returnX: number,
    returnY: number,
    grade?: number
  ): void {
    const resolvedGrade = (typeof grade === 'number' && grade >= 1) ? grade : (() => {
      try {
        const saved = localStorage.getItem(`raden_school_${schoolType}_grade`);
        return saved ? parseInt(saved, 10) : 1;
      } catch (e) {
        return 1;
      }
    })();

    const label = schoolType === 'sd'
      ? `Gedung SD (Kelas ${resolvedGrade})`
      : schoolType === 'smp'
        ? `Gedung SMP (Kelas ${resolvedGrade})`
        : `Gedung SMA (Kelas ${resolvedGrade})`;
    player?.showSpeechBubble(`Masuk ke ${label}...`);

    try {
      localStorage.setItem(`raden_school_${schoolType}_grade`, resolvedGrade.toString());
    } catch (e) { }

    const schoolPath = `/world/${schoolType}`;
    if (window.location.pathname !== schoolPath) {
      window.history.pushState(null, '', schoolPath);
    }
    EventBus.emit('url-changed', schoolPath);

    scene.time.delayedCall(400, () => {
      scene.cameras?.main?.stopFollow();
      scene.scene.start('SchoolScene', {
        schoolType,
        grade: resolvedGrade,
        name: player?.getEntityName() || pendingPlayerName || 'Petualang',
        avatar: player?.getAvatar() || pendingAvatar,
        returnX,
        returnY,
        fromDoor: true,
      });
    });
  }

  /**
   * Menangani perpindahan scene ke Rumah Pribadi (HouseScene)
   */
  public static transitionToHouse(
    scene: Phaser.Scene,
    player: Player | null,
    pendingPlayerName: string | null,
    pendingAvatar: IAvatarCustomization | null,
    privateRoomId: string,
    networkManager: NetworkManager
  ): void {
    player?.showSpeechBubble('Kembali ke rumah pribadi...');

    scene.time.delayedCall(400, () => {
      let safeId = privateRoomId;
      try {
        const storedUser = localStorage.getItem('raden_player_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.private_room_id) safeId = u.private_room_id;
        }
      } catch (e) { }

      const housePath = `/home/${safeId}`;
      if (window.location.pathname !== housePath) {
        window.history.pushState(null, '', housePath);
      }
      EventBus.emit('url-changed', housePath);
      scene.cameras?.main?.stopFollow();
      networkManager.disconnect();
      scene.scene.start('HouseScene', {
        name: player?.getEntityName() || pendingPlayerName || 'Petualang',
        avatar: player?.getAvatar() || pendingAvatar,
        privateRoomId: safeId,
      });
    });
  }
}
