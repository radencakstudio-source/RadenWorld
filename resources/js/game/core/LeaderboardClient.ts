/**
 * ============================================================================
 * FILE: resources/js/game/core/LeaderboardClient.ts
 * ============================================================================
 * Klien Leaderboard Sekolah & Kelas RadenWorld (Kelas 1-12 & SD/SMP/SMA).
 * Terhubung ke endpoint Laravel (/api/game/leaderboard) dengan sinkronisasi
 * fallback localStorage agar tetap bekerja mulus dalam mode online maupun offline.
 * ============================================================================
 */

export interface ILeaderboardStudentEntry {
  name: string;
  classKey: string;
  classLabel: string;
  school: 'sd' | 'smp' | 'sma';
  bestScore: number;
  totalScore: number;
  quizzesPlayed: number;
  bestCorrect: number;
  accuracy: number;
  subject: string;
  updatedAt: string;
}

export interface ISchoolOverviewBoard {
  school: 'sd' | 'smp' | 'sma';
  schoolTitle: string;
  studentCount: number;
  totalSchoolPoints: number;
  champion: ILeaderboardStudentEntry | null;
  entries: ILeaderboardStudentEntry[];
}

export interface ILeaderboardPayload {
  school: 'sd' | 'smp' | 'sma';
  grade: number;
  classKey: string;
  classLeaderboard: ILeaderboardStudentEntry[];
  schoolLeaderboard: ILeaderboardStudentEntry[];
  schoolsOverview: Record<'sd' | 'smp' | 'sma', ISchoolOverviewBoard>;
}

const LOCAL_LB_KEY = 'raden_local_leaderboard_v1';

export function getOfficialClassLabel(school: 'sd' | 'smp' | 'sma', grade: number): string {
  if (school === 'sd') return `Kelas ${grade} SD`;
  if (school === 'smp') return `Kelas ${grade + 6} SMP`;
  return `Kelas ${grade + 9} SMA`;
}

const DEFAULT_SEED_BY_CLASS: Record<string, Array<[string, number, number, number, number, string]>> = {
  'sd-1': [
    ['Alya Putri', 1840, 3920, 3, 18, 'Matematika'],
    ['Budi Santoso', 1680, 3100, 2, 17, 'Semua Mapel'],
    ['Citra Kirana', 1520, 2890, 2, 16, 'Bahasa Indonesia'],
    ['Daffa Pratama', 1340, 1340, 1, 14, 'IPAS'],
    ['Eka Saputra', 1120, 1120, 1, 12, 'Pendidikan Pancasila'],
  ],
  'sd-2': [
    ['Farhan Rizki', 1920, 4120, 3, 19, 'Matematika'],
    ['Gita Nirmala', 1740, 3300, 2, 17, 'Semua Mapel'],
    ['Hana Safitri', 1580, 1580, 1, 16, 'Bahasa Indonesia'],
    ['Indra Wijaya', 1390, 2450, 2, 14, 'IPAS'],
    ['Joko Susilo', 1180, 1180, 1, 12, 'Pendidikan Pancasila'],
  ],
  'sd-3': [
    ['Kirana Dewi', 1980, 4680, 3, 19, 'IPAS'],
    ['Luthfi Hakim', 1760, 3420, 2, 18, 'Matematika'],
    ['Maya Sari', 1600, 1600, 1, 16, 'Semua Mapel'],
    ['Naufal Azhar', 1420, 2600, 2, 15, 'Bahasa Indonesia'],
    ['Olivia Natasya', 1240, 1240, 1, 13, 'Pendidikan Pancasila'],
  ],
  'sd-4': [
    ['Putra Ramadhan', 2040, 5120, 3, 19, 'Semua Mapel'],
    ['Qori Amalia', 1820, 3550, 2, 18, 'IPAS'],
    ['Rafi Ahmad', 1640, 3120, 2, 17, 'Matematika'],
    ['Sinta Bella', 1480, 1480, 1, 15, 'Bahasa Indonesia'],
    ['Tegar Prakoso', 1260, 1260, 1, 13, 'Pendidikan Pancasila'],
  ],
  'sd-5': [
    ['Umar Faruq', 2100, 5600, 3, 20, 'Matematika'],
    ['Vina Panduwinata', 1880, 3680, 2, 18, 'IPAS'],
    ['Wahyu Setiawan', 1700, 3200, 2, 17, 'Semua Mapel'],
    ['Yuni Shara', 1500, 1500, 1, 15, 'Bahasa Indonesia'],
    ['Zaki Mubarak', 1300, 1300, 1, 13, 'Pendidikan Pancasila'],
  ],
  'sd-6': [
    ['Bagas Adi', 2180, 6240, 4, 20, 'Semua Mapel'],
    ['Tiara Andini', 1960, 3890, 2, 19, 'Matematika'],
    ['Rizky Nazar', 1780, 3400, 2, 18, 'IPAS'],
    ['Nabila Syakieb', 1560, 1560, 1, 16, 'Bahasa Indonesia'],
    ['Fajar Pratama', 1320, 1320, 1, 14, 'Pendidikan Pancasila'],
  ],
  'smp-1': [
    ['Rian Aditya', 2120, 5980, 3, 20, 'IPA'],
    ['Aurelia Maharani', 1940, 3800, 2, 19, 'Matematika'],
    ['Bima Arya', 1720, 3310, 2, 17, 'Bahasa Inggris'],
    ['Chelsea Islan', 1540, 1540, 1, 16, 'IPS'],
    ['Kevin Sanjaya', 1360, 1360, 1, 14, 'PPKn'],
  ],
  'smp-2': [
    ['Nadia Vega', 2200, 6450, 4, 20, 'Matematika'],
    ['Galih Permana', 1980, 3910, 2, 19, 'IPA'],
    ['Ratna Galih', 1760, 3420, 2, 18, 'Semua Mapel'],
    ['Yoga Pratama', 1580, 1580, 1, 16, 'Bahasa Inggris'],
    ['Salsabila Putri', 1380, 1380, 1, 14, 'IPS'],
  ],
  'smp-3': [
    ['Arjuna Wiwaha', 2280, 7100, 4, 20, 'Semua Mapel'],
    ['Dewi Sartika', 2060, 4120, 2, 19, 'IPA'],
    ['Fikri Haikal', 1840, 3600, 2, 18, 'Matematika'],
    ['Larasati Putri', 1620, 1620, 1, 16, 'Bahasa Indonesia'],
    ['Reza Rahadian', 1420, 1420, 1, 15, 'PPKn'],
  ],
  'sma-1': [
    ['Bintang Kejora', 2220, 6320, 3, 20, 'Fisika'],
    ['Maudy Ayunda', 2080, 4150, 2, 19, 'Matematika'],
    ['Jerome Polin', 1960, 3890, 2, 19, 'Kimia'],
    ['Sherina Munaf', 1720, 1720, 1, 17, 'Biologi'],
    ['Iqbaal Ramadhan', 1540, 1540, 1, 16, 'Ekonomi'],
  ],
  'sma-2': [
    ['Cinta Laura', 2300, 6980, 4, 20, 'Bahasa Inggris'],
    ['Nicholas Saputra', 2140, 4280, 2, 20, 'Fisika'],
    ['Tasya Kamila', 1920, 3760, 2, 19, 'Kimia'],
    ['Angga Yunanda', 1700, 1700, 1, 17, 'Sosiologi'],
    ['Prilly Latuconsina', 1520, 1520, 1, 15, 'Ekonomi'],
  ],
  'sma-3': [
    ['Dimas Alamsyah', 2380, 7840, 4, 20, 'Semua Mapel'],
    ['Gita Savitri', 2200, 4400, 2, 20, 'Kimia'],
    ['Najwa Shihab', 2040, 4080, 2, 19, 'Sosiologi'],
    ['Raditya Dika', 1800, 1800, 1, 18, 'Bahasa Indonesia'],
    ['Afgan Syahreza', 1600, 1600, 1, 16, 'Matematika'],
  ],
};

