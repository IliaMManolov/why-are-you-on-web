import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { hasActiveSession, createSession, cleanExpiredSessions } from '../session-manager';
import { activeSessions } from '../storage';

describe('session-manager', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('returns false when no sessions exist', async () => {
    expect(await hasActiveSession('reddit.com')).toBe(false);
  });

  it('creates a session and can find it', async () => {
    await createSession('reddit.com', 'a'.repeat(140), 5);
    expect(await hasActiveSession('reddit.com')).toBe(true);
  });

  it('normalizes domain when checking sessions', async () => {
    await createSession('reddit.com', 'a'.repeat(140), 5);
    expect(await hasActiveSession('www.Reddit.COM')).toBe(true);
  });

  it('returns false for different domain', async () => {
    await createSession('reddit.com', 'a'.repeat(140), 5);
    expect(await hasActiveSession('twitter.com')).toBe(false);
  });

  it('returns false for expired session', async () => {
    vi.useFakeTimers();
    await createSession('reddit.com', 'a'.repeat(140), 1);
    // Advance 2 minutes
    vi.advanceTimersByTime(2 * 60 * 1000);
    expect(await hasActiveSession('reddit.com')).toBe(false);
    vi.useRealTimers();
  });

  it('replaces existing session for same domain', async () => {
    await createSession('reddit.com', 'a'.repeat(140), 5);
    await createSession('reddit.com', 'b'.repeat(140), 15);
    const sessions = await activeSessions.getValue();
    expect(sessions.filter((s) => s.domain === 'reddit.com')).toHaveLength(1);
    expect(sessions[0].durationMinutes).toBe(15);
  });

  it('cleanExpiredSessions removes expired entries', async () => {
    vi.useFakeTimers();
    await createSession('reddit.com', 'a'.repeat(140), 1);
    await createSession('twitter.com', 'b'.repeat(140), 30);
    // Advance 2 minutes — reddit expired, twitter still active
    vi.advanceTimersByTime(2 * 60 * 1000);
    await cleanExpiredSessions();
    const sessions = await activeSessions.getValue();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].domain).toBe('twitter.com');
    vi.useRealTimers();
  });
});
