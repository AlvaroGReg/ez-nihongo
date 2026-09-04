import { computed, reactive, type ComputedRef } from 'vue'

import { loadQuestions } from '@/services/api'
import { isRomajiCorrect } from '@/services/romaji'
import {
    appendHistory,
    clearActiveSession,
    loadActiveSession,
    saveActiveSession,
} from '@/services/storage'
import type {
    TestAnswer,
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
    }
}

export function createTestSessionStore(load = loadQuestions): TestSessionStore {
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
            state.activeSession = {
                version: 1,
                config,
                questions: loaded.questions,
                currentIndex: 0,
                answers: [],
                pendingFeedback: null,
                levelsUsed: loaded.levelsUsed,
                createdAt: new Date().toISOString(),
            }
            state.needsResume = false
            saveActiveSession(state.activeSession)
            return true
        } catch (error) {
            state.activeSession = null
            state.error = error instanceof Error ? error.message : 'Could not load the test.'
            return false
        } finally {
            state.isLoading = false
        }
    }

    function submitAnswer(response: string): boolean {
        const session = state.activeSession
        const question = currentQuestion.value
        if (!session || !question || session.pendingFeedback !== null) return false

        const answer: TestAnswer = {
            questionIndex: session.currentIndex,
            response,
            expected: question.romaji,
            isCorrect: isRomajiCorrect(response, question.romaji),
        }
        session.answers.push(answer)
        session.pendingFeedback = answer
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
