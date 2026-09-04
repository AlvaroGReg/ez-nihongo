import { beforeEach, describe, expect, it } from 'vitest'

import { locale, messages, setLocale, t } from '@/i18n'
import { loadLocale, saveLocale } from '@/services/storage'
import { createTestSessionStore } from '@/stores/testSession'
import type { TestConfig, VocabularyWord } from '@/types/domain'

const question: VocabularyWord = {
    word: '猫',
    meaning: 'cat',
    furigana: 'ねこ',
    romaji: 'neko',
    level: 5,
}
const config: TestConfig = { levels: [5], questionCount: 1 }

describe('localization', () => {
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
        setLocale('en')
    })

    it('persists the selected locale and updates the document language', () => {
        setLocale('es')

        expect(locale.value).toBe('es')
        expect(loadLocale()).toBe('es')
        expect(document.documentElement.lang).toBe('es')
    })

    it('falls back to English without exposing a translation key', () => {
        const original = messages.es.providerUnknownError
        delete messages.es.providerUnknownError

        setLocale('es')
        expect(t('providerUnknownError')).toBe(messages.en.providerUnknownError)
        expect(t('missing.translation')).not.toContain('missing.translation')

        messages.es.providerUnknownError = original
    })

    it('loads a persisted locale through the storage contract', () => {
        saveLocale('es')
        expect(loadLocale()).toBe('es')
    })

    it('changes presentation without changing an active session', async () => {
        const store = createTestSessionStore({
            loadQuestions: async () => ({ questions: [question], levelsUsed: [5] }),
        })
        await store.startTest(config)
        const sessionBeforeLocaleChange = JSON.parse(
            JSON.stringify(store.state.activeSession),
        ) as typeof store.state.activeSession

        setLocale('es')

        expect(store.state.activeSession).toEqual(sessionBeforeLocaleChange)
    })
})
