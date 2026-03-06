export const MIN_REASON_LENGTH = 30;
export const MAX_REASON_LENGTH = 280;
export const MIN_WORD_COUNT = 5;
export const TYPING_DELAY_MS = 5000;
export const ALLOWED_DURATIONS = [1, 5, 15, 30] as const;

export type AllowedDuration = (typeof ALLOWED_DURATIONS)[number];

export interface FormState {
  reason: string;
  duration: number | null;
  mountedAt: number;
}

export interface Requirement {
  key: string;
  label: string;
  met: boolean;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export function getRequirements(state: FormState, now: number = Date.now()): Requirement[] {
  const wordCount = countWords(state.reason);
  const elapsed = now - state.mountedAt;
  const remainingSec = Math.max(0, Math.ceil((TYPING_DELAY_MS - elapsed) / 1000));
  return [
    {
      key: 'chars',
      label: `At least ${MIN_REASON_LENGTH} characters (${state.reason.length}/${MIN_REASON_LENGTH})`,
      met: state.reason.length >= MIN_REASON_LENGTH,
    },
    {
      key: 'words',
      label: `At least ${MIN_WORD_COUNT} words (${wordCount}/${MIN_WORD_COUNT})`,
      met: wordCount >= MIN_WORD_COUNT,
    },
    {
      key: 'max',
      label: `Under ${MAX_REASON_LENGTH} characters`,
      met: state.reason.length <= MAX_REASON_LENGTH,
    },
    {
      key: 'delay',
      label: elapsed >= TYPING_DELAY_MS
        ? 'Wait period elapsed'
        : `Wait ${remainingSec}s before submitting`,
      met: elapsed >= TYPING_DELAY_MS,
    },
    {
      key: 'duration',
      label: 'Time limit selected',
      met: state.duration !== null && ALLOWED_DURATIONS.includes(state.duration as AllowedDuration),
    },
  ];
}

export function getReasonError(reason: string): string | null {
  if (reason.length < MIN_REASON_LENGTH) {
    return `Reason must be at least ${MIN_REASON_LENGTH} characters (${reason.length}/${MIN_REASON_LENGTH})`;
  }
  if (reason.length > MAX_REASON_LENGTH) {
    return `Reason must be at most ${MAX_REASON_LENGTH} characters (${reason.length}/${MAX_REASON_LENGTH})`;
  }
  return null;
}

export function isFormValid(state: FormState): boolean {
  return getRequirements(state).every((r) => r.met);
}
