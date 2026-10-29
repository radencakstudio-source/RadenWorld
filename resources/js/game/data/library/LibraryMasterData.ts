/**
 * ============================================================================
 * RADENWORLD LIBRARY MASTER DATA & CURRICULUM REGISTRY
 * Total 240 Topik Ensiklopedia Kurikulum Nasional Terpadu (SD 1-6, SMP 7-9, SMA 10-12)
 * ============================================================================
 */

import { ILibraryTopicItem, SD_LIBRARY_DATA } from './SdLibraryData';
import { SMP_LIBRARY_DATA } from './SmpLibraryData';
import { SMA_LIBRARY_DATA } from './SmaLibraryData';

export type { ILibraryTopicItem };

export type SchoolType = 'sd' | 'smp' | 'sma';

export type LibraryCategory =
  | 'Semua'
  | 'Matematika'
  | 'IPA / Sains'
  | 'Bahasa Indonesia'
  | 'Bahasa Inggris'
  | 'IPS / Sosial'
  | 'Pancasila & PKn'
  | 'Informatika & Seni';

export interface ILibraryGradeInfo {
  key: string;
  label: string;
  numericGrade: number;
  schoolType: SchoolType;
}

export const LIBRARY_GRADES: Record<SchoolType, ILibraryGradeInfo[]> = {
  sd: [
    { key: 'sd-1', label: 'Kelas 1 SD', numericGrade: 1, schoolType: 'sd' },
    { key: 'sd-2', label: 'Kelas 2 SD', numericGrade: 2, schoolType: 'sd' },
    { key: 'sd-3', label: 'Kelas 3 SD', numericGrade: 3, schoolType: 'sd' },
    { key: 'sd-4', label: 'Kelas 4 SD', numericGrade: 4, schoolType: 'sd' },
    { key: 'sd-5', label: 'Kelas 5 SD', numericGrade: 5, schoolType: 'sd' },
    { key: 'sd-6', label: 'Kelas 6 SD', numericGrade: 6, schoolType: 'sd' },
  ],
  smp: [
    { key: 'smp-7', label: 'Kelas 7 SMP', numericGrade: 7, schoolType: 'smp' },
    { key: 'smp-8', label: 'Kelas 8 SMP', numericGrade: 8, schoolType: 'smp' },
    { key: 'smp-9', label: 'Kelas 9 SMP', numericGrade: 9, schoolType: 'smp' },
  ],
  sma: [
    { key: 'sma-10', label: 'Kelas 10 SMA', numericGrade: 10, schoolType: 'sma' },
    { key: 'sma-11', label: 'Kelas 11 SMA', numericGrade: 11, schoolType: 'sma' },
    { key: 'sma-12', label: 'Kelas 12 SMA', numericGrade: 12, schoolType: 'sma' },
  ],
};

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  'Semua',
  'Matematika',
  'IPA / Sains',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'IPS / Sosial',
  'Pancasila & PKn',
  'Informatika & Seni',
];

/** Gabungan 240 Topik Lengkap Seluruh Jenjang */
export const ALL_LIBRARY_TOPICS: ILibraryTopicItem[] = [
  ...SD_LIBRARY_DATA,
  ...SMP_LIBRARY_DATA,
  ...SMA_LIBRARY_DATA,
];

/**
 * Filter materi perpustakaan secara cepat dan responsif
 */
export function filterLibraryTopics(params: {
  schoolType?: SchoolType;
  gradeKey?: string;
  category?: LibraryCategory;
  searchQuery?: string;
}): ILibraryTopicItem[] {
  const { schoolType, gradeKey, category, searchQuery } = params;
  const q = searchQuery?.trim().toLowerCase();

  return ALL_LIBRARY_TOPICS.filter((item) => {
    if (schoolType && item.schoolType !== schoolType) return false;
    if (gradeKey && item.gradeKey !== gradeKey) return false;
    if (category && category !== 'Semua' && item.subjectCategory !== category) return false;

    if (q) {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchSubject = item.subjectName.toLowerCase().includes(q);
      const matchPoints = item.points.some((p) => p.toLowerCase().includes(q));
      const matchBadge = item.badge.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchSubject && !matchPoints && !matchBadge) {
        return false;
      }
    }

    return true;
  });
}
