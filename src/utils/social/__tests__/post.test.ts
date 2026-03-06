import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { socialAccounts } from '../storage';

vi.mock('../bluesky', () => ({
  BlueskyClient: class {
    post = vi.fn(async () => {});
  },
}));

vi.mock('../mastodon', () => ({
  MastodonClient: class {
    post = vi.fn(async () => {});
  },
}));

vi.mock('../twitter', () => ({
  TwitterClient: class {
    post = vi.fn(async () => {});
  },
}));

describe('postToSocial', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    vi.clearAllMocks();
  });

  it('returns empty array when no accounts', async () => {
    const { postToSocial } = await import('../post');
    const results = await postToSocial('test message');
    expect(results).toEqual([]);
  });

  it('posts to enabled accounts only', async () => {
    await socialAccounts.setValue([
      { platform: 'bluesky', enabled: true, displayName: 'test', credentials: {} },
      { platform: 'mastodon', enabled: false, displayName: 'test', credentials: {} },
    ]);

    const { postToSocial } = await import('../post');
    const results = await postToSocial('test message');
    expect(results).toHaveLength(1);
    expect(results[0].platform).toBe('bluesky');
    expect(results[0].success).toBe(true);
  });

  it('posts to multiple enabled accounts', async () => {
    await socialAccounts.setValue([
      { platform: 'bluesky', enabled: true, displayName: 'test', credentials: {} },
      { platform: 'twitter', enabled: true, displayName: 'test', credentials: {} },
    ]);

    const { postToSocial } = await import('../post');
    const results = await postToSocial('test message');
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('handles individual platform failures gracefully', async () => {
    // Override bluesky mock to fail
    vi.doMock('../bluesky', () => ({
      BlueskyClient: class {
        post = vi.fn(async () => { throw new Error('Auth failed'); });
      },
    }));

    // Re-import to get the new mock
    vi.resetModules();
    // Re-mock the ones that should succeed
    vi.doMock('../mastodon', () => ({
      MastodonClient: class {
        post = vi.fn(async () => {});
      },
    }));
    vi.doMock('../twitter', () => ({
      TwitterClient: class {
        post = vi.fn(async () => {});
      },
    }));

    await socialAccounts.setValue([
      { platform: 'bluesky', enabled: true, displayName: 'test', credentials: {} },
      { platform: 'twitter', enabled: true, displayName: 'test', credentials: {} },
    ]);

    const { postToSocial } = await import('../post');
    const results = await postToSocial('test message');
    expect(results).toHaveLength(2);
    const bsky = results.find((r) => r.platform === 'bluesky')!;
    const twitter = results.find((r) => r.platform === 'twitter')!;
    expect(bsky.success).toBe(false);
    expect(bsky.error).toContain('Auth failed');
    expect(twitter.success).toBe(true);
  });
});
