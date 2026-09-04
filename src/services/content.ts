import type { ContentItem, ExerciseDefinition, Locale, VocabularyWord } from '@/types/domain'

/**
 * Creates an identity for external vocabulary that does not expose one.
 * Meaning and pagination are intentionally excluded from the key.
 */
export function createVocabularyContentId(word: string, furigana: string): string {
    return `vocabulary:${encodeURIComponent(word.normalize('NFC'))}:${encodeURIComponent(
        furigana.normalize('NFC'),
    )}`
}

export function toVocabularyContentItem(word: VocabularyWord): ContentItem {
    return {
        id: word.contentId ?? createVocabularyContentId(word.word, word.furigana),
        type: 'vocabulary',
        level: word.level,
        localized: {
            en: { en: word.meaning },
            es: undefined,
        },
    }
}

export function createReadingExercise(
    word: VocabularyWord,
    locale: Locale = 'en',
): ExerciseDefinition {
    const contentId = word.contentId ?? createVocabularyContentId(word.word, word.furigana)
    return {
        id: `${contentId}:reading`,
        contentId,
        type: 'reading',
        prompt: word.word,
        locale,
        acceptedAnswers: [word.romaji],
        premium: false,
    }
}
