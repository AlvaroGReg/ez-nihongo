<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { t } from '@/i18n'
import { testSession } from '@/stores/testSession'

const router = useRouter()
const result = computed(() => testSession.state.result)
const mistakes = computed(() => {
    if (!result.value) return []
    return result.value.answers
        .filter((answer) => !answer.isCorrect)
        .map((answer) => ({
            ...answer,
            question: result.value?.questions[answer.questionIndex],
        }))
})

onMounted(() => {
    if (!result.value) void router.replace('/')
})

function startAnotherTest(): void {
    testSession.state.result = null
    void router.push('/')
}
</script>

<template>
    <main v-if="result" class="page-shell result-page">
        <section class="result-card" aria-labelledby="result-title">
            <p class="eyebrow">{{ t('testComplete') }}</p>
            <h1 id="result-title">{{ t('yourResult') }}</h1>
            <div class="score" :aria-label="t('testScore')">
                <strong>{{ result.score }}/{{ result.questions.length }}</strong>
                <span>{{ result.percentage }}%</span>
            </div>

            <p v-if="mistakes.length === 0" class="message message-success">
                {{ t('perfectScore') }}
            </p>
            <section v-else class="mistakes" aria-labelledby="mistakes-title">
                <h2 id="mistakes-title">{{ t('reviewMistakes') }}</h2>
                <ul class="mistake-list">
                    <li v-for="mistake in mistakes" :key="mistake.questionIndex">
                        <strong>{{ mistake.question?.word }}</strong>
                        <span v-if="mistake.question?.furigana">{{
                            mistake.question.furigana
                        }}</span>
                        <span>{{ t('yourAnswer') }}: {{ mistake.response || t('noAnswer') }}</span>
                        <span>{{ t('correctRomanji') }}: {{ mistake.expected }}</span>
                    </li>
                </ul>
            </section>

            <button
                class="button button-primary button-wide"
                type="button"
                @click="startAnotherTest"
            >
                {{ t('startAnotherTest') }}
            </button>
        </section>
    </main>
</template>
