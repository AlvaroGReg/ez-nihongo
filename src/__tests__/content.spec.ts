import { describe, expect, it } from 'vitest'

import {
    createReadingExercise,
    createVocabularyContentId,
    toVocabularyContentItem,
} from '@/services/content'
import type { ContentType, ExerciseType, VocabularyWord } from '@/types/domain'

const supportedContentTypes = [
    'kana',
    'kanji',
    'vocabulary',
    'grammar',
    'sentence',
] satisfies ContentType[]
const supportedExerciseTypes = ['reading', 'meaning', 'writing'] satisfies ExerciseType[]

const word: VocabularyWord = {
    word: '学生',
    meaning: 'student',
    furigana: 'がくせい',
    romaji: 'gakusei',
    level: 5,
}

describe('content contracts', () => {
    it('keeps the planned content and exercise types available', () => {
        expect(supportedContentTypes).toHaveLength(5)
        expect(supportedExerciseTypes).toHaveLength(3)
    })

    it('creates an identity independent of meaning and pagination', () => {
        expect(createVocabularyContentId('学生', 'がくせい')).toBe(
            createVocabularyContentId('学生', 'がくせい'),
        )
        expect(createVocabularyContentId('学生', 'がくせい')).not.toContain('student')

        const item = toVocabularyContentItem({ ...word, meaning: 'estudiante' })
        expect(item.id).toBe(createVocabularyContentId(word.word, word.furigana))
        expect(item.type).toBe('vocabulary')
        expect(item.localized.es).toBeUndefined()
    })

    it('links a reading exercise to its content', () => {
        const exercise = createReadingExercise(word)

        expect(exercise).toMatchObject({
            contentId: createVocabularyContentId(word.word, word.furigana),
            type: 'reading',
            acceptedAnswers: ['gakusei'],
            premium: false,
        })
    })
})
