export type JlptLevel = 1 | 2 | 3 | 4 | 5

export interface VocabularyWord {
    word: string
    meaning: string
    furigana: string
    romaji: string
    level: JlptLevel
}

export interface TestConfig {
    level: JlptLevel
    questionCount: number
}

export interface TestAnswer {
    questionIndex: number
    response: string
    expected: string
    isCorrect: boolean
}

export interface TestSession {
    version: 1
    config: TestConfig
    questions: VocabularyWord[]
    currentIndex: number
    answers: TestAnswer[]
    pendingFeedback: TestAnswer | null
    levelsUsed: JlptLevel[]
    createdAt: string
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
}
