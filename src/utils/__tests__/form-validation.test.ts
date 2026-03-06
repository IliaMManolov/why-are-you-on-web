import { describe, it, expect } from 'vitest';
import { getReasonError, isFormValid, MIN_REASON_LENGTH, MAX_REASON_LENGTH } from '../form-validation';

describe('getReasonError', () => {
  it('returns error for 139 chars', () => {
    expect(getReasonError('a'.repeat(139))).not.toBeNull();
  });

  it('returns null for exactly 140 chars', () => {
    expect(getReasonError('a'.repeat(140))).toBeNull();
  });

  it('returns null for exactly 280 chars', () => {
    expect(getReasonError('a'.repeat(280))).toBeNull();
  });

  it('returns error for 281 chars', () => {
    expect(getReasonError('a'.repeat(281))).not.toBeNull();
  });

  it('includes current count in error', () => {
    const error = getReasonError('a'.repeat(100));
    expect(error).toContain('100');
  });
});

describe('isFormValid', () => {
  const validReason = 'a'.repeat(MIN_REASON_LENGTH);

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
