import { computed, reactive, type ComputedRef } from 'vue'

import { loadCatalog, type CatalogError } from '@/services/catalog'
import { isRomajiCorrect } from '@/services/romaji'
import { localDate, recordAttempt } from '@/services/progress'
import { selectExercises } from '@/services/studySelector'
import { clearStudySession, loadProgress, loadStudySession, saveStudySession } from '@/services/storage'
import type { AttemptEvent, CatalogArtifact, ExerciseDefinition, StudyMode, StudySession, TestAnswer } from '@/types/domain'

type CatalogLoader = () => Promise<CatalogArtifact>

export interface LearningStore {
    state: {
        catalog: CatalogArtifact | null
        session: StudySession | null
        isLoading: boolean
        error: string | null
        progress: ReturnType<typeof loadProgress>
    }
    currentExercise: ComputedRef<ExerciseDefinition | null>
    load: () => Promise<boolean>
    start: (unitId: string, mode: StudyMode, showFurigana?: boolean) => boolean
    submit: (response: string) => boolean
    continueStudy: () => boolean
    restore: () => void
    abandon: () => void
}

function id(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalize(value: string): string {
    return value.trim().toLocaleLowerCase()
}

export function createLearningStore(loader: CatalogLoader = loadCatalog): LearningStore {
    const state = reactive({ catalog: null as CatalogArtifact | null, session: null as StudySession | null, isLoading: false, error: null as string | null, progress: loadProgress() })
    const currentExercise = computed(() => {
        const session = state.session
        return session && state.catalog ? state.catalog.exercises.find((item) => item.id === session.exerciseIds[session.currentIndex]) ?? null : null
    })

    async function load(): Promise<boolean> {
        state.isLoading = true
        state.error = null
        try {
            state.catalog = await loader()
            return true
        } catch (error) {
            state.error = (error as CatalogError).code ?? 'catalogAssetError'
            return false
        } finally { state.isLoading = false }
    }

    function start(unitId: string, mode: StudyMode, showFurigana = true): boolean {
        if (!state.catalog) return false
        const unit = state.catalog.units.find((item) => item.id === unitId)
        if (!unit) { state.error = 'catalogContentError'; return false }
        const available = state.catalog.exercises.filter((exercise) => unit.exerciseIds.includes(exercise.id))
        const selected = selectExercises(available, mode, state.progress.records)
        if (selected.length === 0) { state.error = 'emptyStudyMode'; return false }
        state.error = null
        state.session = { version: 3, sessionId: id('study'), routeId: 'n5', unitId, studyMode: mode, exerciseIds: selected.map((item) => item.id), showFurigana, currentIndex: 0, answers: [], pendingFeedback: null, createdAt: new Date().toISOString() }
        saveStudySession(state.session)
        return true
    }

    function submit(response: string): boolean {
        const session = state.session
        const exercise = currentExercise.value
        if (!session || !exercise || session.pendingFeedback) return false
        const accepted = exercise.acceptedAnswers ?? []
        const selectedOption = exercise.options?.find((option) => option.id === response)
        const correct = selectedOption ? selectedOption.correct : accepted.some((answer) => normalize(answer) === normalize(response) || isRomajiCorrect(response, answer, ''))
        const expected = selectedOption ? (exercise.options?.find((option) => option.correct)?.label ?? '') : accepted[0] ?? ''
        const answer: TestAnswer = { questionIndex: session.currentIndex, response, expected, isCorrect: correct, eventId: id('event'), contentId: exercise.contentId, exerciseId: exercise.id }
        session.answers.push(answer)
        session.pendingFeedback = answer
        const event: AttemptEvent = { eventId: answer.eventId!, sessionId: session.sessionId, contentId: exercise.contentId, exerciseId: exercise.id, response, correct, createdAt: new Date().toISOString(), studyMode: session.studyMode, occurredOnLocalDate: localDate() }
        state.progress = recordAttempt(event)
        saveStudySession(session)
        return true
    }

    function continueStudy(): boolean {
        const session = state.session
        if (!session?.pendingFeedback) return false
        if (session.currentIndex >= session.exerciseIds.length - 1) { state.session = null; clearStudySession(); return true }
        session.currentIndex += 1
        session.pendingFeedback = null
        saveStudySession(session)
        return false
    }

    function restore(): void { state.session = loadStudySession() }
    function abandon(): void { state.session = null; clearStudySession() }

    return { state, currentExercise, load, start, submit, continueStudy, restore, abandon }
}

export const learning = createLearningStore()
