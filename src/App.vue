<script setup lang="ts">
import { useRouter } from 'vue-router'

import { locale, setLocale, t } from '@/i18n'
import { testSession } from '@/stores/testSession'

const router = useRouter()

function resume(): void {
    testSession.resumeSession()
    void router.push('/test')
}

function abandon(): void {
    testSession.abandonSession()
    void router.push('/')
}

function changeLocale(value: string): void {
    if (value === 'en' || value === 'es') setLocale(value)
}
</script>

<template>
    <div class="language-picker app-language-picker">
        <label class="field" for="locale-select">
            <span>{{ t('language') }}</span>
            <select
                id="locale-select"
                :value="locale"
                @change="changeLocale(($event.target as HTMLSelectElement).value)"
            >
                <option value="en">{{ t('english') }}</option>
                <option value="es">{{ t('spanish') }}</option>
            </select>
        </label>
    </div>
    <RouterView />

    <div v-if="testSession.state.needsResume" class="modal-backdrop" role="presentation">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="resume-title">
            <p class="eyebrow">{{ t('savedProgress') }}</p>
            <h2 id="resume-title">{{ t('resumeTest') }}</h2>
            <p>{{ t('unfinishedTest') }}</p>
            <div class="button-row">
                <button class="button button-primary" type="button" @click="resume">
                    {{ t('resume') }}
                </button>
                <button class="button button-secondary" type="button" @click="abandon">
                    {{ t('abandon') }}
                </button>
            </div>
        </section>
    </div>
</template>

<style scoped></style>
