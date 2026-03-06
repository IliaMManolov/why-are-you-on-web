import type { SocialClient } from './types';

export class TwitterClient implements SocialClient {
  private bearerToken: string;

  constructor(credentials: Record<string, string>) {
    this.bearerToken = credentials.bearerToken || '';
  }

  async post(text: string): Promise<void> {
    const res = await fetch('https://api.x.com/2/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.bearerToken}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`Twitter post failed: ${res.status}`);
  }
}
