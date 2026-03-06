import { cleanExpiredSessions } from '../utils/session-manager';

export default defineBackground(() => {
  // Clean expired sessions every minute
  browser.alarms.create('cleanSessions', { periodInMinutes: 1 });
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanSessions') {
      cleanExpiredSessions();
    }
  });
});
