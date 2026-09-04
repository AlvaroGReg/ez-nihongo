<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { locale, t } from '@/i18n'
import { getAnnotations } from '@/services/annotations'
import { getOnboardingProfile } from '@/services/onboarding'
import { calculateStreak, localDate } from '@/services/progress'
import { nextUnit } from '@/services/studySelector'
import { loadShowFurigana } from '@/services/storage'
import { learning } from '@/stores/learning'
import type { StudyMode } from '@/types/domain'

const router = useRouter()
const profile = getOnboardingProfile()
const annotations = getAnnotations()
const streak = computed(() => calculateStreak(learning.state.progress.events))
const pending = computed(() => Object.values(learning.state.progress.records).filter((record) => record.state !== 'learned').length)
const recommendedUnit = computed(() => learning.state.catalog ? nextUnit(learning.state.catalog.units, learning.state.progress.records) : null)
const today = computed(() => learning.state.progress.events.some((event) => event.occurredOnLocalDate === localDate()))
const favoriteCount = computed(() => Object.values(annotations).filter((annotation) => annotation.favorite).length)

onMounted(async () => {
    if (!profile) { await router.replace('/onboarding'); return }
    await learning.load()
})

function start(unitId: string, mode: StudyMode): void {
    if (learning.start(unitId, mode, loadShowFurigana())) void router.push('/study')
}

function editOnboarding(): void { void router.push('/onboarding') }
</script>

<template>
    <main class="page-shell dashboard-page">
        <header class="dashboard-header">
            <div>
                <p class="eyebrow">{{ t('dashboard') }}</p>
                <h1>{{ t('routeN5') }}</h1>
            </div>
            <div class="dashboard-actions">
                <RouterLink class="button button-secondary" to="/">{{ t('quickPractice') }}</RouterLink>
                <button class="button button-quiet" type="button" @click="editOnboarding">{{ t('editStudyPlan') }}</button>
            </div>
        </header>
        <p v-if="learning.state.isLoading" class="message message-info" role="status">{{ t('catalogLoading') }}</p>
        <p v-if="learning.state.error" class="message message-error" role="alert">{{ t(learning.state.error) }}</p>
        <section class="stats-grid" aria-label="Learning summary">
            <article class="stat-card"><strong>{{ streak }}</strong><span>{{ t('currentStreak') }}</span></article>
            <article class="stat-card"><strong>{{ pending }}</strong><span>{{ t('pendingContent') }}</span></article>
            <article class="stat-card"><strong>{{ favoriteCount }}</strong><span>{{ t('favorite') }}</span></article>
        </section>
        <p v-if="today" class="message message-success" role="status">{{ t('todayActivity') }}</p>
        <section v-if="learning.state.catalog" class="unit-list" aria-labelledby="units-title">
            <h2 id="units-title">{{ t('nextStep') }}</h2>
            <article v-for="unit in learning.state.catalog.units" :key="unit.id" class="unit-card">
                <div><p class="unit-order">{{ unit.order }}</p><h3>{{ unit.title[locale] ?? unit.title.en }}</h3><p>{{ unit.contentIds.length }} {{ t('pendingContent').toLocaleLowerCase() }}</p></div>
                <div class="button-row unit-actions">
                    <button class="button button-primary" type="button" @click="start(unit.id, 'new')">{{ t('newMode') }}</button>
                    <button class="button button-secondary" type="button" @click="start(unit.id, 'review')">{{ t('reviewMode') }}</button>
                    <button class="button button-secondary" type="button" @click="start(unit.id, 'mistakes')">{{ t('mistakesMode') }}</button>
                    <button class="button button-secondary" type="button" @click="start(unit.id, 'quick')">{{ t('quickMode') }}</button>
                </div>
            </article>
            <p v-if="recommendedUnit" class="message message-info">{{ t('nextStep') }}: {{ recommendedUnit.title[locale] ?? recommendedUnit.title.en }}</p>
        </section>
    </main>
</template>
