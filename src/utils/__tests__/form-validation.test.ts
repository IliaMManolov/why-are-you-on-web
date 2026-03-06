import { describe, it, expect } from 'vitest';
import { getReasonError, isFormValid, getRequirements, countWords, MIN_REASON_LENGTH, MAX_REASON_LENGTH } from '../form-validation';

describe('getReasonError', () => {
  it('returns error for MIN-1 chars', () => {
    expect(getReasonError('a'.repeat(MIN_REASON_LENGTH - 1))).not.toBeNull();
  });

  it('returns null for exactly MIN chars', () => {
    expect(getReasonError('a'.repeat(MIN_REASON_LENGTH))).toBeNull();
  });

  it('returns null for exactly MAX chars', () => {
    expect(getReasonError('a'.repeat(MAX_REASON_LENGTH))).toBeNull();
  });

  it('returns error for MAX+1 chars', () => {
    expect(getReasonError('a'.repeat(MAX_REASON_LENGTH + 1))).not.toBeNull();
  });

  it('includes current count in error', () => {
    const error = getReasonError('a'.repeat(10));
    expect(error).toContain('10');
  });
});

describe('countWords', () => {
  it('counts words separated by spaces', () => {
    expect(countWords('one two three four five')).toBe(5);
  });

  it('handles multiple spaces', () => {
    expect(countWords('one  two   three')).toBe(3);
  });

  it('handles leading/trailing whitespace', () => {
    expect(countWords('  hello world  ')).toBe(2);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('handles tabs and newlines', () => {
    expect(countWords('one\ttwo\nthree')).toBe(3);
  });
});

describe('getRequirements', () => {
  it('returns chars requirement as unmet when too short', () => {
    const reqs = getRequirements({ reason: 'short', duration: 5 });
    const chars = reqs.find((r) => r.key === 'chars')!;
    expect(chars.met).toBe(false);
  });

  it('returns chars requirement as met at MIN', () => {
    const reqs = getRequirements({ reason: 'a'.repeat(MIN_REASON_LENGTH), duration: 5 });
    const chars = reqs.find((r) => r.key === 'chars')!;
    expect(chars.met).toBe(true);
  });

  it('returns duration requirement as unmet when null', () => {
    const reqs = getRequirements({ reason: 'a'.repeat(MIN_REASON_LENGTH), duration: null });
    const dur = reqs.find((r) => r.key === 'duration')!;
    expect(dur.met).toBe(false);
  });

  it('returns words requirement as unmet when too few words', () => {
    const reqs = getRequirements({ reason: 'a'.repeat(MIN_REASON_LENGTH), duration: 5 });
    const words = reqs.find((r) => r.key === 'words')!;
    expect(words.met).toBe(false);
  });

  it('returns words requirement as met with enough words', () => {
    const reqs = getRequirements({ reason: 'one two three four five six seven', duration: 5 });
    const words = reqs.find((r) => r.key === 'words')!;
    expect(words.met).toBe(true);
  });

  it('returns all met for valid state', () => {
    const reqs = getRequirements({ reason: 'I need to check this work thread now', duration: 5 });
    expect(reqs.every((r) => r.met)).toBe(true);
  });
});

describe('isFormValid', () => {
  const validReason = 'I need to check this work thread now';

  it('returns true when reason valid and duration selected', () => {
    expect(isFormValid({ reason: validReason, duration: 5 })).toBe(true);
  });

  it('returns false when reason too short', () => {
    expect(isFormValid({ reason: 'short', duration: 5 })).toBe(false);
  });

  it('returns false when reason too long', () => {
    expect(isFormValid({ reason: 'a'.repeat(MAX_REASON_LENGTH + 1), duration: 5 })).toBe(false);
  });

  it('returns false when no duration selected', () => {
    expect(isFormValid({ reason: validReason, duration: null })).toBe(false);
  });

  it('returns false for invalid duration', () => {
    expect(isFormValid({ reason: validReason, duration: 10 })).toBe(false);
  });

  it('accepts all allowed durations', () => {
    for (const d of [1, 5, 15, 30]) {
      expect(isFormValid({ reason: validReason, duration: d })).toBe(true);
    }
  });
});
