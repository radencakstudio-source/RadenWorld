import React, { useState, useEffect, useMemo } from 'react';

/**
 * ============================================================================
 * FILE: resources/js/game/ui/SunbeamOverlay.tsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen Realtime Day-Night Cycle & Atmospheric Light Shafts:
 * 1. REALTIME SESUAI JAM:
 *    - Siang (06:30 - 16:30): Terang benderang penuh (Bright Day) dengan sinar mentari keemasan.
 *    - Sore / Senja (16:30 - 18:30): Suasana senja hangat keemasan (Golden Sunset).
 *    - Malam (18:30 - 05:00): Suasana malam sejuk, adem, dan bersih (Cozy Slate Midnight).
 *      Warna rumput dan alam tetap jernih tanpa distorsi warna ungu kotor.
 *      Sinar rembulan perak lembut (Soft Silver Moonlight Shafts) yang menenangkan mata.
 *    - Fajar (05:00 - 06:30): Transisi lembut fajar pagi (Sunrise Dawn).
 * 2. 100% BEBAS KOTAK: Feathered radial gradient & gaussian blur lebar.
 * 3. 100% KEBAL ZOOM: Menempel di viewport monitor pemain, tidak terpengaruh zoom out/in game.
 * 4. POINTER EVENTS NONE: Tidak menghalangi interaksi game apa pun.
 * ============================================================================
 */
