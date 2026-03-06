import type { SocialClient } from './types';

export class MastodonClient implements SocialClient {
  private instanceUrl: string;
  private accessToken: string;

  constructor(credentials: Record<string, string>) {
    this.instanceUrl = credentials.instanceUrl || '';
    this.accessToken = credentials.accessToken || '';
  }

  async post(text: string): Promise<void> {
    const res = await fetch(`${this.instanceUrl}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ status: text }),
    });
    if (!res.ok) throw new Error(`Mastodon post failed: ${res.status}`);
  }
}
