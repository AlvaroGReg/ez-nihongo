import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import HomeView from '@/views/HomeView.vue'
import router from '@/router'

describe('HomeView', () => {
    it('offers all JLPT levels and a draggable question count', () => {
        const wrapper = mount(HomeView, {
            global: { plugins: [router] },
        })

        expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(5)
        expect(wrapper.get('input[type="range"]').attributes()).toMatchObject({
            min: '10',
            max: '100',
            step: '10',
        })
        expect(wrapper.text()).toContain('Start test')
    })
})
