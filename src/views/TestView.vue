<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { testSession } from '@/stores/testSession'

const router = useRouter()
const response = ref('')
const inputError = ref('')
const responseInput = ref<HTMLInputElement | null>(null)
const feedbackPanel = ref<HTMLElement | null>(null)
const currentQuestion = testSession.currentQuestion
const hasFallbackLevels = computed(() => {
    const session = testSession.state.activeSession
    return session?.levelsUsed.some((level) => !session.config.levels.includes(level)) ?? false
})

function focusResponse(): void {
    void nextTick(() => responseInput.value?.focus())
}

function focusFeedback(): void {
    void nextTick(() => feedbackPanel.value?.focus())
}

function submitAnswer(): void {
    inputError.value = ''
    if (response.value.trim() === '') {
        inputError.value = 'Enter a romanji answer.'
        focusResponse()
        return
    }

    if (testSession.submitAnswer(response.value)) focusFeedback()
}

function continueTest(): void {
    const finished = testSession.continueTest()
    response.value = ''
    inputError.value = ''
    if (finished) {
        void router.push('/result')
    } else {
        focusResponse()
    }
}

function abandon(): void {
    testSession.abandonSession()
    void router.push('/')
}

onMounted(() => {
    if (!testSession.state.activeSession) {
        void router.replace('/')
    } else if (testSession.state.activeSession.pendingFeedback === null) {
        focusResponse()
    }
})

watch(
    () => testSession.state.activeSession?.currentIndex,
    () => {
        if (testSession.state.activeSession?.pendingFeedback === null) focusResponse()
    },
)
</script>

<template>
    <main v-if="testSession.state.activeSession && currentQuestion" class="page-shell test-page">
        <header class="test-header">
            <div>
                <p class="eyebrow">
                    JLPT
                    {{
                        testSession.state.activeSession.config.levels
                            .map((level) => `N${level}`)
                            .join(' + ')
                    }}
                    practice
                </p>
                <p class="progress-label">
                    Question {{ testSession.state.activeSession.currentIndex + 1 }} of
                    {{ testSession.state.activeSession.questions.length }}
                </p>
            </div>
            <button class="button button-quiet" type="button" @click="abandon">Abandon</button>
        </header>

        <p v-if="hasFallbackLevels" class="message message-info">
            This test includes adjacent JLPT levels because the selected levels did not have enough
            words.
        </p>

        <section class="question-card" aria-labelledby="question-word">
            <p class="question-index">
                {{ testSession.state.activeSession.currentIndex + 1 }} /
                {{ testSession.state.activeSession.questions.length }}
            </p>
            <h1 id="question-word" class="japanese-word">{{ currentQuestion.word }}</h1>
            <p v-if="currentQuestion.furigana" class="furigana">
                {{ currentQuestion.furigana }}
            </p>

            <form
                v-if="!testSession.state.activeSession.pendingFeedback"
                class="answer-form"
                @submit.prevent="submitAnswer"
            >
                <label class="field" for="romanji-answer">
                    <span>Your romanji answer</span>
                    <input
                        id="romanji-answer"
                        ref="responseInput"
                        v-model="response"
                        type="text"
                        autocomplete="off"
                        autocapitalize="none"
                        spellcheck="false"
                        :aria-invalid="Boolean(inputError)"
                    />
                </label>
                <p v-if="inputError" class="message message-error" role="alert">{{ inputError }}</p>
                <button class="button button-primary button-wide" type="submit">
                    Check answer
                </button>
            </form>

            <section
                v-else
                ref="feedbackPanel"
                class="feedback"
                tabindex="-1"
                :class="{
                    'feedback-correct': testSession.state.activeSession.pendingFeedback.isCorrect,
                }"
                role="status"
                @keydown.enter.prevent="continueTest"
            >
                <p class="feedback-title">
                    {{
                        testSession.state.activeSession.pendingFeedback.isCorrect
                            ? 'Correct!'
                            : 'Not quite'
                    }}
                </p>
                <p>
                    Your answer:
                    <strong>{{ testSession.state.activeSession.pendingFeedback.response }}</strong>
                </p>
                <p>
                    Meaning:
                    <strong>{{ currentQuestion.meaning }}</strong>
                </p>
                <p v-if="!testSession.state.activeSession.pendingFeedback.isCorrect">
                    Correct romanji:
                    <strong>{{ testSession.state.activeSession.pendingFeedback.expected }}</strong>
                </p>
                <button
                    class="button button-primary button-wide"
                    type="button"
                    @click="continueTest"
                >
                    Continue
                </button>
            </section>
        </section>
    </main>
</template>
