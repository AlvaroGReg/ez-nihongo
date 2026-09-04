import { computed, reactive, type ComputedRef } from 'vue'

import { VocabularyApiError, vocabularyApiProvider } from '@/services/api'
import { createReadingExercise, createVocabularyContentId } from '@/services/content'
import type { ContentProvider, LoadQuestions } from '@/services/contentProvider'
import { isRomajiCorrect } from '@/services/romaji'
import {
    appendHistory,
    clearActiveSession,
    loadActiveSession,
    saveActiveSession,
} from '@/services/storage'
import type {
    TestAnswer,
    AttemptEvent,
    TestConfig,
    TestResult,
    TestSession,
    VocabularyWord,
} from '@/types/domain'

export interface TestSessionStore {
    state: {
        activeSession: TestSession | null
        result: TestResult | null
        isLoading: boolean
        error: string | null
        needsResume: boolean
    }
    currentQuestion: ComputedRef<VocabularyWord | null>
    startTest: (config: TestConfig) => Promise<boolean>
    submitAnswer: (response: string) => boolean
    continueTest: () => boolean
    restoreSession: () => void
    resumeSession: () => void
    abandonSession: () => void
    clearError: () => void
}

function createResult(session: TestSession): TestResult {
    const score = session.answers.filter((answer) => answer.isCorrect).length
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        completedAt: new Date().toISOString(),
        config: session.config,
        questions: session.questions,
        answers: session.answers,
        score,
        percentage: Math.round((score / session.questions.length) * 100),
        levelsUsed: session.levelsUsed,
        attempts: session.attempts,
    }
}

function createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createTestSessionStore(
    provider: ContentProvider | LoadQuestions = vocabularyApiProvider,
): TestSessionStore {
    const load = typeof provider === 'function' ? provider : provider.loadQuestions
    const state = reactive({
        activeSession: null as TestSession | null,
        result: null as TestResult | null,
        isLoading: false,
        error: null as string | null,
        needsResume: false,
    })

    const currentQuestion = computed(() => {
        const session = state.activeSession
        return session ? (session.questions[session.currentIndex] ?? null) : null
    })

    async function startTest(config: TestConfig): Promise<boolean> {
        state.isLoading = true
        state.error = null
        state.result = null

        try {
            const loaded = await load(config)
            const questions = loaded.questions.map((question) => ({
                ...question,
                contentId:
                    question.contentId ??
                    createVocabularyContentId(question.word, question.furigana),
            }))
            state.activeSession = {
                version: 2,
                config,
                questions,
                currentIndex: 0,
                answers: [],
                pendingFeedback: null,
                levelsUsed: loaded.levelsUsed,
                createdAt: new Date().toISOString(),
                sessionId: createId('session'),
                contentType: 'vocabulary',
                exerciseType: 'reading',
                studyMode: 'new',
                attempts: [],
            }
            state.needsResume = false
            saveActiveSession(state.activeSession)
            return true
        } catch (error) {
            state.activeSession = null
            state.error = error instanceof VocabularyApiError ? error.code : 'providerUnknownError'
            return false
        } finally {
            state.isLoading = false
        }
    }

    function submitAnswer(response: string): boolean {
        const session = state.activeSession
        const question = currentQuestion.value
        if (!session || !question || session.pendingFeedback !== null) return false

        const contentId =
            question.contentId ?? createVocabularyContentId(question.word, question.furigana)
        const exercise = createReadingExercise(question)
        const eventId = createId('event')
        session.sessionId ??= createId('session')
        const answer: TestAnswer = {
            questionIndex: session.currentIndex,
            response,
            expected: question.romaji,
            isCorrect: isRomajiCorrect(response, question.romaji, question.furigana),
            eventId,
            contentId,
            exerciseId: exercise.id,
        }
        session.answers.push(answer)
        session.pendingFeedback = answer
        const attempt: AttemptEvent = {
            eventId,
            sessionId: session.sessionId,
            contentId,
            exerciseId: exercise.id,
            response,
            correct: answer.isCorrect,
            createdAt: new Date().toISOString(),
        }
        session.attempts ??= []
        session.attempts.push(attempt)
        saveActiveSession(session)
        return true
    }

    function continueTest(): boolean {
        const session = state.activeSession
        if (!session || session.pendingFeedback === null) return false

        if (session.currentIndex === session.questions.length - 1) {
            const result = createResult(session)
            state.result = result
            state.activeSession = null
            state.needsResume = false
            clearActiveSession()
            appendHistory(result)
            return true
        }

        session.currentIndex += 1
        session.pendingFeedback = null
        saveActiveSession(session)
        return false
    }

    function restoreSession(): void {
        const saved = loadActiveSession()
        state.activeSession = saved
        state.needsResume = saved !== null
    }

    function resumeSession(): void {
        state.needsResume = false
    }

    function abandonSession(): void {
        state.activeSession = null
        state.needsResume = false
        clearActiveSession()
    }

    function clearError(): void {
        state.error = null
    }

    return {
        state,
        currentQuestion,
        startTest,
        submitAnswer,
        continueTest,
        restoreSession,
        resumeSession,
        abandonSession,
        clearError,
    }
}

export const testSession = createTestSessionStore()
