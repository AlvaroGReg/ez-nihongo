<script setup lang="ts">
import { useRouter } from 'vue-router'

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
</script>

<template>
    <RouterView />

    <div v-if="testSession.state.needsResume" class="modal-backdrop" role="presentation">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="resume-title">
            <p class="eyebrow">Saved progress</p>
            <h2 id="resume-title">Resume your test?</h2>
            <p>You have an unfinished test. You can continue where you left off or start over.</p>
            <div class="button-row">
                <button class="button button-primary" type="button" @click="resume">Resume</button>
                <button class="button button-secondary" type="button" @click="abandon">
                    Abandon
                </button>
            </div>
        </section>
    </div>
</template>

<style scoped></style>
