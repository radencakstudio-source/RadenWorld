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
export const SunbeamOverlay: React.FC = React.memo(() => {
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

  // Konfigurasi warna berkas sinar (Sinar Biru Rembulan Halus di Malam Hari vs Sinar Emas Transparan di Siang Hari)
  const beamColors = useMemo(() => {
    if (lighting.isNight) {
      // Sinar Rembulan Biru Langit Malam Halus & Sejuk (Ethereal Moonlight Beams)
      return {
        coronaCenter: '#f0f9ff', // Soft silver-blue light
        coronaMid: '#bae6fd',    // Sky blue
        coronaOuter: '#60a5fa',  // Moonlight blue
        beamStop0: '#e0f2fe',    // Pale blue glow
        beamStop20: '#bae6fd',
        beamStop50: '#7dd3fc',
        beamStop80: '#38bdf8',
        beamStop100: '#0284c7',
        beamOpacity: 0.52,       // Terlihat nyata dan sejuk di malam hari
        mixMode: 'screen' as const,
      };
    }

    if (lighting.isSunset) {
      // Sinar Senja Oranye Keemasan Hangat (Sunset God Rays)
      return {
        coronaCenter: '#fff7ed',
        coronaMid: '#fed7aa',
        coronaOuter: '#fb923c',
        beamStop0: '#fff7ed',
        beamStop20: '#fed7aa',
        beamStop50: '#fb923c',
        beamStop80: '#ea580c',
        beamStop100: '#c2410c',
        beamOpacity: 0.68,       // Terlihat nyata dan dramatis di langit senja
        mixMode: 'screen' as const,
      };
    }

    // Sinar Mentari Siang Emas Berpendar Indah (Cinematic Tropical Sunbeams)
    return {
      coronaCenter: '#ffffff',
      coronaMid: '#fef08a',
      coronaOuter: '#facc15',
      beamStop0: '#ffffff',
      beamStop20: '#fffbeb',
      beamStop50: '#fef08a',
      beamStop80: '#fde047',
      beamStop100: '#eab308',
      beamOpacity: 0.64,         // Terlihat jelas, hangat, dan megah menyinari dunia
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
      {/* 2. BERKAS SINAR DIAGONAL DARI ATAS KIRI KE TENGAH (GOD RAYS)         */}
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
          {/* Filter blur halus untuk melembutkan tepi berkas sinar agar terlihat alami */}
          <filter id="softRayBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>

          {/* Gradien linear berkas sinar diagonal dari (0,0) menuju tengah layar (Vibrant Visibility) */}
          <linearGradient id="godRayGradient" x1="0%" y1="0%" x2="75%" y2="75%">
            <stop offset="0%" stopColor={beamColors.beamStop0} stopOpacity="0.82" />
            <stop offset="20%" stopColor={beamColors.beamStop20} stopOpacity="0.65" />
            <stop offset="45%" stopColor={beamColors.beamStop50} stopOpacity="0.45" />
            <stop offset="70%" stopColor={beamColors.beamStop80} stopOpacity="0.22" />
            <stop offset="90%" stopColor={beamColors.beamStop100} stopOpacity="0.06" />
            <stop offset="100%" stopColor={beamColors.beamStop100} stopOpacity="0" />
          </linearGradient>

          {/* Gradien khusus sorotan utama di tengah layar (Hero Center Shaft) */}
          <linearGradient id="heroRayGradient" x1="0%" y1="0%" x2="80%" y2="80%">
            <stop offset="0%" stopColor={beamColors.beamStop0} stopOpacity="0.95" />
            <stop offset="20%" stopColor={beamColors.beamStop20} stopOpacity="0.80" />
            <stop offset="45%" stopColor={beamColors.beamStop50} stopOpacity="0.55" />
            <stop offset="70%" stopColor={beamColors.beamStop80} stopOpacity="0.28" />
            <stop offset="90%" stopColor={beamColors.beamStop100} stopOpacity="0.08" />
            <stop offset="100%" stopColor={beamColors.beamStop100} stopOpacity="0" />
          </linearGradient>

          {/* Pendaran sumber cahaya mentari / rembulan (Corona Flare) di sudut kiri atas */}
          <radialGradient id="celestialCorona" cx="0%" cy="0%" r="48%">
            <stop offset="0%" stopColor={beamColors.coronaCenter} stopOpacity={lighting.isNight ? "0.62" : "0.78"} />
            <stop offset="25%" stopColor={beamColors.coronaMid} stopOpacity={lighting.isNight ? "0.36" : "0.48"} />
            <stop offset="55%" stopColor={beamColors.coronaOuter} stopOpacity={lighting.isNight ? "0.14" : "0.20"} />
            <stop offset="85%" stopColor={beamColors.coronaOuter} stopOpacity="0.04" />
            <stop offset="100%" stopColor={beamColors.coronaOuter} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sumber Pendaran Cahaya di Sudut Kiri Atas */}
        <circle cx="0" cy="0" r="500" fill="url(#celestialCorona)" />

        {/* Gugusan Berkas Sinar Menyorot Diagonal dengan Filter Blur Alami */}
        <g filter="url(#softRayBlur)">
          {/* Sinar 1: Atas-Kiri */}
          <polygon points="0,0 360,1080 620,1080" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.75} />

          {/* Sinar 2: Tengah Utama (Melintasi Pusat Layar dengan Gradien Utama) */}
          <polygon points="0,0 720,1080 1180,1080" fill="url(#heroRayGradient)" opacity={beamColors.beamOpacity * 1.0} />

          {/* Sinar 3: Tengah Kanan */}
          <polygon points="0,0 1240,1080 1560,1080" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.85} />

          {/* Sinar 4: Diagonal Bawah Kanan */}
          <polygon points="0,0 1620,1080 1920,950" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.75} />

          {/* Sinar 5: Sisi Kanan Tengah */}
          <polygon points="0,0 1920,540 1920,840" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.70} />

          {/* Sinar 6: Sisi Kanan Atas */}
          <polygon points="0,0 1920,200 1920,480" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.60} />

          {/* Sinar 7: Kerucut Sorot Latar Halus Penyatu Suasana */}
          <polygon points="0,0 500,1080 1920,1080 1920,200" fill="url(#godRayGradient)" opacity={beamColors.beamOpacity * 0.35} />
        </g>
      </svg>
    </div>
  );
});
SunbeamOverlay.displayName = 'SunbeamOverlay';
