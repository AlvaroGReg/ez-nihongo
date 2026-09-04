import { loadOnboarding, saveOnboarding } from '@/services/storage'
import type { DailyMinutes, InitialLevel, LearningGoal, OnboardingProfile, PlacementResult } from '@/types/domain'

export function createOnboardingProfile(goal: LearningGoal, initialLevel: InitialLevel, dailyMinutes: DailyMinutes, placement?: PlacementResult): OnboardingProfile {
    return { version: 1, goal, initialLevel, dailyMinutes, placement, completedAt: new Date().toISOString() }
}

export function saveOnboardingProfile(profile: OnboardingProfile): void {
    saveOnboarding(profile)
}

export function getOnboardingProfile(): OnboardingProfile | null {
    return loadOnboarding()
}
