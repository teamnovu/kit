/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */

import { defineConfig } from 'vite';
import { SearchPlugin } from 'vitepress-plugin-search';
import path from 'path';

// default options
const searchPluginOptions = {
  previewLength: 62,
  buttonLabel: 'Search',
  placeholder: 'Search docs',
};

export default defineConfig({
  plugins: [SearchPlugin(searchPluginOptions)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
