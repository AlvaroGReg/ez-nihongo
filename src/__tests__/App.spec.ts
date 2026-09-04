import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
    it('renders the application shell', () => {
        const wrapper = mount(App, {
            global: {
                plugins: [router],
                stubs: { RouterView: true },
            },
        })
        expect(wrapper.find('router-view-stub').exists()).toBe(true)
    })
})
