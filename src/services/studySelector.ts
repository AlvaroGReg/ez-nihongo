import type { CatalogUnit, ExerciseDefinition, ProgressRecord, StudyMode } from '@/types/domain'

export function selectExercises(
    exercises: ExerciseDefinition[],
    mode: StudyMode,
    progress: Record<string, ProgressRecord>,
    limit = mode === 'quick' ? 5 : exercises.length,
): ExerciseDefinition[] {
    const eligible = exercises.filter((exercise) => {
        const record = progress[exercise.contentId]
        if (mode === 'new') return !record || record.state === 'new'
        if (mode === 'review') return record?.state === 'learning' || record?.state === 'learned'
        if (mode === 'mistakes') return Boolean(record?.lastMistakeAt)
        return true
    })
    return eligible.slice(0, Math.max(0, limit))
}

export function nextUnit(units: CatalogUnit[], progress: Record<string, ProgressRecord>): CatalogUnit | null {
    return units.find((unit) => unit.contentIds.some((contentId) => !progress[contentId] || progress[contentId]?.state === 'new')) ?? null
}
