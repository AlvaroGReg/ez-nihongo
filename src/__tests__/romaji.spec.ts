import { describe, expect, it } from 'vitest'

import { isRomajiCorrect, normalizeRomaji } from '@/services/romaji'

describe('romaji normalization', () => {
    it('normalizes case, surrounding spaces and macrons', () => {
        expect(normalizeRomaji('  NENRYŌ  ')).toBe('nenryo')
        expect(isRomajiCorrect('  nenryō ', 'nenryo')).toBe(true)
    })

    it('does not invent long-vowel alternatives', () => {
        expect(isRomajiCorrect('nenryou', 'nenryō')).toBe(false)
    })

    it('normalizes an empty value without treating it as a valid answer', () => {
        expect(normalizeRomaji('   ')).toBe('')
    })
})
