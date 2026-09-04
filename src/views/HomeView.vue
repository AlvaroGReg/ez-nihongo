<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { testSession } from '@/stores/testSession'
import type { JlptLevel } from '@/types/domain'

const router = useRouter()
const selectedLevel = ref<JlptLevel>(5)
const questionCount = ref(10)
const validationError = ref('')

const levels = [
    { value: 5 as JlptLevel, label: 'N5' },
    { value: 4 as JlptLevel, label: 'N4' },
    { value: 3 as JlptLevel, label: 'N3' },
    { value: 2 as JlptLevel, label: 'N2' },
    { value: 1 as JlptLevel, label: 'N1' },
]
const questionOptions = Array.from({ length: 10 }, (_, index) => (index + 1) * 10)
const hasApiError = computed(() => testSession.state.error !== null)

async function startTest(): Promise<void> {
    validationError.value = ''
    testSession.clearError()

    if (questionCount.value < 10 || questionCount.value > 100) {
        validationError.value = 'Choose between 10 and 100 words.'
        return
    }

    if (
        await testSession.startTest({
            level: selectedLevel.value,
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
                    <label class="field">
                        <span>JLPT level</span>
                        <select v-model="selectedLevel">
                            <option v-for="level in levels" :key="level.value" :value="level.value">
                                {{ level.label }}
                            </option>
                        </select>
                    </label>

                    <label class="field">
                        <span>Number of words</span>
                        <select v-model.number="questionCount">
                            <option v-for="count in questionOptions" :key="count" :value="count">
                                {{ count }}
                            </option>
                        </select>
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
