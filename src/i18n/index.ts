import { ref } from 'vue'

import { loadLocale, saveLocale } from '@/services/storage'
import type { Locale } from '@/types/domain'

const english = {
    appEyebrow: 'Japanese vocabulary practice',
    appTitle: 'EZ Nihongo',
    homeDescription:
        'Test your JLPT vocabulary by reading Japanese words and typing their romanji.',
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    jlptLevels: 'JLPT levels',
    numberOfWords: 'Number of words',
    startTest: 'Start test',
    loadingVocabulary: 'Loading vocabulary…',
    retry: 'Retry',
    backToSetup: 'Back to setup',
    savedProgress: 'Saved progress',
    resumeTest: 'Resume your test?',
    unfinishedTest:
        'You have an unfinished test. You can continue where you left off or start over.',
    resume: 'Resume',
    abandon: 'Abandon',
    practice: 'practice',
    jlptPractice: 'JLPT {levels} practice',
    question: 'Question',
    of: 'of',
    fallbackNotice:
        'This test includes adjacent JLPT levels because the selected levels did not have enough words.',
    romanjiAnswer: 'Your romanji answer',
    enterRomanji: 'Enter a romanji answer.',
    checkAnswer: 'Check answer',
    correct: 'Correct!',
    notQuite: 'Not quite',
    yourAnswer: 'Your answer',
    meaning: 'Meaning',
    correctRomanji: 'Correct romanji',
    continue: 'Continue',
    testComplete: 'Test complete',
    yourResult: 'Your result',
    testScore: 'Test score',
    perfectScore: 'Perfect score!',
    reviewMistakes: 'Review your mistakes',
    noAnswer: 'No answer',
    startAnotherTest: 'Start another test',
    chooseLevelError: 'Choose at least one JLPT level.',
    questionCountError: 'Choose between 10 and 100 words.',
    providerConnectionError: 'Could not connect to the vocabulary provider.',
    providerHttpError: 'The vocabulary provider returned an error.',
    providerResponseError: 'The vocabulary provider returned an invalid response.',
    providerPageError: 'The vocabulary provider returned an invalid page.',
    providerJsonError: 'The vocabulary provider returned invalid data.',
    providerInsufficientError: 'Not enough vocabulary is available for this test.',
    providerUnknownError: 'Could not load the test.',
    translationUnavailable: 'Translation unavailable.',
}

type TranslationKey = keyof typeof english

const spanish: Partial<Record<TranslationKey, string>> = {
    appEyebrow: 'Práctica de vocabulario japonés',
    homeDescription:
        'Pon a prueba tu vocabulario JLPT leyendo palabras japonesas y escribiendo su romanji.',
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    jlptLevels: 'Niveles JLPT',
    numberOfWords: 'Número de palabras',
    startTest: 'Empezar test',
    loadingVocabulary: 'Cargando vocabulario…',
    retry: 'Reintentar',
    backToSetup: 'Volver a la configuración',
    savedProgress: 'Progreso guardado',
    resumeTest: '¿Continuar el test?',
    unfinishedTest:
        'Tienes un test sin terminar. Puedes continuar donde lo dejaste o empezar de nuevo.',
    resume: 'Continuar',
    abandon: 'Abandonar',
    practice: 'práctica',
    jlptPractice: 'Práctica JLPT {levels}',
    question: 'Pregunta',
    of: 'de',
    fallbackNotice:
        'Este test incluye niveles JLPT adyacentes porque los niveles seleccionados no tenían suficientes palabras.',
    romanjiAnswer: 'Tu respuesta en romanji',
    enterRomanji: 'Escribe una respuesta en romanji.',
    checkAnswer: 'Comprobar respuesta',
    correct: '¡Correcto!',
    notQuite: 'No exactamente',
    yourAnswer: 'Tu respuesta',
    meaning: 'Significado',
    correctRomanji: 'Romanji correcto',
    continue: 'Continuar',
    testComplete: 'Test completado',
    yourResult: 'Tu resultado',
    testScore: 'Puntuación del test',
    perfectScore: '¡Puntuación perfecta!',
    reviewMistakes: 'Revisa tus errores',
    noAnswer: 'Sin respuesta',
    startAnotherTest: 'Empezar otro test',
    chooseLevelError: 'Elige al menos un nivel JLPT.',
    questionCountError: 'Elige entre 10 y 100 palabras.',
    providerConnectionError: 'No se ha podido conectar con el proveedor de vocabulario.',
    providerHttpError: 'El proveedor de vocabulario ha devuelto un error.',
    providerResponseError: 'El proveedor de vocabulario ha devuelto una respuesta no válida.',
    providerPageError: 'El proveedor de vocabulario ha devuelto una página no válida.',
    providerJsonError: 'El proveedor de vocabulario ha devuelto datos no válidos.',
    providerInsufficientError: 'No hay suficiente vocabulario disponible para este test.',
    providerUnknownError: 'No se ha podido cargar el test.',
    translationUnavailable: 'Traducción no disponible.',
}

export const messages: Record<Locale, Partial<Record<TranslationKey, string>>> = {
    en: english,
    es: spanish,
}

export const locale = ref<Locale>(loadLocale() ?? 'en')

function applyDocumentLocale(value: Locale): void {
    if (typeof document !== 'undefined') document.documentElement.lang = value
}

applyDocumentLocale(locale.value)

export function setLocale(value: Locale): void {
    locale.value = value
    saveLocale(value)
    applyDocumentLocale(value)
}

export function t(key: string, values: Record<string, string | number> = {}): string {
    const selected = messages[locale.value][key as TranslationKey]
    const fallback = messages.en[key as TranslationKey]
    const template = selected ?? fallback
    if (!template) {
        return locale.value === 'es'
            ? messages.es.translationUnavailable!
            : english.translationUnavailable
    }

    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        values[name] === undefined ? match : String(values[name]),
    )
}
