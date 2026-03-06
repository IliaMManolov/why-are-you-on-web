import { blockedDomains } from '../../utils/storage';
import { parseDomainInput } from '../../utils/domain-parsing';
import { socialAccounts } from '../../utils/social/storage';
import type { SocialAccount, Platform } from '../../utils/social/types';

const app = document.getElementById('app')!;

interface RenderState {
  domains: string[];
  accounts: SocialAccount[];
  error: string | null;
}

function render(state: RenderState) {
  app.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  const h1 = document.createElement('h1');
  h1.textContent = 'Why Are You On?';
  container.append(h1);

  const desc = document.createElement('p');
  desc.className = 'description';
  desc.textContent = 'Add domains you want to block. You\'ll need to justify your visit before accessing them.';
  container.append(desc);

  // Add form
  const form = document.createElement('div');
  form.className = 'add-form';

  const input = document.createElement('input');
  input.className = 'add-input';
  input.type = 'text';
  input.placeholder = 'e.g. reddit.com or https://www.twitter.com/...';

  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = 'Add';

  form.append(input, addBtn);
  container.append(form);

  // Error message
  if (state.error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'error';
    errorEl.textContent = state.error;
    container.append(errorEl);
  }

  async function addDomain() {
    const parsed = parseDomainInput(input.value);
    if (!parsed) {
      renderWithError('Invalid domain. Enter a domain like "reddit.com".');
      return;
    }
    if (state.domains.includes(parsed)) {
      renderWithError(`"${parsed}" is already in your list.`);
      return;
    }
    const updated = [...state.domains, parsed];
    await blockedDomains.setValue(updated);
  }

  function renderWithError(msg: string) {
    render({ ...state, error: msg });
  }

  addBtn.addEventListener('click', addDomain);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDomain();
  });

  // Domain list
  const list = document.createElement('ul');
  list.className = 'domain-list';

  if (state.domains.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No blocked domains yet. Add one above.';
    list.append(empty);
  } else {
    for (const domain of state.domains) {
      const item = document.createElement('li');
      item.className = 'domain-item';

      const name = document.createElement('span');
      name.className = 'domain-name';
      name.textContent = domain;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', async () => {
        const updated = state.domains.filter((d) => d !== domain);
        await blockedDomains.setValue(updated);
      });

      item.append(name, removeBtn);
      list.append(item);
    }
  }

  container.append(list);

  // Social Accounts section
  container.append(buildSocialSection(state.accounts));

  app.append(container);

  // Re-focus input after render
  const newInput = container.querySelector<HTMLInputElement>('.add-input');
  newInput?.focus();
}

// --- Social Accounts UI ---

const PLATFORM_CONFIG: Record<Platform, { label: string; fields: { key: string; label: string; type: string }[] }> = {
  bluesky: {
    label: 'Bluesky',
    fields: [
      { key: 'identifier', label: 'Handle (e.g. user.bsky.social)', type: 'text' },
      { key: 'password', label: 'App Password', type: 'password' },
    ],
  },
  mastodon: {
    label: 'Mastodon',
    fields: [
      { key: 'instanceUrl', label: 'Instance URL (e.g. https://mastodon.social)', type: 'url' },
      { key: 'accessToken', label: 'Access Token', type: 'password' },
    ],
  },
  twitter: {
    label: 'Twitter / X',
    fields: [
      { key: 'bearerToken', label: 'Bearer Token', type: 'password' },
    ],
  },
};

function buildSocialSection(accounts: SocialAccount[]): HTMLElement {
  const section = document.createElement('div');
  section.className = 'social-section';

  const heading = document.createElement('h2');
  heading.textContent = 'Social Accounts';
  heading.className = 'social-heading';
  section.append(heading);

  const socialDesc = document.createElement('p');
  socialDesc.className = 'description';
  socialDesc.textContent = 'Optionally post your justifications to social media for accountability.';
  section.append(socialDesc);

  for (const platform of Object.keys(PLATFORM_CONFIG) as Platform[]) {
    const config = PLATFORM_CONFIG[platform];
    const existing = accounts.find((a) => a.platform === platform);

    const card = document.createElement('div');
    card.className = 'social-card';

    const header = document.createElement('div');
    header.className = 'social-card-header';

    const label = document.createElement('span');
    label.className = 'social-card-label';
    label.textContent = config.label;
    header.append(label);

    if (existing) {
      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.checked = existing.enabled;
      toggle.className = 'social-toggle';
      toggle.addEventListener('change', async () => {
        const updated = accounts.map((a) =>
          a.platform === platform ? { ...a, enabled: toggle.checked } : a,
        );
        await socialAccounts.setValue(updated);
      });
      header.append(toggle);

      const unlinkBtn = document.createElement('button');
      unlinkBtn.className = 'remove-btn';
      unlinkBtn.textContent = 'Unlink';
      unlinkBtn.addEventListener('click', async () => {
        const updated = accounts.filter((a) => a.platform !== platform);
        await socialAccounts.setValue(updated);
      });
      header.append(unlinkBtn);

      const status = document.createElement('span');
      status.className = 'social-status';
      status.textContent = existing.displayName || 'Linked';
      card.append(header, status);
    } else {
      card.append(header);
      const fields = buildLinkForm(platform, config.fields, accounts);
      card.append(fields);
    }

    section.append(card);
  }

  return section;
}

function buildLinkForm(
  platform: Platform,
  fields: { key: string; label: string; type: string }[],
  accounts: SocialAccount[],
): HTMLElement {
  const form = document.createElement('div');
  form.className = 'social-link-form';

  const inputs: Record<string, HTMLInputElement> = {};

  for (const field of fields) {
    const label = document.createElement('label');
    label.className = 'social-field-label';
    label.textContent = field.label;

    const input = document.createElement('input');
    input.className = 'add-input';
    input.type = field.type;
    input.placeholder = field.label;
    inputs[field.key] = input;

    form.append(label, input);
  }

  const linkBtn = document.createElement('button');
  linkBtn.className = 'add-btn';
  linkBtn.textContent = 'Link';
  linkBtn.addEventListener('click', async () => {
    const credentials: Record<string, string> = {};
    let displayName = '';
    for (const field of fields) {
      const val = inputs[field.key].value.trim();
      if (!val) return; // Don't submit if empty
      credentials[field.key] = val;
      if (field.key === 'identifier' || field.key === 'instanceUrl') {
        displayName = val;
      }
    }

    const account: SocialAccount = {
      platform,
      enabled: true,
      displayName,
      credentials,
    };

    await socialAccounts.setValue([...accounts, account]);
  });

  form.append(linkBtn);
  return form;
}

// --- Init ---

let currentDomains: string[] = [];
let currentAccounts: SocialAccount[] = [];

async function init() {
  currentDomains = await blockedDomains.getValue();
  currentAccounts = await socialAccounts.getValue();
  render({ domains: currentDomains, accounts: currentAccounts, error: null });
}

blockedDomains.watch((domains) => {
  currentDomains = domains;
  render({ domains: currentDomains, accounts: currentAccounts, error: null });
});

socialAccounts.watch((accounts) => {
  currentAccounts = accounts;
  render({ domains: currentDomains, accounts: currentAccounts, error: null });
});

init();
