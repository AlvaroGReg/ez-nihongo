import type { TestResult, TestSession } from '@/types/domain'

export const ACTIVE_SESSION_KEY = 'ez-nihongo:active-session:v1'
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

function isSession(value: unknown): value is TestSession {
    if (typeof value !== 'object' || value === null) return false
    const candidate = value as Partial<TestSession>
    return (
        candidate.version === 1 &&
        typeof candidate.currentIndex === 'number' &&
        Array.isArray(candidate.questions) &&
        Array.isArray(candidate.answers) &&
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
