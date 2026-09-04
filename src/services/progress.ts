import { loadProgress, saveProgress } from '@/services/storage'
import type { AttemptEvent, ProgressRecord, ProgressState, ProgressStoreData } from '@/types/domain'

export const LEARNED_SESSION_COUNT = 3

function emptyRecord(contentId: string): ProgressRecord {
    return { contentId, attempts: 0, correctAnswers: 0, distinctSessions: 0, correctSessionIds: [], state: 'new' }
}

function stateFor(record: ProgressRecord): ProgressState {
    if (record.correctSessionIds.length >= LEARNED_SESSION_COUNT) return 'learned'
    return record.attempts === 0 ? 'new' : 'learning'
}

export function reduceAttempt(records: Record<string, ProgressRecord>, event: AttemptEvent): Record<string, ProgressRecord> {
    const current = records[event.contentId] ?? emptyRecord(event.contentId)
    const next: ProgressRecord = {
        ...current,
        correctSessionIds: [...current.correctSessionIds],
        attempts: current.attempts + 1,
        correctAnswers: current.correctAnswers,
        lastAttemptAt: event.createdAt,
    }
    if (event.correct) {
        next.correctAnswers += 1
        if (!next.correctSessionIds.includes(event.sessionId)) next.correctSessionIds.push(event.sessionId)
    } else {
        next.lastMistakeAt = event.createdAt
    }
    next.distinctSessions = next.correctSessionIds.length
    next.state = stateFor(next)
    return { ...records, [event.contentId]: next }
}

export function reduceProgress(events: AttemptEvent[]): Record<string, ProgressRecord> {
    const records: Record<string, ProgressRecord> = {}
    const seen = new Set<string>()
    for (const event of events) {
        if (seen.has(event.eventId)) continue
        seen.add(event.eventId)
        Object.assign(records, reduceAttempt(records, event))
    }
    return records
}

export function recordAttempt(event: AttemptEvent): ProgressStoreData {
    const stored = loadProgress()
    if (stored.events.some((item) => item.eventId === event.eventId)) return stored
    const events = [...stored.events, event]
    const next = { version: 1 as const, events, records: reduceProgress(events) }
    saveProgress(next)
    return next
}

export function activityDates(events: AttemptEvent[]): string[] {
    return [...new Set(events.map((event) => event.occurredOnLocalDate).filter((date): date is string => Boolean(date)))].sort()
}

export function calculateStreak(events: AttemptEvent[], today = localDate()): number {
    const dates = new Set(activityDates(events))
    if (!dates.has(today)) return 0
    let streak = 0
    const cursor = new Date(`${today}T12:00:00`)
    while (dates.has(toDateString(cursor))) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
    }
    return streak
}

export function localDate(value = new Date()): string {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function toDateString(value: Date): string {
    return localDate(value)
}
