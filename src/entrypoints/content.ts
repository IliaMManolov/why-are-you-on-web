import { isBlockedDomain } from '../utils/domain-matching';
import { hasActiveSession } from '../utils/session-manager';
import { blockedDomains } from '../utils/storage';
import { mountModal } from '../components/modal';
import '../components/modal.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    async function checkAndBlock() {
      const domains = await blockedDomains.getValue();
      const hostname = window.location.hostname;

      if (!isBlockedDomain(hostname, domains)) return;

      const active = await hasActiveSession(hostname);
      if (active) return;

      await mountModal(ctx, hostname);
    }

    await checkAndBlock();

    // Handle SPA navigations that change hostname (rare but possible)
    ctx.addEventListener(window, 'wxt:locationchange', () => {
      checkAndBlock();
    });
  },
});
