<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { t } from '@/i18n'
import { createOnboardingProfile, getOnboardingProfile, saveOnboardingProfile } from '@/services/onboarding'
import type { DailyMinutes, InitialLevel, LearningGoal } from '@/types/domain'

const router = useRouter()
const existing = getOnboardingProfile()
const goal = ref<LearningGoal>(existing?.goal ?? 'general')
const initialLevel = ref<InitialLevel>(existing?.initialLevel ?? 'zero')
const dailyMinutes = ref<DailyMinutes>(existing?.dailyMinutes ?? 15)
const placement = ref(existing?.placement)

function finish(): void {
    saveOnboardingProfile(createOnboardingProfile(goal.value, initialLevel.value, dailyMinutes.value, placement.value))
    void router.push('/dashboard')
}

function takePlacement(): void {
    placement.value = { version: 1, answered: 3, correct: initialLevel.value === 'zero' ? 0 : 2, recommendedEntry: initialLevel.value === 'n5' ? 'kanji' : initialLevel.value === 'kana' ? 'vocabulary' : 'kana', completedAt: new Date().toISOString() }
}
</script>

<template>
    <main class="page-shell onboarding-page">
        <section class="hero-card" aria-labelledby="welcome-title">
            <p class="eyebrow">{{ t('studyPlanEyebrow') }}</p>
            <h1 id="welcome-title">{{ t('studyPlanTitle') }}</h1>
            <p class="hero-copy">{{ t('studyPlanDescription') }}</p>
            <form class="onboarding-form" @submit.prevent="finish">
                <fieldset>
                    <legend>{{ t('goal') }}</legend>
                    <label v-for="item in [{ value: 'general', label: 'goalGeneral' }, { value: 'travel', label: 'goalTravel' }, { value: 'jlpt-n5', label: 'goalJlpt' }]" :key="item.value" class="radio-option">
                        <input v-model="goal" type="radio" name="goal" :value="item.value" />
                        <span>{{ t(item.label) }}</span>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>{{ t('initialLevel') }}</legend>
                    <label v-for="item in [{ value: 'zero', label: 'levelZero' }, { value: 'kana', label: 'levelKana' }, { value: 'n5', label: 'levelN5' }]" :key="item.value" class="radio-option">
                        <input v-model="initialLevel" type="radio" name="initial-level" :value="item.value" />
                        <span>{{ t(item.label) }}</span>
                    </label>
                </fieldset>
                <fieldset>
                    <legend>{{ t('dailyMinutes') }}</legend>
                    <div class="minute-options">
                        <label v-for="minutes in [5, 10, 15, 20]" :key="minutes" class="check-option">
                            <input v-model="dailyMinutes" type="radio" name="daily-minutes" :value="minutes" />
                            <span>{{ t('minutes', { value: minutes }) }}</span>
                        </label>
                    </div>
                </fieldset>
                <p v-if="placement" class="message message-info" role="status">
                    {{ t('placementResult', { entry: t(`${placement.recommendedEntry}Entry`) }) }}
                </p>
                <div class="button-row">
                    <button class="button button-primary" type="submit">{{ placement ? t('finishOnboarding') : t('skipPlacement') }}</button>
                    <button class="button button-secondary" type="button" @click="takePlacement">{{ t('takePlacement') }}</button>
                </div>
            </form>
            <RouterLink class="button button-quiet back-to-tests" to="/">{{ t('backToQuickTests') }}</RouterLink>
        </section>
    </main>
</template>
