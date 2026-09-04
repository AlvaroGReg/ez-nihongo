import { describe, expect, it } from 'vitest'

import { isRomajiCorrect, normalizeRomaji } from '@/services/romaji'

describe('romaji normalization', () => {
    it('normalizes case, surrounding spaces and Unicode composition', () => {
        expect(normalizeRomaji('  NENRYŌ  ')).toBe('nenryō')
        expect(normalizeRomaji('nenryo\u0304')).toBe('nenryō')
    })

    it('accepts the agreed keyboard aliases for long vowels', () => {
        expect(isRomajiCorrect('kaa', 'kā', 'かあ')).toBe(true)
        expect(isRomajiCorrect('kii', 'kī', 'きい')).toBe(true)
        expect(isRomajiCorrect('kuu', 'kū', 'くう')).toBe(true)
        expect(isRomajiCorrect('kee', 'kē', 'けえ')).toBe(true)
        expect(isRomajiCorrect('doukan', 'dōkan', 'どうかん')).toBe(true)
        expect(isRomajiCorrect('dookan', 'dōkan', 'どうかん')).toBe(true)
    })

    it('keeps ei spelling distinct from ee and macron e', () => {
        expect(isRomajiCorrect('sensei', 'sensei', 'せんせい')).toBe(true)
        expect(isRomajiCorrect('sensee', 'sensei', 'せんせい')).toBe(false)
        expect(isRomajiCorrect('sēnsei', 'sensei', 'せんせい')).toBe(false)
    })

    it('does not accept short vowels for long vowels', () => {
        expect(isRomajiCorrect('ka', 'kā', 'かあ')).toBe(false)
        expect(isRomajiCorrect('ko', 'dō', 'どう')).toBe(false)
    })

    it('normalizes an empty value without treating it as a valid answer', () => {
        expect(normalizeRomaji('   ')).toBe('')
    })
})
