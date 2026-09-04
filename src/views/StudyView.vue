<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { locale, t } from '@/i18n'
import { localized } from '@/services/catalog'
import { getAnnotations, setFavorite, setNote } from '@/services/annotations'
import { loadShowFurigana, saveShowFurigana, saveStudySession } from '@/services/storage'
import { learning } from '@/stores/learning'

const router = useRouter()
const response = ref('')
const composing = ref(false)
const input = ref<HTMLInputElement | null>(null)
const feedback = ref<HTMLElement | null>(null)
const showFurigana = ref(loadShowFurigana())
const currentExercise = learning.currentExercise
const currentContent = computed(() => { const id = currentExercise.value?.contentId; return learning.state.catalog?.content.find((item) => item.id === id) ?? null })
const currentRecord = computed(() => currentContent.value ? learning.state.progress.records[currentContent.value.id] : undefined)
const favorite = ref(false)
const note = ref('')

watch(currentContent, (content) => {
    const annotation = content ? getAnnotations()[content.id] : undefined
    favorite.value = annotation?.favorite ?? false
    note.value = annotation?.note ?? ''
}, { immediate: true })

onMounted(async () => {
    const loaded = learning.state.catalog ? true : await learning.load()
    if (!loaded) return
    if (!learning.state.session) learning.restore()
    if (!learning.state.session) { await router.replace('/dashboard'); return }
    showFurigana.value = learning.state.session.showFurigana
    void nextTick(() => input.value?.focus())
})

function submit(): void {
    if (composing.value || !response.value.trim()) return
    if (learning.submit(response.value)) void nextTick(() => feedback.value?.focus())
}

function continueStudy(): void {
    const done = learning.continueStudy()
    response.value = ''
    if (done) void router.replace('/dashboard')
    else void nextTick(() => input.value?.focus())
}

function abandon(): void { learning.abandon(); void router.replace('/dashboard') }
function toggleFurigana(): void { showFurigana.value = !showFurigana.value; saveShowFurigana(showFurigana.value); if (learning.state.session) { learning.state.session.showFurigana = showFurigana.value; saveStudySession(learning.state.session) } }
function toggleFavorite(): void { if (currentContent.value) favorite.value = setFavorite(currentContent.value.id, !favorite.value).favorite }
function saveCurrentNote(): void { if (currentContent.value) setNote(currentContent.value.id, note.value) }
</script>

<template>
    <main v-if="learning.state.session && currentExercise" class="page-shell study-page">
        <header class="test-header">
            <div><p class="eyebrow">{{ t('routeN5') }}</p><p class="progress-label">{{ learning.state.session.currentIndex + 1 }} {{ t('of') }} {{ learning.state.session.exerciseIds.length }}</p></div>
            <button class="button button-quiet" type="button" @click="abandon">{{ t('backDashboard') }}</button>
        </header>
        <section class="question-card" aria-labelledby="study-prompt">
            <p class="question-index">{{ currentExercise.type }}</p>
            <h1 id="study-prompt" class="japanese-word">{{ currentExercise.prompt }}</h1>
            <p v-if="showFurigana && currentContent?.reading" class="furigana">{{ currentContent.reading }}</p>
            <button class="button button-quiet" type="button" @click="toggleFurigana">{{ showFurigana ? t('hideFurigana') : t('showFurigana') }}</button>
            <form v-if="!learning.state.session.pendingFeedback" class="answer-form" @submit.prevent="submit">
                <template v-if="currentExercise.options">
                    <fieldset><legend>{{ t('meaning') }}</legend><label v-for="option in currentExercise.options" :key="option.id" class="radio-option"><input v-model="response" type="radio" name="answer" :value="option.id" /><span>{{ option.label }}</span></label></fieldset>
                </template>
                <label v-else class="field" for="study-answer"><span>{{ t('romanjiAnswer') }}</span><input id="study-answer" ref="input" v-model="response" type="text" autocomplete="off" spellcheck="false" @compositionstart="composing = true" @compositionend="composing = false" /></label>
                <button class="button button-primary button-wide" type="submit">{{ t('checkAnswer') }}</button>
            </form>
            <section v-else ref="feedback" class="feedback" tabindex="-1" role="status" @keydown.enter.prevent="continueStudy">
                <p class="feedback-title">{{ learning.state.session.pendingFeedback.isCorrect ? t('correct') : t('notQuite') }}</p>
                <p>{{ t('yourAnswer') }}: <strong>{{ learning.state.session.pendingFeedback.response }}</strong></p>
                <p>{{ t('correctAnswer') }}: <strong>{{ learning.state.session.pendingFeedback.expected }}</strong></p>
                <p v-if="currentContent">{{ t('meaning') }}: <strong>{{ localized(currentContent, locale) }}</strong></p>
                <button class="button button-primary button-wide" type="button" @click="continueStudy">{{ t('continue') }}</button>
            </section>
            <div v-if="currentContent" class="annotation-box">
                <button class="button button-quiet" type="button" @click="toggleFavorite">{{ favorite ? '★' : '☆' }} {{ t('favorite') }}</button>
                <label class="field" :for="`note-${currentContent.id}`"><span>{{ t('note') }}</span><textarea :id="`note-${currentContent.id}`" v-model="note" rows="2" @change="saveCurrentNote"></textarea></label>
            </div>
            <p v-if="currentRecord" class="progress-label">{{ currentRecord.attempts }} {{ t('practice') }}</p>
        </section>
    </main>
</template>
