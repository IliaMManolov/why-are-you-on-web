import type { SocialClient } from './types';

interface BlueskySession {
  accessJwt: string;
  did: string;
}

export class BlueskyClient implements SocialClient {
  private service: string;
  private identifier: string;
  private password: string;

  constructor(credentials: Record<string, string>) {
    this.service = credentials.service || 'https://bsky.social';
    this.identifier = credentials.identifier || '';
    this.password = credentials.password || '';
  }

  async post(text: string): Promise<void> {
    const session = await this.createSession();
    await fetch(`${this.service}/xrpc/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessJwt}`,
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record: {
          $type: 'app.bsky.feed.post',
          text,
          createdAt: new Date().toISOString(),
        },
      }),
    });
  }

  private async createSession(): Promise<BlueskySession> {
    const res = await fetch(
      `${this.service}/xrpc/com.atproto.server.createSession`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: this.identifier,
          password: this.password,
        }),
      },
    );
    if (!res.ok) throw new Error(`Bluesky auth failed: ${res.status}`);
    return res.json() as Promise<BlueskySession>;
  }
}
