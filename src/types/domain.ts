export type JlptLevel = 1 | 2 | 3 | 4 | 5

export type Locale = 'en' | 'es'

export type ContentType = 'kana' | 'kanji' | 'vocabulary' | 'grammar' | 'sentence'

export type ExerciseType = 'reading' | 'meaning' | 'writing'

export type StudyMode = 'new' | 'review' | 'mistakes' | 'quick'

export type Plan = 'demo' | 'free' | 'premium'

export type Capability = 'basic-exercises' | 'advanced-exercises' | 'unlimited-review' | 'offline'

export interface LocalizedText {
    en: string
    es?: string
}

export interface ContentItem {
    id: string
    type: ContentType
    level?: JlptLevel
    localized: Record<Locale, LocalizedText | undefined>
    relations?: string[]
}

export interface ExerciseDefinition {
    id: string
    contentId: string
    type: ExerciseType
    prompt: string
    locale: Locale
    acceptedAnswers: string[]
    premium: boolean
}

export interface AttemptEvent {
    eventId: string
    sessionId: string
    contentId: string
    exerciseId: string
    response: string
    correct: boolean
    createdAt: string
}

export interface ProgressSnapshot {
    contentId: string
    attempts: number
    correctAnswers: number
    distinctSessions: number
    state: 'new' | 'learning' | 'learned' | 'due'
    learnedAt?: string
    nextReviewAt?: string
}

export interface VocabularyWord {
    /** Stable identity supplied by a content provider; absent in 0.1 sessions. */
    contentId?: string
    word: string
    meaning: string
    furigana: string
    romaji: string
    level: JlptLevel
}

export interface TestConfig {
    levels: JlptLevel[]
    questionCount: number
}

export interface TestAnswer {
    questionIndex: number
    response: string
    expected: string
    isCorrect: boolean
    eventId?: string
    contentId?: string
    exerciseId?: string
}

export interface TestSession {
    version: 2
    config: TestConfig
    questions: VocabularyWord[]
    currentIndex: number
    answers: TestAnswer[]
    pendingFeedback: TestAnswer | null
    levelsUsed: JlptLevel[]
    createdAt: string
    sessionId?: string
    contentType?: ContentType
    exerciseType?: ExerciseType
    studyMode?: StudyMode
    attempts?: AttemptEvent[]
}

export interface TestResult {
    id: string
    completedAt: string
    config: TestConfig
    questions: VocabularyWord[]
    answers: TestAnswer[]
    score: number
    percentage: number
    levelsUsed: JlptLevel[]
    attempts?: AttemptEvent[]
}
