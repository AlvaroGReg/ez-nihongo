import type { JlptLevel, TestConfig, VocabularyWord } from '@/types/domain'

export interface LoadedQuestions {
    questions: VocabularyWord[]
    levelsUsed: JlptLevel[]
}

export interface ContentProvider {
    loadQuestions(config: TestConfig): Promise<LoadedQuestions>
}

export type LoadQuestions = (config: TestConfig) => Promise<LoadedQuestions>
