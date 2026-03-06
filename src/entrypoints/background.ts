import { cleanExpiredSessions } from '../utils/session-manager';
import { postToSocial } from '../utils/social/post';

export default defineBackground(() => {
  // Clean expired sessions every minute
  browser.alarms.create('cleanSessions', { periodInMinutes: 1 });
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanSessions') {
      cleanExpiredSessions();
    }
  });

  // Handle social media posting from content script
  browser.runtime.onMessage.addListener((message) => {
    if (message?.type === 'POST_TO_SOCIAL' && typeof message.text === 'string') {
      // Fire-and-forget — log failures but don't block
      postToSocial(message.text).catch((err) => {
        console.error('[WAYRO] Social post failed:', err);
      });
    }
  });
});
