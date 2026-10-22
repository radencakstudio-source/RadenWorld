/**
 * ============================================================================
 * FILE: resources/js/game/scenes/world/WorldNpcs.ts
 * ============================================================================
 * FUNGSI UTAMA:
 * Modul untuk mengelola NPC (Non-Player Characters) di Open World:
 * 1. Interface konfigurasi data NPC (INpcConfig).
 * 2. Helper pembuatan dan penempatan sprite NPC, name tag, role tag di peta.
 * 3. Logika navigasi karakter menuju NPC saat diklik/tap dari jauh.
 * 4. Pemicu dialog interaktif via EventBus ('open-dialogue').
 * ============================================================================
 */

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';
import type { Player } from '../../entities/Player';
import type { INpcConfig } from '../../types';

export type { INpcConfig };

export class WorldNpcs {
  /**
   * Membuat seluruh NPC interaktif di dunia jika daftar npcsConfig tersedia
   */
  public static createWorldNpcs(
    scene: Phaser.Scene,
    npcsConfig: INpcConfig[],
    onNpcClicked: (npcData: INpcConfig) => void
  ): void {
    if (!npcsConfig || npcsConfig.length === 0) return;

    npcsConfig.forEach(npcData => {
      const npcSprite = scene.add.image(npcData.x, npcData.y, npcData.spriteKey);
      npcSprite.setDisplaySize(120, 240);
      npcSprite.setOrigin(0.5, 0.5);
      npcSprite.setDepth(npcData.y + 120);

      scene.add.text(npcData.x, npcData.y - 105, npcData.name, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '13px',
        color: '#fef08a',
        fontStyle: 'bold',
        stroke: '#0a0f1d',
        strokeThickness: 3.5,
        resolution: 4,
      }).setOrigin(0.5).setDepth(npcData.y + 121);

      scene.add.text(npcData.x, npcData.y - 88, `[${npcData.role}]`, {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: '10px',
        color: '#38bdf8',
        stroke: '#0a0f1d',
        strokeThickness: 2.5,
        resolution: 4,
      }).setOrigin(0.5).setDepth(npcData.y + 121);

      npcSprite.setInteractive({ useHandCursor: true });
      npcSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        onNpcClicked(npcData);
      });
    });
  }

  /**
   * Mengarahkan pemain mendekati NPC sebelum membuka jendela dialog
   */
  public static approachAndInteractWithNpc(
    player: Player | null,
    npcData: INpcConfig,
    spawnRippleFn: (x: number, y: number) => void
  ): void {
    if (!player || !player.active) return;

    const px = player.x;
    const py = player.y;
    const dist = Phaser.Math.Distance.Between(px, py, npcData.x, npcData.y);

    if (dist <= 110) {
      this.interactWithNpc(npcData);
    } else {
      player.showSpeechBubble(`Menuju ke ${npcData.name}...`, 1500);

      const angle = Phaser.Math.Angle.Between(npcData.x, npcData.y, px, py);
      const targetX = Math.round(npcData.x + Math.cos(angle) * 75);
      const targetY = Math.round(npcData.y + Math.sin(angle) * 75);

      spawnRippleFn(targetX, targetY);
      player.navigateTo(targetX, targetY, () => {
        this.interactWithNpc(npcData);
      });
    }
  }

  /**
   * Memicu dialog dengan NPC ke UI overlay React via EventBus
   */
  public static interactWithNpc(npcData: INpcConfig): void {
    EventBus.emit('open-dialogue', {
      id: npcData.id,
      name: npcData.name,
      role: npcData.role,
      avatarType: npcData.avatarType,
      avatarUrl: npcData.avatarUrl,
      dialogues: npcData.dialogues && npcData.dialogues.length > 0 ? npcData.dialogues : [npcData.greeting],
    });
  }
}
