import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import HomeView from '@/views/HomeView.vue'
import router from '@/router'

describe('HomeView', () => {
    it('offers all JLPT levels and the supported question counts', () => {
        const wrapper = mount(HomeView, {
            global: { plugins: [router] },
        })

        expect(wrapper.findAll('select')[0]?.findAll('option')).toHaveLength(5)
        expect(wrapper.findAll('select')[1]?.findAll('option')).toHaveLength(10)
        expect(wrapper.text()).toContain('Start test')
    })
})