function readLocalStore(): Record<string, ILeaderboardStudentEntry[]> {
  try {
    const raw = localStorage.getItem(LOCAL_LB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore
  }

  const seeded: Record<string, ILeaderboardStudentEntry[]> = {};
  const now = new Date().toISOString();
  for (const [cKey, rows] of Object.entries(DEFAULT_SEED_BY_CLASS)) {
    const [sRaw, gRaw] = cKey.split('-');
    const school = (sRaw as 'sd' | 'smp' | 'sma') || 'sd';
    const grade = Number(gRaw) || 1;
    seeded[cKey] = rows.map((r) => ({
      name: r[0],
      classKey: cKey,
      classLabel: getOfficialClassLabel(school, grade),
      school,
      bestScore: r[1],
      totalScore: r[2],
      quizzesPlayed: r[3],
      bestCorrect: r[4],
      accuracy: Math.min(100, Math.round((r[4] / 20) * 100)),
      subject: r[5],
      updatedAt: now,
    }));
  }
  try {
    localStorage.setItem(LOCAL_LB_KEY, JSON.stringify(seeded));
  } catch {
    // ignore
  }
  return seeded;
}

function buildLocalPayload(
  classes: Record<string, ILeaderboardStudentEntry[]>,
  school: 'sd' | 'smp' | 'sma',
  grade: number
): ILeaderboardPayload {
  const maxG = school === 'sd' ? 6 : 3;
  const g = Math.max(1, Math.min(maxG, grade));
  const classKey = `${school}-${g}`;

  const sortRows = (rows: ILeaderboardStudentEntry[]) => {
    const real = rows.filter((r) => (r as any).isReal);
    const mock = rows.filter((r) => !(r as any).isReal);
    const sorter = (a: ILeaderboardStudentEntry, b: ILeaderboardStudentEntry) =>
      b.bestScore !== a.bestScore ? b.bestScore - a.bestScore : b.totalScore - a.totalScore;
    if (real.length > 0) {
      return [...real].sort(sorter);
    }
    return [...mock].sort(sorter);
  };

  const buildSchool = (sCode: 'sd' | 'smp' | 'sma'): ILeaderboardStudentEntry[] => {
    const byPlayer = new Map<string, ILeaderboardStudentEntry>();
    for (const [cKey, list] of Object.entries(classes)) {
      if (!cKey.startsWith(`${sCode}-`) || !Array.isArray(list)) continue;
      for (const row of list) {
        const k = row.name.trim().toLowerCase();
        const prev = byPlayer.get(k);
        if (!prev) {
          byPlayer.set(k, { ...row });
        } else {
          const isHigher = row.bestScore >= prev.bestScore;
          byPlayer.set(k, {
            ...prev,
            bestScore: Math.max(prev.bestScore, row.bestScore),
            totalScore: prev.totalScore + row.totalScore,
            quizzesPlayed: prev.quizzesPlayed + row.quizzesPlayed,
            bestCorrect: Math.max(prev.bestCorrect, row.bestCorrect),
            accuracy: Math.max(prev.accuracy, row.accuracy),
            classKey: isHigher ? row.classKey : prev.classKey,
            classLabel: isHigher ? row.classLabel : prev.classLabel,
            subject: isHigher ? row.subject : prev.subject,
          });
        }
      }
    }
    return sortRows(Array.from(byPlayer.values())).slice(0, 30);
  };

  const titles: Record<'sd' | 'smp' | 'sma', string> = {
    sd: 'SD RadenWorld',
    smp: 'SMP RadenWorld',
    sma: 'SMA RadenWorld',
  };

  const schoolsOverview = (['sd', 'smp', 'sma'] as const).reduce(
    (acc, sCode) => {
      const entries = buildSchool(sCode);
      acc[sCode] = {
        school: sCode,
        schoolTitle: titles[sCode],
        studentCount: entries.length,
        totalSchoolPoints: entries.reduce((sum, e) => sum + e.totalScore, 0),
        champion: entries[0] || null,
        entries,
      };
      return acc;
    },
    {} as Record<'sd' | 'smp' | 'sma', ISchoolOverviewBoard>
  );

  return {
    school,
    grade: g,
    classKey,
    classLeaderboard: sortRows(classes[classKey] || []).slice(0, 25),
    schoolLeaderboard: schoolsOverview[school].entries,
    schoolsOverview,
  };
}

export async function fetchSchoolLeaderboards(
  school: 'sd' | 'smp' | 'sma',
  grade: number
): Promise<ILeaderboardPayload> {
  try {
    const res = await fetch(
      `/api/game/leaderboard?school=${encodeURIComponent(school)}&grade=${encodeURIComponent(String(grade))}`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.classLeaderboard)) {
        return json as ILeaderboardPayload;
      }
    }
  } catch {
    // Fallback to local
  }
  return buildLocalPayload(readLocalStore(), school, grade);
}

