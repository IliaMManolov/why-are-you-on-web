import { activeSessions, sessionHistory, type Session } from './storage';

function normalize(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}

export async function hasActiveSession(domain: string): Promise<boolean> {
  const sessions = await activeSessions.getValue();
  const now = Date.now();
  const normalizedDomain = normalize(domain);
  return sessions.some(
    (s) => normalize(s.domain) === normalizedDomain && s.expiresAt > now,
  );
}

export async function createSession(
  domain: string,
  reason: string,
  durationMinutes: number,
): Promise<Session> {
  const now = Date.now();
  const session: Session = {
    domain: normalize(domain),
    reason,
    durationMinutes,
    startedAt: now,
    expiresAt: now + durationMinutes * 60 * 1000,
  };

  const sessions = await activeSessions.getValue();
  // Remove any existing session for this domain
  const filtered = sessions.filter((s) => normalize(s.domain) !== session.domain);
  await activeSessions.setValue([...filtered, session]);

  // Append to persistent history
  const history = await sessionHistory.getValue();
  await sessionHistory.setValue([...history, session]);

  return session;
}

export async function cleanExpiredSessions(): Promise<void> {
  const sessions = await activeSessions.getValue();
  const now = Date.now();
  const active = sessions.filter((s) => s.expiresAt > now);
  if (active.length !== sessions.length) {
    await activeSessions.setValue(active);
  }
}
