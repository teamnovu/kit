import type { ConfigEnv } from 'vite'
import { type DefaultTheme, defineConfig, type UserConfig } from 'vitepress'
import {
  buildExtendsChain, buildPackageLinks, collectPackageNamesWithConfig, loadPackageConfigurations,
} from './utils'

const packages = await collectPackageNamesWithConfig()

const baseConfig: UserConfig<DefaultTheme.Config> = {
  title: '@teamnovu/kit-*',
  description:
    'One place for all the shared JS/Web development goods of jkweb.',
  rewrites: {
    'docs/(.*)': '(.*)',
    'packages/:pkg/docs/(.*)': 'packages/:pkg/(.*)',
  },
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/icon.png',
      },
    ],
  ],
  themeConfig: {
    // https://vitepress.vuejs.org/reference/default-theme-config
    nav: [
      /*
        { text: 'Home', link: '/' },
        { text: 'Guides', link: '/guides' },
      */
    ],

    editLink: {
      pattern: ({ relativePath }): string => {
        if (relativePath.startsWith('packages/')) {
          const [, pkgName, ...files] = relativePath.split('/')
          return `https://github.com/teamnovu/kit/tree/main/packages/${pkgName}/docs/${files.join('/')}`
        }
        return `https://github.com/teamnovu/kit/tree/main/docs/${relativePath}`
      },
    },

    sidebar: [
      {
        text: 'General',
        items: [
          {
            text: 'Contribute',
            link: '/contribute',
          },
          {
            text: 'Guidelines',
            link: '/guidelines',
          },
          {
            text: 'Tried and Tested',
            link: '/tried',
          },
        ],
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/teamnovu/kit',
      },
    ],
  },
}

// https://vitepress.vuejs.org/reference/site-config
export default async (configEnv: ConfigEnv) => {
  const links = await buildPackageLinks()
  const linkConfig = {
    themeConfig: {
      sidebar: links,
    },
  }

  const packageConfigs = await loadPackageConfigurations(configEnv, packages)
  const chainedConfig = await buildExtendsChain(baseConfig, linkConfig, ...packageConfigs)
  return defineConfig(chainedConfig ?? baseConfig)
}
