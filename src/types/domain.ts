export type JlptLevel = 1 | 2 | 3 | 4 | 5

export type Locale = 'en' | 'es'

export type ContentType = 'kana' | 'kanji' | 'vocabulary' | 'grammar' | 'sentence'

export type ExerciseType = 'recognition' | 'reading' | 'meaning' | 'writing'

export type StudyMode = 'new' | 'review' | 'mistakes' | 'quick'

export type Plan = 'demo' | 'free' | 'premium'

export type Capability = 'basic-exercises' | 'advanced-exercises' | 'unlimited-review' | 'offline'

export type LearningGoal = 'general' | 'travel' | 'jlpt-n5'
export type InitialLevel = 'zero' | 'kana' | 'n5'
export type DailyMinutes = 5 | 10 | 15 | 20
export type KanaScript = 'hiragana' | 'katakana'
export type ProgressState = 'new' | 'learning' | 'learned'

export interface LocalizedText {
    en: string
    es?: string
}

export interface ContentItem {
    id: string
    type: ContentType
    level?: JlptLevel
    localized: Record<Locale, LocalizedText | undefined>
    reading?: string
    script?: KanaScript
    relations?: Array<string | ContentRelation>
}

export interface ContentRelation {
    type: 'reading' | 'vocabulary' | 'kanji'
    contentId: string
}

export interface CatalogManifest {
    schemaVersion: 1
    catalogVersion: string
    minClientVersion: string
    locales: Locale[]
    routes: Array<{ id: 'n5'; unitIds: string[] }>
    contentFiles: string[]
    sources: Array<{ id: string; name: string; license: string; url?: string }>
}

export interface CatalogUnit {
    id: string
    routeId: 'n5'
    order: number
    title: LocalizedText
    contentIds: string[]
    exerciseIds: string[]
}

export interface CatalogArtifact {
    manifest: CatalogManifest
    units: CatalogUnit[]
    content: ContentItem[]
    exercises: ExerciseDefinition[]
}

export interface OnboardingProfile {
    version: 1
    goal: LearningGoal
    initialLevel: InitialLevel
    dailyMinutes: DailyMinutes
    placement?: PlacementResult
    completedAt: string
}

export interface PlacementResult {
    version: 1
    answered: number
    correct: number
    recommendedEntry: 'kana' | 'vocabulary' | 'kanji'
    completedAt: string
}

export interface ExerciseDefinition {
    id: string
    contentId: string
    type: ExerciseType
    prompt: string
    locale: Locale
    acceptedAnswers?: string[]
    options?: Array<{ id: string; label: string; correct: boolean }>
    showFurigana?: boolean
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
    studyMode?: StudyMode
    occurredOnLocalDate?: string
}

export interface ProgressRecord {
    contentId: string
    attempts: number
    correctAnswers: number
    distinctSessions: number
    correctSessionIds: string[]
    lastAttemptAt?: string
    lastMistakeAt?: string
    state: ProgressState
}

export interface ProgressStoreData {
    version: 1
    records: Record<string, ProgressRecord>
    events: AttemptEvent[]
}

export interface Annotation {
    contentId: string
    favorite: boolean
    note: string
    updatedAt: string
}

export interface StudySession {
    version: 3
    sessionId: string
    routeId: 'n5'
    unitId: string
    studyMode: StudyMode
    exerciseIds: string[]
    showFurigana: boolean
    currentIndex: number
    answers: TestAnswer[]
    pendingFeedback: TestAnswer | null
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

export interface UserAuthState {
    /** true = logged in, false = anonymous */
    isRegistered: boolean
    userId?: string
    email?: string | null
}
