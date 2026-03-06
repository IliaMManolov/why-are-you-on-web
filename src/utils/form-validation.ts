export const MIN_REASON_LENGTH = 30;
export const MAX_REASON_LENGTH = 280;
export const ALLOWED_DURATIONS = [1, 5, 15, 30] as const;

export type AllowedDuration = (typeof ALLOWED_DURATIONS)[number];

export interface FormState {
  reason: string;
  duration: number | null;
}

export interface Requirement {
  key: string;
  label: string;
  met: boolean;
}

export function getRequirements(state: FormState): Requirement[] {
  return [
    {
      key: 'chars',
      label: `At least ${MIN_REASON_LENGTH} characters (${state.reason.length}/${MIN_REASON_LENGTH})`,
      met: state.reason.length >= MIN_REASON_LENGTH,
    },
    {
      key: 'max',
      label: `Under ${MAX_REASON_LENGTH} characters`,
      met: state.reason.length <= MAX_REASON_LENGTH,
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
