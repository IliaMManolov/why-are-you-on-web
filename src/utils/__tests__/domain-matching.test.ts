import { describe, it, expect } from 'vitest';
import { isBlockedDomain } from '../domain-matching';

describe('isBlockedDomain', () => {
  const blockedList = ['reddit.com', 'twitter.com', 'facebook.com'];

  it('matches exact domain', () => {
    expect(isBlockedDomain('reddit.com', blockedList)).toBe(true);
  });

  it('matches subdomain', () => {
    expect(isBlockedDomain('old.reddit.com', blockedList)).toBe(true);
  });

  it('matches www prefix', () => {
    expect(isBlockedDomain('www.reddit.com', blockedList)).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isBlockedDomain('Reddit.COM', blockedList)).toBe(true);
    expect(isBlockedDomain('WWW.Twitter.Com', blockedList)).toBe(true);
  });

  it('does not match unblocked domain', () => {
    expect(isBlockedDomain('google.com', blockedList)).toBe(false);
  });

  it('does not match partial domain names', () => {
    expect(isBlockedDomain('notreddit.com', blockedList)).toBe(false);
  });

  it('handles empty blocked list', () => {
    expect(isBlockedDomain('reddit.com', [])).toBe(false);
  });

  it('handles www in blocked list', () => {
    expect(isBlockedDomain('reddit.com', ['www.reddit.com'])).toBe(true);
  });
});
