import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Why Are You On?',
    description: 'Anti-procrastination extension — justify your visit before accessing blocked sites.',
    permissions: ['storage', 'alarms'],
    icons: {
      16: '/icon/icon-16.png',
      32: '/icon/icon-32.png',
      48: '/icon/icon-48.png',
      96: '/icon/icon-96.png',
      128: '/icon/icon-128.png',
    },
  },
});
