import { blockedDomains, sessionHistory, type Session } from '../../utils/storage';
import { parseDomainInput } from '../../utils/domain-parsing';

const app = document.getElementById('app')!;

interface RenderState {
  domains: string[];
  history: Session[];
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
      render({ ...state, error: 'Invalid domain. Enter a domain like "reddit.com".' });
      return;
    }
    if (state.domains.includes(parsed)) {
      render({ ...state, error: `"${parsed}" is already in your list.` });
      return;
    }
    const updated = [...state.domains, parsed];
    await blockedDomains.setValue(updated);
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

  // History section
  container.append(buildHistorySection(state.history));

  app.append(container);

  // Re-focus input after render
  const newInput = container.querySelector<HTMLInputElement>('.add-input');
  newInput?.focus();
}

function buildHistorySection(history: Session[]): HTMLElement {
  const section = document.createElement('div');
  section.className = 'history-section';

  const heading = document.createElement('h2');
  heading.className = 'history-heading';
  heading.textContent = 'Visit Log';
  section.append(heading);

  if (history.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No visits recorded yet.';
    section.append(empty);
    return section;
  }

  const clearBtn = document.createElement('button');
  clearBtn.className = 'remove-btn';
  clearBtn.textContent = 'Clear history';
  clearBtn.addEventListener('click', async () => {
    await sessionHistory.setValue([]);
  });
  section.append(clearBtn);

  // Show newest first
  const sorted = [...history].reverse();

  for (const session of sorted) {
    const entry = document.createElement('div');
    entry.className = 'history-entry';

    const header = document.createElement('div');
    header.className = 'history-entry-header';

    const domain = document.createElement('span');
    domain.className = 'history-domain';
    domain.textContent = session.domain;

    const meta = document.createElement('span');
    meta.className = 'history-meta';
    const date = new Date(session.startedAt);
    meta.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()} \u00B7 ${session.durationMinutes} min`;

    header.append(domain, meta);

    const reason = document.createElement('p');
    reason.className = 'history-reason';
    reason.textContent = session.reason;

    entry.append(header, reason);
    section.append(entry);
  }

  return section;
}

// --- Init ---

let currentDomains: string[] = [];
let currentHistory: Session[] = [];

async function init() {
  currentDomains = await blockedDomains.getValue();
  currentHistory = await sessionHistory.getValue();
  render({ domains: currentDomains, history: currentHistory, error: null });
}

blockedDomains.watch((domains) => {
  currentDomains = domains;
  render({ domains: currentDomains, history: currentHistory, error: null });
});

sessionHistory.watch((history) => {
  currentHistory = history;
  render({ domains: currentDomains, history: currentHistory, error: null });
});

init();
