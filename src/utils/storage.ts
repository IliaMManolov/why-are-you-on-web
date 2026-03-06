import { storage } from 'wxt/utils/storage';

export interface Session {
  domain: string;
  reason: string;
  durationMinutes: number;
  startedAt: number;
  expiresAt: number;
}

export const blockedDomains = storage.defineItem<string[]>('sync:blockedDomains', {
  fallback: [],
});

export const activeSessions = storage.defineItem<Session[]>('local:activeSessions', {
  fallback: [],
});

export const sessionHistory = storage.defineItem<Session[]>('local:sessionHistory', {
  fallback: [],
});
