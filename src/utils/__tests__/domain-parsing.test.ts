import { describe, it, expect } from 'vitest';
import { parseDomainInput } from '../domain-parsing';

describe('parseDomainInput', () => {
  it('extracts domain from full URL', () => {
    expect(parseDomainInput('https://www.reddit.com/r/programming')).toBe('reddit.com');
  });

  it('handles bare domain', () => {
    expect(parseDomainInput('reddit.com')).toBe('reddit.com');
  });

  it('strips www', () => {
    expect(parseDomainInput('www.twitter.com')).toBe('twitter.com');
  });

  it('lowercases', () => {
    expect(parseDomainInput('Reddit.COM')).toBe('reddit.com');
  });

  it('handles http protocol', () => {
    expect(parseDomainInput('http://facebook.com')).toBe('facebook.com');
  });

  it('handles domain with path', () => {
    expect(parseDomainInput('reddit.com/r/all')).toBe('reddit.com');
  });

  it('returns null for empty input', () => {
    expect(parseDomainInput('')).toBeNull();
    expect(parseDomainInput('   ')).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseDomainInput('notadomain')).toBeNull();
  });

  it('trims whitespace', () => {
    expect(parseDomainInput('  reddit.com  ')).toBe('reddit.com');
  });
});
