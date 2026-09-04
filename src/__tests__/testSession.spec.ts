import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ACTIVE_SESSION_KEY, HISTORY_KEY } from '@/services/storage'
import { createTestSessionStore } from '@/stores/testSession'
import type { TestConfig, VocabularyWord } from '@/types/domain'

const questions: VocabularyWord[] = [
    { word: '猫', furigana: 'ねこ', romaji: 'neko', level: 5 },
    { word: '犬', furigana: 'いぬ', romaji: 'inu', level: 5 },
]
const config: TestConfig = { level: 5, questionCount: 2 }

type LoadQuestions = (config: TestConfig) => Promise<{
    questions: VocabularyWord[]
    levelsUsed: TestConfig['level'][]
}>

describe('test session store', () => {
    beforeEach(() => {
        const values = new Map<string, string>()
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: {
                clear: () => values.clear(),
                getItem: (key: string) => values.get(key) ?? null,
                removeItem: (key: string) => values.delete(key),
                setItem: (key: string, value: string) => values.set(key, value),
            },
        })
        window.localStorage.clear()
        vi.restoreAllMocks()
    })

    it('persists answers and resumes a saved session', async () => {
        const load = vi.fn<LoadQuestions>().mockResolvedValue({ questions, levelsUsed: [5] })
        const firstStore = createTestSessionStore(load)
        await firstStore.startTest(config)
        firstStore.submitAnswer('neko')

        const secondStore = createTestSessionStore(load)
        secondStore.restoreSession()

        expect(secondStore.state.activeSession?.answers[0]?.isCorrect).toBe(true)
        expect(secondStore.state.activeSession?.pendingFeedback).not.toBeNull()
        expect(secondStore.state.needsResume).toBe(true)
    })

    it('abandons without creating a partial history entry', async () => {
        const store = createTestSessionStore(
            vi.fn<LoadQuestions>().mockResolvedValue({ questions, levelsUsed: [5] }),
        )
        await store.startTest(config)
        store.abandonSession()

        expect(window.localStorage.getItem(ACTIVE_SESSION_KEY)).toBeNull()
        expect(window.localStorage.getItem(HISTORY_KEY)).toBeNull()
    })

    it('creates a result and history entry after the final confirmation', async () => {
        const store = createTestSessionStore(
            vi.fn<LoadQuestions>().mockResolvedValue({ questions, levelsUsed: [5] }),
        )
        await store.startTest(config)
        store.submitAnswer('neko')
        expect(store.continueTest()).toBe(false)
        store.submitAnswer('wrong')
        expect(store.continueTest()).toBe(true)

        expect(store.state.activeSession).toBeNull()
        expect(store.state.result?.score).toBe(1)
        expect(JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? '[]')).toHaveLength(1)
    })
})
