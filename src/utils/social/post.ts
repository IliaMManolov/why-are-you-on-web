import { socialAccounts } from './storage';
import type { Platform, PostResult, SocialClient } from './types';
import { BlueskyClient } from './bluesky';
import { MastodonClient } from './mastodon';
import { TwitterClient } from './twitter';

function createClient(platform: Platform, credentials: Record<string, string>): SocialClient {
  switch (platform) {
    case 'bluesky':
      return new BlueskyClient(credentials);
    case 'mastodon':
      return new MastodonClient(credentials);
    case 'twitter':
      return new TwitterClient(credentials);
  }
}

export async function postToSocial(text: string): Promise<PostResult[]> {
  const accounts = await socialAccounts.getValue();
  const enabled = accounts.filter((a) => a.enabled);

  if (enabled.length === 0) return [];

  const results = await Promise.allSettled(
    enabled.map(async (account): Promise<PostResult> => {
      try {
        const client = createClient(account.platform, account.credentials);
        await client.post(text);
        return { platform: account.platform, success: true };
      } catch (err) {
        return {
          platform: account.platform,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    }),
  );

  return results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { platform: 'bluesky' as Platform, success: false, error: 'Unexpected failure' },
  );
}
