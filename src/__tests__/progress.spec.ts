import { describe, expect, it } from 'vitest'

import { calculateStreak, reduceProgress } from '@/services/progress'
import type { AttemptEvent } from '@/types/domain'

function event(eventId: string, sessionId: string, correct: boolean, date = '2026-09-04'): AttemptEvent {
    return { eventId, sessionId, contentId: 'kana:a', exerciseId: 'exercise:a', response: 'a', correct, createdAt: `${date}T10:00:00.000Z`, occurredOnLocalDate: date }
}

describe('local progress', () => {
    it('learns content after three distinct correct sessions and ignores duplicate events', () => {
        const records = reduceProgress([event('a', 'one', true), event('a', 'one', true), event('b', 'one', true), event('c', 'two', true), event('d', 'three', true)])
        expect(records['kana:a']).toMatchObject({ attempts: 4, correctAnswers: 4, distinctSessions: 3, state: 'learned' })
    })

    it('keeps incorrect content learning and calculates consecutive local days', () => {
        const events = [event('a', 'one', false, '2026-09-02'), event('b', 'two', true, '2026-09-03'), event('c', 'three', true, '2026-09-04')]
        expect(reduceProgress(events)['kana:a']?.state).toBe('learning')
        expect(calculateStreak(events, '2026-09-04')).toBe(3)
        expect(calculateStreak(events, '2026-09-05')).toBe(0)
    })
})
