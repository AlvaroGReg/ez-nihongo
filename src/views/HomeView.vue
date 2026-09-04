<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { t } from '@/i18n'
import { getOnboardingProfile } from '@/services/onboarding'
import { testSession } from '@/stores/testSession'
import type { JlptLevel } from '@/types/domain'

const router = useRouter()
const selectedLevels = ref<JlptLevel[]>([5])
const questionCount = ref(10)
const validationError = ref('')

const levels = [
    { value: 5 as JlptLevel, label: 'N5' },
    { value: 4 as JlptLevel, label: 'N4' },
    { value: 3 as JlptLevel, label: 'N3' },
    { value: 2 as JlptLevel, label: 'N2' },
    { value: 1 as JlptLevel, label: 'N1' },
]
const hasApiError = computed(() => testSession.state.error !== null)
const hasStudyPlan = computed(() => getOnboardingProfile() !== null)

async function startTest(): Promise<void> {
    validationError.value = ''
    testSession.clearError()

    if (selectedLevels.value.length === 0) {
        validationError.value = 'chooseLevelError'
        return
    }

    if (questionCount.value < 10 || questionCount.value > 100) {
        validationError.value = 'questionCountError'
        return
    }

    if (
        await testSession.startTest({
            levels: [...selectedLevels.value],
            questionCount: questionCount.value,
        })
    ) {
        await router.push('/test')
    }
}

async function retry(): Promise<void> {
    await startTest()
}

function backToSetup(): void {
    testSession.clearError()
}
</script>

<template>
    <main class="page-shell setup-page">
        <section class="hero-card" aria-labelledby="app-title">
            <p class="eyebrow">{{ t('quickPracticeEyebrow') }}</p>
            <h1 id="app-title">{{ t('appTitle') }}</h1>
            <p class="hero-copy">{{ t('quickPracticeDescription') }}</p>

            <form class="setup-form" @submit.prevent="startTest">
                <div class="form-grid">
                    <fieldset class="field level-fieldset">
                        <legend>{{ t('jlptLevels') }}</legend>
                        <div class="level-options">
                            <label v-for="level in levels" :key="level.value" class="check-option">
                                <input
                                    v-model="selectedLevels"
                                    type="checkbox"
                                    :value="level.value"
                                />
                                <span>{{ level.label }}</span>
                            </label>
                        </div>
                    </fieldset>

                    <label class="field">
                        <span class="range-label">
                            <span>{{ t('numberOfQuestions') }}</span>
                            <output>{{ questionCount }}</output>
                        </span>
                        <input
                            v-model.number="questionCount"
                            class="range-input"
                            type="range"
                            min="10"
                            max="100"
                            step="10"
                            :aria-label="t('numberOfQuestions')"
                        />
                        <span class="range-limits" aria-hidden="true">
                            <span>10</span>
                            <span>100</span>
                        </span>
                    </label>
                </div>

                <p v-if="validationError" class="message message-error" role="alert">
                    {{ t(validationError) }}
                </p>
                <div v-if="hasApiError" class="error-panel" role="alert">
                    <p class="message message-error">{{ t(testSession.state.error ?? '') }}</p>
                    <div class="button-row">
                        <button class="button button-secondary" type="button" @click="retry">
                            {{ t('retry') }}
                        </button>
                        <button class="button button-quiet" type="button" @click="backToSetup">
                            {{ t('backToSetup') }}
                        </button>
                    </div>
                </div>

                <button
                    class="button button-primary button-wide"
                    type="submit"
                    :disabled="testSession.state.isLoading"
                >
                    {{ testSession.state.isLoading ? t('loadingVocabulary') : t('startTest') }}
                </button>
            </form>

            <aside class="plan-callout" aria-labelledby="plan-title">
                <div>
                    <p class="eyebrow">{{ t('studyPlanEyebrow') }}</p>
                    <h2 id="plan-title">{{ t('studyPlanTitle') }}</h2>
                    <p>{{ t('studyPlanDescription') }}</p>
                </div>
                <RouterLink class="button button-secondary" :to="hasStudyPlan ? '/dashboard' : '/onboarding'">
                    {{ hasStudyPlan ? t('viewStudyPlan') : t('createStudyPlan') }}
                </RouterLink>
            </aside>
        </section>
    </main>
</template>
