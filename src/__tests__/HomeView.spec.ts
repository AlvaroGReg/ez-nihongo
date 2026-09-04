import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { setLocale } from '@/i18n'
import HomeView from '@/views/HomeView.vue'
import router from '@/router'

describe('HomeView', () => {
    it('renders the setup in the selected locale', () => {
        setLocale('es')
        const wrapper = mount(HomeView, {
            global: { plugins: [router] },
        })

        expect(wrapper.text()).toContain('Empezar test')
        expect(wrapper.text()).toContain('Niveles JLPT')
        setLocale('en')
    })

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

    it('keeps the study plan available as an optional secondary entry', () => {
        const wrapper = mount(HomeView, {
            global: { plugins: [router] },
        })

        expect(wrapper.text()).toContain('Create a study plan')
        expect(wrapper.text()).toContain('Create a plan')
        expect(wrapper.find('a[href="#/onboarding"]').exists()).toBe(true)
    })
})
