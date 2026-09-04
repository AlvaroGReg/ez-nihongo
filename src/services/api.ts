import type { JlptLevel, TestConfig, VocabularyWord } from '@/types/domain'

const WORDS_ENDPOINT = 'https://jlpt-vocab-api.vercel.app/api/words'

export class VocabularyApiError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'VocabularyApiError'
    }
}

interface ApiPage {
    total: number
    offset: number
    limit: number
    words: unknown[]
}

function isJlptLevel(value: unknown): value is JlptLevel {
    return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

function parseWord(value: unknown): VocabularyWord | null {
    if (typeof value !== 'object' || value === null) return null

    const candidate = value as Record<string, unknown>
    if (
        typeof candidate.word !== 'string' ||
        typeof candidate.furigana !== 'string' ||
        typeof candidate.romaji !== 'string' ||
        candidate.word.trim() === '' ||
        candidate.romaji.trim() === '' ||
        !isJlptLevel(candidate.level)
    ) {
        return null
    }

    return {
        word: candidate.word,
        furigana: candidate.furigana,
        romaji: candidate.romaji,
        level: candidate.level,
    }
}

function parsePage(value: unknown): ApiPage {
    if (typeof value !== 'object' || value === null) {
        throw new VocabularyApiError('The vocabulary API returned an invalid response.')
    }

    const candidate = value as Record<string, unknown>
    if (
        typeof candidate.total !== 'number' ||
        typeof candidate.offset !== 'number' ||
        typeof candidate.limit !== 'number' ||
        !Array.isArray(candidate.words)
    ) {
        throw new VocabularyApiError('The vocabulary API returned an invalid page.')
    }

    return {
        total: candidate.total,
        offset: candidate.offset,
        limit: candidate.limit,
        words: candidate.words,
    }
}

async function fetchPage(level: JlptLevel, offset: number, limit: number): Promise<ApiPage> {
    const url = new URL(WORDS_ENDPOINT)
    url.searchParams.set('level', String(level))
    url.searchParams.set('offset', String(offset))
    url.searchParams.set('limit', String(limit))

    let response: Response
    try {
        response = await fetch(url)
    } catch {
        throw new VocabularyApiError('Could not connect to the vocabulary API.')
    }

    if (!response.ok) {
        throw new VocabularyApiError(`The vocabulary API returned HTTP ${response.status}.`)
    }

    try {
        return parsePage(await response.json())
    } catch (error) {
        if (error instanceof VocabularyApiError) throw error
        throw new VocabularyApiError('The vocabulary API returned invalid JSON.')
    }
}

function fallbackLevels(selectedLevel: JlptLevel): JlptLevel[] {
    const levels: JlptLevel[] = [selectedLevel]
    for (let distance = 1; distance <= 4; distance += 1) {
        const easier = selectedLevel + distance
        const harder = selectedLevel - distance
        if (isJlptLevel(easier)) levels.push(easier)
        if (isJlptLevel(harder)) levels.push(harder)
    }
    return levels
}

function questionKey(word: VocabularyWord): string {
    return `${word.word}\u0000${word.furigana}`
}

async function fetchUniqueWords(
    level: JlptLevel,
    needed: number,
    seen: Set<string>,
): Promise<VocabularyWord[]> {
    const words: VocabularyWord[] = []
    let offset = 0

    while (words.length < needed) {
        const page = await fetchPage(level, offset, needed - words.length)
        const pageWords = page.words
            .map(parseWord)
            .filter((word): word is VocabularyWord => word !== null)

        for (const word of pageWords) {
            const key = questionKey(word)
            if (!seen.has(key)) {
                seen.add(key)
                words.push(word)
                if (words.length === needed) break
            }
        }

        const nextOffset = page.offset + page.words.length
        if (page.words.length === 0 || nextOffset <= offset || nextOffset >= page.total) break
        offset = nextOffset
    }

    return words
}

function shuffle<T>(values: T[]): T[] {
    const shuffled = [...values]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const otherIndex = Math.floor(Math.random() * (index + 1))
        ;[shuffled[index]!, shuffled[otherIndex]!] = [shuffled[otherIndex]!, shuffled[index]!]
    }
    return shuffled
}

export async function loadQuestions(config: TestConfig): Promise<{
    questions: VocabularyWord[]
    levelsUsed: JlptLevel[]
}> {
    const seen = new Set<string>()
    const questions: VocabularyWord[] = []
    const levelsUsed: JlptLevel[] = []

    for (const level of fallbackLevels(config.level)) {
        const remaining = config.questionCount - questions.length
        if (remaining === 0) break

        const words = await fetchUniqueWords(level, remaining, seen)
        if (words.length > 0) levelsUsed.push(level)
        questions.push(...words)
    }

    if (questions.length < config.questionCount) {
        throw new VocabularyApiError(
            `Only ${questions.length} of ${config.questionCount} questions could be loaded.`,
        )
    }

    return { questions: shuffle(questions), levelsUsed }
}

export function getFallbackLevelsForTest(level: JlptLevel): JlptLevel[] {
    return fallbackLevels(level)
}
