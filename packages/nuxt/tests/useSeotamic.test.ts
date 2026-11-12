import { useHeadSafe, useRuntimeConfig } from '#imports'
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest'
import useSeotamic from '../src/runtime/composables/useSeotamic'

vi.mock('#imports', () => ({
  useHeadSafe: vi.fn(),
  useRuntimeConfig: vi.fn(),
}))

interface Meta {
  name?: string
  property?: string
  content?: string
}

interface Link {
  rel: string
  hreflang?: string
  href?: string
}

interface HeadInput {
  htmlAttrs: { lang?: string }
  title?: string
  meta: Meta[]
  link: Link[]
}

const page = {
  site: { locale: 'de_CH' },
  seotamic_meta: {
    title: 'Startseite | Novu',
    description: 'Die Startseite',
    robots: 'index, follow',
    canonical: 'https://novu.ch/',
  },
  seotamic_social: {
    title: 'Startseite',
    site_name: 'Novu',
    description: 'Die Startseite teilen',
    image: 'https://novu.ch/social.jpg',
  },
  alternates: [
    {
      locale: 'en',
      permalink: 'https://novu.ch/en',
    },
    {
      locale: 'fr',
      permalink: 'https://novu.ch/fr',
    },
  ],
}

const headFor = (config: Record<string, string> = {}, pageData: object = page): HeadInput => {
  vi.mocked(useRuntimeConfig).mockReturnValue({ public: config })

  useSeotamic({ value: pageData } as Parameters<typeof useSeotamic>[0])

  return vi.mocked(useHeadSafe).mock.lastCall![0] as HeadInput
}

const metaContents = (head: HeadInput) => Object.fromEntries(head.meta.map(meta => [meta.name ?? meta.property, meta.content]))

const links = (head: HeadInput) => head.link.map(({ rel, hreflang, href }) => ({
  rel,
  hreflang,
  href,
}))

describe('useSeotamic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds the head from the page data', () => {
    const head = headFor()

    expect(head.htmlAttrs).toEqual({ lang: 'de_CH' })
    expect(head.title).toBe('Startseite | Novu')
    expect(metaContents(head)).toEqual({
      'robots': 'index, follow',
      'description': 'Die Startseite',
      'og:type': 'website',
      'og:locale': 'de_CH',
      'og:title': 'Startseite',
      'og:site_name': 'Novu',
      'og:description': 'Die Startseite teilen',
      'og:url': 'https://novu.ch/',
      'og:image': 'https://novu.ch/social.jpg',
    })
  })

  it('links the canonical url and the alternates by hreflang', () => {
    const head = headFor()

    expect(links(head)).toEqual([
      {
        rel: 'canonical',
        href: 'https://novu.ch/',
      },
      {
        rel: 'alternate',
        hreflang: 'en',
        href: 'https://novu.ch/en',
      },
      {
        rel: 'alternate',
        hreflang: 'fr',
        href: 'https://novu.ch/fr',
      },
    ])
  })

  it('links only the canonical url without alternates', () => {
    const head = headFor({}, {
      ...page,
      alternates: undefined,
    })

    expect(links(head)).toEqual([
      {
        rel: 'canonical',
        href: 'https://novu.ch/',
      },
    ])
  })

  it('prefers the SEO_* runtime config over the page data', () => {
    const head = headFor({
      SEO_LOCALE: 'en_US',
      SEO_ROBOTS: 'noindex, nofollow',
      SEO_DESCRIPTION: 'Configured description',
      SEO_TYPE: 'article',
      SEO_IMAGE: 'https://novu.ch/configured.jpg',
    })

    expect(head.htmlAttrs).toEqual({ lang: 'en_US' })
    expect(metaContents(head)).toMatchObject({
      'robots': 'noindex, nofollow',
      'description': 'Configured description',
      'og:type': 'article',
      'og:locale': 'en_US',
      'og:image': 'https://novu.ch/configured.jpg',
    })
  })

  it('adds a theme color only when SEO_THEME is set', () => {
    expect(metaContents(headFor())).not.toHaveProperty('theme-color')
    expect(metaContents(headFor({ SEO_THEME: '#ff0000' }))).toHaveProperty('theme-color', '#ff0000')
  })
})