export const SunbeamOverlay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Sinkronisasi realtime setiap 30 detik (menghemat CPU dan render loop)
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Hitung jam desimal (misal 22:50 -> 22.83)
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const timeDecimal = hours + minutes / 60 + seconds / 3600;

  // Evaluasi siklus waktu & parameter pencahayaan
  const lighting = useMemo(() => {
    let nightDarkness = 0; // Opacity lapisan malam sejuk (0 = siang terang, max 0.28 = malam adem)
    let sunsetTint = 0;    // Opacity lapisan senja hangat
    let isNight = false;
    let isSunset = false;

    // Klasifikasi Jam Tropis Indonesia (WIB)
    if (timeDecimal >= 18.5 || timeDecimal < 5.0) {
      // Malam Hari (18:30 - 05:00)
      isNight = true;
      if (timeDecimal >= 19.5 || timeDecimal < 4.0) {
        nightDarkness = 0.26; // Suasana malam yang adem, jernih, dan sangat nyaman di mata
      } else if (timeDecimal >= 18.5 && timeDecimal < 19.5) {
        // Transisi senja -> malam (18:30 - 19:30)
        const progress = (timeDecimal - 18.5) / 1.0;
        nightDarkness = 0.10 + progress * 0.16;
      } else {
        // Transisi malam -> fajar (04:00 - 05:00)
        const progress = (5.0 - timeDecimal) / 1.0;
        nightDarkness = 0.10 + progress * 0.16;
      }
    } else if (timeDecimal >= 5.0 && timeDecimal < 6.5) {
      // Fajar Pagi (05:00 - 06:30): Meredup lembut menuju terang siang
      const progress = (timeDecimal - 5.0) / 1.5;
      nightDarkness = Math.max(0, 0.15 * (1 - progress));
    } else if (timeDecimal >= 6.5 && timeDecimal < 16.5) {
      // Siang Cerah (06:30 - 16:30): Terang benderang murni 100%
      nightDarkness = 0;
      sunsetTint = 0;
    } else {
      // Sore / Senja (16:30 - 18:30): Langit keemasan menuju senja
      isSunset = true;
      const progress = (timeDecimal - 16.5) / 2.0;
      sunsetTint = 0.12;
      nightDarkness = progress * 0.12;
    }

    return {
      nightDarkness,
      sunsetTint,
      isNight,
      isSunset,
    };
  }, [timeDecimal]);

  // Konfigurasi warna berkas sinar (Sinar Bulan Perak Sejuk di Malam Hari vs Sinar Emas di Siang Hari)
  const beamColors = useMemo(() => {
    if (lighting.isNight) {
      // Sinar Rembulan Perak Sejuk (Soft Moonlit Pearl Silver - Sangat Adem & Elegan)
      return {
        coronaCenter: '#ffffff',
        coronaMid: '#f8fafc',
        coronaOuter: '#e2e8f0',
        beamStop0: '#ffffff',
        beamStop20: '#f8fafc',
        beamStop50: '#f1f5f9',
        beamStop80: '#e2e8f0',
        beamStop100: '#cbd5e1',
        beamOpacity: 0.18, // Sangat lembut, menenangkan, tidak silau
        mixMode: 'screen' as const,
      };
    }

    if (lighting.isSunset) {
      // Sinar Senja Oranye Keemasan (Sunset Glow)
      return {
        coronaCenter: '#fff7ed',
        coronaMid: '#fed7aa',
        coronaOuter: '#f97316',
        beamStop0: '#fff7ed',
        beamStop20: '#fed7aa',
        beamStop50: '#fb923c',
        beamStop80: '#ea580c',
        beamStop100: '#c2410c',
        beamOpacity: 0.65,
        mixMode: 'screen' as const,
      };
    }

    // Sinar Mentari Siang Hangat Cemerlang (Daylight Beams)
    return {
      coronaCenter: '#ffffff',
      coronaMid: '#fffbeb',
      coronaOuter: '#fef08a',
      beamStop0: '#fffbeb',
      beamStop20: '#fef3c7',
      beamStop50: '#fef08a',
      beamStop80: '#fde047',
      beamStop100: '#eab308',
      beamOpacity: 0.60,
      mixMode: 'screen' as const,
    };
  }, [lighting.isNight, lighting.isSunset]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-[8] overflow-hidden select-none transition-all duration-1000 ease-linear"
      aria-hidden="true"
    >
      {/* ==================================================================== */}
      {/* 1. LAPISAN SUASANA MALAM REALTIME (DEEP SLATE NAVY BERSIH & ADEM)    */}
      {/* Warna malam yang jernih, nyaman di mata, tidak mengubah warna rumput */}
      {/* ==================================================================== */}
      {lighting.nightDarkness > 0 && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-linear pointer-events-none"
          style={{
            backgroundColor: '#0f172a', // Slate-900: Teduh malam alami
            mixBlendMode: 'multiply',
            opacity: lighting.nightDarkness,
          }}
        />
      )}

      {/* Pendaran Vignette Malam Lembut di Tepian Layar (Fokus Tengah Tetap Jernih) */}
      {lighting.isNight && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-linear pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0) 45%, rgba(15, 23, 42, 0.24) 100%)',
            mixBlendMode: 'multiply',
            opacity: 0.85,
          }}
        />
      )}

      {/* Lapisan Kehangatan Senja Oranye (Hanya Aktif Saat Sore Hari) */}
      {lighting.sunsetTint > 0 && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-linear pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(180, 83, 9, 0.05) 100%)',
            mixBlendMode: 'screen',
            opacity: lighting.sunsetTint,
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* 2. BERKAS SINAR DIAGONAL DARI ATAS KIRI KE TENGAH                    */}
      {/* Siang: Sinar Mentari Keemasan | Malam: Sinar Rembulan Perak Sejuk   */}
      {/* ==================================================================== */}
      <svg
        className="absolute inset-0 w-full h-full animate-sunbeam transition-all duration-1000 pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          mixBlendMode: beamColors.mixMode,
          transform: 'translateZ(0)',
          willChange: 'opacity, transform',
        }}
      >
        <defs>
          {/* Gradien linear berkas sinar diagonal dari (0,0) menuju tengah layar */}
          <linearGradient id="godRayGradient" x1="0%" y1="0%" x2="72%" y2="72%">
            <stop offset="0%" stopColor={beamColors.beamStop0} stopOpacity="0.45" />
            <stop offset="22%" stopColor={beamColors.beamStop20} stopOpacity="0.24" />
            <stop offset="50%" stopColor={beamColors.beamStop50} stopOpacity="0.10" />
            <stop offset="78%" stopColor={beamColors.beamStop80} stopOpacity="0.02" />
            <stop offset="100%" stopColor={beamColors.beamStop100} stopOpacity="0" />
          </linearGradient>

          {/* Pendaran sumber cahaya (Corona Flare) di sudut kiri atas */}
          <radialGradient id="celestialCorona" cx="0%" cy="0%" r="42%">
            <stop offset="0%" stopColor={beamColors.coronaCenter} stopOpacity={lighting.isNight ? "0.35" : "0.60"} />
            <stop offset="28%" stopColor={beamColors.coronaMid} stopOpacity={lighting.isNight ? "0.16" : "0.28"} />
            <stop offset="65%" stopColor={beamColors.coronaOuter} stopOpacity={lighting.isNight ? "0.04" : "0.06"} />
            <stop offset="100%" stopColor={beamColors.coronaOuter} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sumber Pendaran Cahaya di Sudut Kiri Atas */}
        <circle cx="0" cy="0" r="400" fill="url(#celestialCorona)" />

        {/* Gugusan 6 Berkas Sinar Menyorot Diagonal dari Atas Kiri ke Tengah Layar */}
        <g>
          {/* Sinar 1: Atas-Tengah */}
          <polygon points="0,0 480,1080 760,1080" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.85} />

          {/* Sinar 2: Tengah Utama (Melintasi Pusat Layar) */}
          <polygon points="0,0 820,1080 1240,1080" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 1.15} />

          {/* Sinar 3: Tengah Lebar Lembut */}
          <polygon points="0,0 1280,1080 1660,1080" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.95} />

          {/* Sinar 4: Diagonal Bawah Kanan */}
          <polygon points="0,0 1920,620 1920,960" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.90} />

          {/* Sinar 5: Sisi Kanan Tengah */}
          <polygon points="0,0 1920,280 1920,560" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.70} />

          {/* Sinar 6: Kerucut Sorot Latar Halus */}
          <polygon points="0,0 600,1080 1800,1080 1920,800 1920,200" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.35} />
        </g>
      </svg>
    </div>
  );
};