export async function submitQuizScoreToLeaderboard(params: {
  playerName: string;
  schoolType: 'sd' | 'smp' | 'sma';
  grade: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  subject: string;
}): Promise<ILeaderboardPayload> {
  const cleanName = (params.playerName || 'Siswa Raden').trim() || 'Siswa Raden';
  const maxG = params.schoolType === 'sd' ? 6 : 3;
  const g = Math.max(1, Math.min(maxG, params.grade));
  const classKey = `${params.schoolType}-${g}`;
  const classLabel = getOfficialClassLabel(params.schoolType, g);
  const acc = Math.min(100, Math.round((params.correctCount / Math.max(1, params.totalQuestions)) * 100));

  // Always update local cache too
  const store = readLocalStore();
  const list = Array.isArray(store[classKey]) ? [...store[classKey]] : [];
  const idx = list.findIndex((e) => e.name.trim().toLowerCase() === cleanName.toLowerCase());
  const now = new Date().toISOString();

  if (idx >= 0) {
    const prev = list[idx];
    const isNewBest = params.score >= prev.bestScore;
    list[idx] = {
      ...prev,
      name: cleanName,
      bestScore: Math.max(prev.bestScore, params.score),
      totalScore: prev.totalScore + params.score,
      quizzesPlayed: prev.quizzesPlayed + 1,
      bestCorrect: Math.max(prev.bestCorrect, params.correctCount),
      accuracy: isNewBest ? acc : Math.max(prev.accuracy, acc),
      subject: isNewBest ? params.subject : prev.subject,
      updatedAt: now,
    };
  } else {
    list.push({
      name: cleanName,
      classKey,
      classLabel,
      school: params.schoolType,
      bestScore: params.score,
      totalScore: params.score,
      quizzesPlayed: 1,
      bestCorrect: params.correctCount,
      accuracy: acc,
      subject: params.subject,
      updatedAt: now,
    });
  }
  store[classKey] = list;
  try {
    localStorage.setItem(LOCAL_LB_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }

  try {
    const res = await fetch('/api/game/leaderboard/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        player_name: cleanName,
        school_type: params.schoolType,
        grade: g,
        score: params.score,
        correct_count: params.correctCount,
        total_questions: params.totalQuestions,
        subject: params.subject,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.classLeaderboard)) {
        return json as ILeaderboardPayload;
      }
    }
  } catch {
    // Fallback to local
  }

  return buildLocalPayload(store, params.schoolType, g);
}

