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

function isSession(value: unknown): value is TestSession {
    if (typeof value !== 'object' || value === null) return false
    const candidate = value as Partial<TestSession>
    const config = candidate.config as Partial<TestConfig> | undefined
    return (
        candidate.version === 2 &&
        typeof config === 'object' &&
        config !== null &&
        Array.isArray(config.levels) &&
        typeof config.questionCount === 'number' &&
        typeof candidate.currentIndex === 'number' &&
        Array.isArray(candidate.questions) &&
        Array.isArray(candidate.answers) &&
        typeof candidate.sessionId === 'string' &&
        candidate.contentType === 'vocabulary' &&
        candidate.exerciseType === 'reading' &&
        candidate.studyMode === 'new' &&
        (candidate.pendingFeedback === null || typeof candidate.pendingFeedback === 'object')
    )
}

function isResult(value: unknown): value is TestResult {
    if (typeof value !== 'object' || value === null) return false
    const candidate = value as Partial<TestResult>
    return (
        typeof candidate.id === 'string' &&
        typeof candidate.completedAt === 'string' &&
        typeof candidate.score === 'number' &&
        typeof candidate.percentage === 'number' &&
        Array.isArray(candidate.questions) &&
        Array.isArray(candidate.answers)
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
