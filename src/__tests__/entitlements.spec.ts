import { describe, expect, it } from 'vitest'

import { getPlanDefinition, hasCapability } from '@/services/entitlements'

describe('local plan configuration', () => {
    it('keeps capability hints separate from exercise validation', () => {
        expect(hasCapability('demo', 'basic-exercises')).toBe(true)
        expect(hasCapability('free', 'advanced-exercises')).toBe(false)
        expect(hasCapability('premium', 'advanced-exercises')).toBe(true)
        expect(getPlanDefinition('premium').maxNewItems).toBeNull()
        expect(getPlanDefinition('free').maxReviews).toBe(50)
    })
})
