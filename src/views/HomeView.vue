<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

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

async function startTest(): Promise<void> {
    validationError.value = ''
    testSession.clearError()

    if (selectedLevels.value.length === 0) {
        validationError.value = 'Choose at least one JLPT level.'
        return
    }

    if (questionCount.value < 10 || questionCount.value > 100) {
        validationError.value = 'Choose between 10 and 100 words.'
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
            <p class="eyebrow">Japanese vocabulary practice</p>
            <h1 id="app-title">EZ Nihongo</h1>
            <p class="hero-copy">
                Test your JLPT vocabulary by reading Japanese words and typing their romanji.
            </p>

            <form class="setup-form" @submit.prevent="startTest">
                <div class="form-grid">
                    <fieldset class="field level-fieldset">
                        <legend>JLPT levels</legend>
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
                            <span>Number of words</span>
                            <output>{{ questionCount }}</output>
                        </span>
                        <input
                            v-model.number="questionCount"
                            class="range-input"
                            type="range"
                            min="10"
                            max="100"
                            step="10"
                            aria-label="Number of words"
                        />
                        <span class="range-limits" aria-hidden="true">
                            <span>10</span>
                            <span>100</span>
                        </span>
                    </label>
                </div>

                <p v-if="validationError" class="message message-error" role="alert">
                    {{ validationError }}
                </p>
                <div v-if="hasApiError" class="error-panel" role="alert">
                    <p class="message message-error">{{ testSession.state.error }}</p>
                    <div class="button-row">
                        <button class="button button-secondary" type="button" @click="retry">
                            Retry
                        </button>
                        <button class="button button-quiet" type="button" @click="backToSetup">
                            Back to setup
                        </button>
                    </div>
                </div>

                <button
                    class="button button-primary button-wide"
                    type="submit"
                    :disabled="testSession.state.isLoading"
                >
                    {{ testSession.state.isLoading ? 'Loading vocabulary…' : 'Start test' }}
                </button>
            </form>
        </section>
    </main>
</template>
