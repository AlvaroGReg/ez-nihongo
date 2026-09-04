import type { Capability, Plan } from '@/types/domain'

export interface PlanDefinition {
    plan: Plan
    capabilities: readonly Capability[]
    maxNewItems: number | null
    maxReviews: number | null
}

/** Local UX configuration only. It is not an authorization boundary. */
export const PLAN_DEFINITIONS: Record<Plan, PlanDefinition> = {
    demo: {
        plan: 'demo',
        capabilities: ['basic-exercises'],
        maxNewItems: 10,
        maxReviews: 10,
    },
    free: {
        plan: 'free',
        capabilities: ['basic-exercises'],
        maxNewItems: 20,
        maxReviews: 50,
    },
    premium: {
        plan: 'premium',
        capabilities: ['basic-exercises', 'advanced-exercises', 'unlimited-review', 'offline'],
        maxNewItems: null,
        maxReviews: null,
    },
}

export function getPlanDefinition(plan: Plan): PlanDefinition {
    return PLAN_DEFINITIONS[plan]
}

export function hasCapability(plan: Plan, capability: Capability): boolean {
    return getPlanDefinition(plan).capabilities.includes(capability)
}
