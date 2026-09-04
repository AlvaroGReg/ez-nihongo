import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getFallbackLevelsForTest, loadQuestions, VocabularyApiError } from '@/services/api'

function page(
    level: number,
    words: Array<{ word: string; meaning: string; furigana: string; romaji: string }>,
    total = words.length,
) {
    return {
        total,
        offset: 0,
        limit: words.length,
        words: words.map((word) => ({ ...word, level })),
    }
}

type FetchMock = (input: RequestInfo | URL) => Promise<Pick<Response, 'ok' | 'json'>>

describe('vocabulary API adapter', () => {
    beforeEach(() => vi.restoreAllMocks())

    it('uses the selected level first and removes duplicate visible words', async () => {
        const fetchMock = vi.fn<FetchMock>().mockResolvedValue({
            ok: true,
            json: async () =>
                page(3, [
                    { word: '学生', meaning: 'student', furigana: 'がくせい', romaji: 'gakusei' },
                    { word: '学生', meaning: 'student', furigana: 'がくせい', romaji: 'gakusei' },
                    { word: '先生', meaning: 'teacher', furigana: 'せんせい', romaji: 'sensei' },
                ]),
        })
        vi.stubGlobal('fetch', fetchMock)

        const result = await loadQuestions({ level: 3, questionCount: 2 })

        expect(result.questions).toHaveLength(2)
        expect(result.questions[0]?.meaning).toBeTruthy()
        expect(new Set(result.questions.map((word) => `${word.word}-${word.furigana}`)).size).toBe(
            2,
        )
        expect(fetchMock.mock.calls[0]?.[0].toString()).toContain('level=3')
    })

    it('falls back from N3 to easier and then harder adjacent levels', async () => {
        const fetchMock = vi
            .fn<FetchMock>()
            .mockResolvedValueOnce({
                ok: true,
                json: async () =>
                    page(3, [{ word: 'A', meaning: 'A', furigana: 'あ', romaji: 'a' }]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () =>
                    page(4, [{ word: 'B', meaning: 'B', furigana: 'び', romaji: 'bi' }]),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () =>
                    page(2, [{ word: 'C', meaning: 'C', furigana: 'し', romaji: 'shi' }]),
            })
        vi.stubGlobal('fetch', fetchMock)

        const result = await loadQuestions({ level: 3, questionCount: 3 })

        expect(result.questions).toHaveLength(3)
        expect(result.levelsUsed).toEqual([3, 4, 2])
        expect(
            fetchMock.mock.calls.map(([url]) => new URL(url.toString()).searchParams.get('level')),
        ).toEqual(['3', '4', '2'])
    })

    it('reports an error when all levels are insufficient', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn<FetchMock>().mockResolvedValue({
                ok: true,
                json: async () => page(1, []),
            }),
        )

        await expect(loadQuestions({ level: 1, questionCount: 10 })).rejects.toBeInstanceOf(
            VocabularyApiError,
        )
    })

    it('exposes the documented fallback order', () => {
        expect(getFallbackLevelsForTest(3)).toEqual([3, 4, 2, 5, 1])
    })
})
