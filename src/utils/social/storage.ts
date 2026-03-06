import { storage } from 'wxt/utils/storage';
import type { SocialAccount } from './types';

export const socialAccounts = storage.defineItem<SocialAccount[]>(
  'local:socialAccounts',
  { fallback: [] },
);
