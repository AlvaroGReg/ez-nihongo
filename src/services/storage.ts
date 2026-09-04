import type { Locale, TestConfig, TestResult, TestSession } from '@/types/domain'

export const LOCALE_KEY = 'ez-nihongo:locale:v1'
export const ACTIVE_SESSION_KEY = 'ez-nihongo:active-session:v2'
export const LEGACY_ACTIVE_SESSION_KEY = 'ez-nihongo:active-session:v1'
export const HISTORY_KEY = 'ez-nihongo:history:v1'

function read(key: string): string | null {
    try {
        return window.localStorage.getItem(key)
    } catch {
        return null
    }
}

function write(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value)
    } catch {
        // Persistence is a convenience; the in-memory session remains usable.
    }
}

function remove(key: string): void {
    try {
        window.localStorage.removeItem(key)
    } catch {
        // Ignore storage restrictions and keep the application usable.
    }
}

function isLocale(value: unknown): value is Locale {
    return value === 'en' || value === 'es'
}

export function loadLocale(): Locale | null {
    const value = read(LOCALE_KEY)
    return isLocale(value) ? value : null
}

export function saveLocale(locale: Locale): void {
    write(LOCALE_KEY, locale)
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isJlptLevel(value: unknown): boolean {
    return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

function isVocabularyWord(value: unknown): boolean {
    if (!isRecord(value)) return false
    return (
        typeof value.word === 'string' &&
        typeof value.meaning === 'string' &&
        typeof value.furigana === 'string' &&
        typeof value.romaji === 'string' &&
        isJlptLevel(value.level) &&
        (value.contentId === undefined ||
            (typeof value.contentId === 'string' && value.contentId !== ''))
    )
}

function isTestAnswer(value: unknown): boolean {
    if (!isRecord(value)) return false
    return (
        typeof value.questionIndex === 'number' &&
        Number.isInteger(value.questionIndex) &&
        value.questionIndex >= 0 &&
        typeof value.response === 'string' &&
        typeof value.expected === 'string' &&
        typeof value.isCorrect === 'boolean' &&
        (value.eventId === undefined ||
            (typeof value.eventId === 'string' && value.eventId !== '')) &&
        (value.contentId === undefined ||
            (typeof value.contentId === 'string' && value.contentId !== '')) &&
        (value.exerciseId === undefined ||
            (typeof value.exerciseId === 'string' && value.exerciseId !== ''))
    )
}

function isAttemptEvent(value: unknown): boolean {
    if (!isRecord(value)) return false
    return (
        typeof value.eventId === 'string' &&
        value.eventId !== '' &&
        typeof value.sessionId === 'string' &&
        value.sessionId !== '' &&
        typeof value.contentId === 'string' &&
        value.contentId !== '' &&
        typeof value.exerciseId === 'string' &&
        value.exerciseId !== '' &&
        typeof value.response === 'string' &&
        typeof value.correct === 'boolean' &&
        typeof value.createdAt === 'string' &&
        value.createdAt !== ''
    )
}

function isSession(value: unknown): value is TestSession {
    if (!isRecord(value)) return false
    const candidate = value as Partial<TestSession>
    const config = candidate.config as Partial<TestConfig> | undefined
    return (
        candidate.version === 2 &&
        typeof config === 'object' &&
        config !== null &&
        !Array.isArray(config) &&
        Array.isArray(config.levels) &&
        config.levels.length > 0 &&
        config.levels.every(isJlptLevel) &&
        typeof config.questionCount === 'number' &&
        Number.isInteger(config.questionCount) &&
        config.questionCount > 0 &&
        typeof candidate.currentIndex === 'number' &&
        Number.isInteger(candidate.currentIndex) &&
        candidate.currentIndex >= 0 &&
        Array.isArray(candidate.questions) &&
        candidate.questions.every(isVocabularyWord) &&
        Array.isArray(candidate.answers) &&
        candidate.answers.every(isTestAnswer) &&
        candidate.answers.length <= candidate.questions.length &&
        candidate.questions.length === config.questionCount &&
        candidate.currentIndex < candidate.questions.length &&
        typeof candidate.createdAt === 'string' &&
        candidate.createdAt !== '' &&
        typeof candidate.sessionId === 'string' &&
        candidate.sessionId !== '' &&
        candidate.contentType === 'vocabulary' &&
        candidate.exerciseType === 'reading' &&
        candidate.studyMode === 'new' &&
        (candidate.pendingFeedback === null || isTestAnswer(candidate.pendingFeedback)) &&
        (candidate.attempts === undefined ||
            (Array.isArray(candidate.attempts) && candidate.attempts.every(isAttemptEvent)))
    )
}

function isResult(value: unknown): value is TestResult {
    if (!isRecord(value)) return false
    const candidate = value as Partial<TestResult>
    const config = candidate.config as Partial<TestConfig> | undefined
    return (
        typeof config === 'object' &&
        config !== null &&
        !Array.isArray(config) &&
        Array.isArray(config.levels) &&
        config.levels.length > 0 &&
        config.levels.every(isJlptLevel) &&
        typeof config.questionCount === 'number' &&
        Number.isInteger(config.questionCount) &&
        config.questionCount > 0 &&
        typeof candidate.id === 'string' &&
        candidate.id !== '' &&
        typeof candidate.completedAt === 'string' &&
        candidate.completedAt !== '' &&
        typeof candidate.score === 'number' &&
        Number.isInteger(candidate.score) &&
        candidate.score >= 0 &&
        typeof candidate.percentage === 'number' &&
        Number.isInteger(candidate.percentage) &&
        candidate.percentage >= 0 &&
        candidate.percentage <= 100 &&
        Array.isArray(candidate.questions) &&
        candidate.questions.every(isVocabularyWord) &&
        Array.isArray(candidate.answers) &&
        candidate.answers.every(isTestAnswer) &&
        candidate.answers.length === candidate.questions.length &&
        candidate.score <= candidate.questions.length &&
        Array.isArray(candidate.levelsUsed) &&
        candidate.levelsUsed.every(isJlptLevel) &&
        (candidate.attempts === undefined ||
            (Array.isArray(candidate.attempts) && candidate.attempts.every(isAttemptEvent)))
    )
}

export function loadActiveSession(): TestSession | null {
    remove(LEGACY_ACTIVE_SESSION_KEY)
    const raw = read(ACTIVE_SESSION_KEY)
    if (!raw) return null

    try {
        const parsed: unknown = JSON.parse(raw)
        if (isSession(parsed)) return parsed
    } catch {
        // Remove malformed JSON below.
    }

    remove(ACTIVE_SESSION_KEY)
    return null
}

export function saveActiveSession(session: TestSession): void {
    write(ACTIVE_SESSION_KEY, JSON.stringify(session))
}

export function clearActiveSession(): void {
    remove(ACTIVE_SESSION_KEY)
    remove(LEGACY_ACTIVE_SESSION_KEY)
}

export function loadHistory(): TestResult[] {
    const raw = read(HISTORY_KEY)
    if (!raw) return []

    try {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.filter(isResult)
    } catch {
        // Remove malformed JSON below.
    }

    remove(HISTORY_KEY)
    return []
}

export function appendHistory(result: TestResult): void {
    write(HISTORY_KEY, JSON.stringify([...loadHistory(), result]))
}
