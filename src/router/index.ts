import { createRouter, createWebHashHistory } from 'vue-router'

import OnboardingView from '@/views/OnboardingView.vue'
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import StudyView from '@/views/StudyView.vue'
import ResultView from '@/views/ResultView.vue'
import TestView from '@/views/TestView.vue'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/onboarding', name: 'onboarding', component: OnboardingView },
        { path: '/dashboard', name: 'dashboard', component: DashboardView },
        { path: '/study', name: 'study', component: StudyView },
        { path: '/test', name: 'test', component: TestView },
        { path: '/result', name: 'result', component: ResultView },
    ],
})

export default router
