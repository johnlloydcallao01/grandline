// Shared normalization for grade scales used by the admin CRUD route and the
// instructor grade-setup view. Both routes own their authentication, scoping,
// and response envelope; this module owns the per-grade normalization so the
// two scopes stay in lockstep (see docs/fetching-solution.md).

export interface NormalizedGrade {
  id?: string;
  label: string;
  minScore: number;
  maxScore: number;
  gpaValue: number | null;
  description: string | null;
}

export function normalizeGrade(grade: any): NormalizedGrade {
  return {
    id: grade.id != null ? String(grade.id) : undefined,
    label: grade.label || 'Grade',
    minScore: Number(grade.minScore ?? 0),
    maxScore: Number(grade.maxScore ?? 100),
    gpaValue: grade.gpaValue != null ? Number(grade.gpaValue) : null,
    description: grade.description || null,
  }
}

export function scaleTitle(scale: any): string {
  return scale.title || `Grade Scale #${scale.id}`
}

export function normalizeScaleGrades(grades: any[] | undefined): NormalizedGrade[] {
  return (grades || [])
    .map(normalizeGrade)
    .sort((a, b) => a.minScore - b.minScore)
}