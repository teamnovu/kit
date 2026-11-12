import { mount } from '@vue/test-utils'
import * as VanillaConsent from 'vanilla-cookieconsent'
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { CookieGuard, createCookieConsent } from '../src'
import { emit, setPreferences } from './helpers'

vi.mock('vanilla-cookieconsent')

const SERVICE = 'functional.youtube'

const mountGuard = (options: Parameters<typeof mount<typeof CookieGuard>>[1] = {}) => mount(CookieGuard, {
  ...options,
  props: {
    service: SERVICE,
    ...options.props,
  },
  global: { plugins: [createCookieConsent()] },
})

describe('CookieGuard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(VanillaConsent.getConfig).mockReturnValue({
      categories: {
        functional: {
          services: {
            youtube: { label: 'YouTube' },
          },
        },
      },
    } as never)
    setPreferences({ acceptedServices: { functional: ['vimeo'] } })
  })

  it('renders nothing before it is mounted', async () => {
    const app = createSSRApp({
      render: () => h(CookieGuard, { service: SERVICE }, {
        default: () => h('p', 'video'),
        rejected: () => h('p', 'rejected'),
      }),
    })
    app.use(createCookieConsent())

    const html = await renderToString(app)

    expect(html.replace(/<!--.*?-->/g, '')).toBe('')
  })

  it('renders the default slot once the service is allowed', async () => {
    const wrapper = mountGuard({
      slots: { default: () => h('p', { class: 'video' }, 'video') },
    })
    await nextTick()

    expect(wrapper.find('.video').exists()).toBe(false)

    setPreferences({
      acceptedCategories: ['functional'],
      acceptedServices: { functional: ['youtube'] },
    })
    emit('onConsent')
    await nextTick()

    expect(wrapper.find('.video').exists()).toBe(true)
    expect(wrapper.find('.cc-rejected').exists()).toBe(false)
  })

  it('renders the rejected slot with the service name and acceptService', async () => {
    const rejected = vi.fn((props: { serviceName: string }) => h('p', { class: 'rejected' }, props.serviceName))
    const wrapper = mountGuard({
      slots: { rejected },
    })
    await nextTick()

    expect(wrapper.find('.rejected').text()).toBe('YouTube')

    const { acceptService } = rejected.mock.lastCall![0] as unknown as { acceptService: (service: string) => void }
    acceptService(SERVICE)

    expect(VanillaConsent.acceptService).toHaveBeenCalledExactlyOnceWith(['youtube', 'vimeo'], 'functional')
  })

  it('renders a fallback naming the service', async () => {
    const wrapper = mountGuard()
    await nextTick()

    expect(wrapper.find('.cc-rejected div').text()).toBe('You have not accepted the usage of YouTube.')
    expect(wrapper.find('.cc-rejected button').text()).toBe('Accept YouTube')
  })

  it('accepts the service from the fallback button', async () => {
    const wrapper = mountGuard()
    await nextTick()

    await wrapper.find('.cc-rejected button').trigger('click')

    expect(VanillaConsent.acceptService).toHaveBeenCalledExactlyOnceWith(['youtube', 'vimeo'], 'functional')
  })

  it('replaces {service} in custom fallback texts', async () => {
    const wrapper = mountGuard({
      props: {
        service: SERVICE,
        rejectText: 'Bitte {service} erlauben.',
        buttonText: '{service} laden',
      },
    })
    await nextTick()

    expect(wrapper.find('.cc-rejected div').text()).toBe('Bitte YouTube erlauben.')
    expect(wrapper.find('.cc-rejected button').text()).toBe('YouTube laden')
  })
})
