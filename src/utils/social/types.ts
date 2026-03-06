export type Platform = 'bluesky' | 'mastodon' | 'twitter';

export interface SocialAccount {
  platform: Platform;
  enabled: boolean;
  displayName: string;
  credentials: Record<string, string>;
}

export interface PostResult {
  platform: Platform;
  success: boolean;
  error?: string;
}

export interface SocialClient {
  post(text: string): Promise<void>;
}
