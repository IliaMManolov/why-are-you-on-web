import { blockedDomains } from '../../utils/storage';
import { parseDomainInput } from '../../utils/domain-parsing';

const app = document.getElementById('app')!;

function render(domains: string[], error: string | null = null) {
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
  if (error) {
    const errorEl = document.createElement('p');
    errorEl.className = 'error';
    errorEl.textContent = error;
    container.append(errorEl);
  }

  async function addDomain() {
    const parsed = parseDomainInput(input.value);
    if (!parsed) {
      render(domains, 'Invalid domain. Enter a domain like "reddit.com".');
      return;
    }
    if (domains.includes(parsed)) {
      render(domains, `"${parsed}" is already in your list.`);
      return;
    }
    const updated = [...domains, parsed];
    await blockedDomains.setValue(updated);
  }

  addBtn.addEventListener('click', addDomain);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDomain();
  });

  // Domain list
  const list = document.createElement('ul');
  list.className = 'domain-list';

  if (domains.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No blocked domains yet. Add one above.';
    list.append(empty);
  } else {
    for (const domain of domains) {
      const item = document.createElement('li');
      item.className = 'domain-item';

      const name = document.createElement('span');
      name.className = 'domain-name';
      name.textContent = domain;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', async () => {
        const updated = domains.filter((d) => d !== domain);
        await blockedDomains.setValue(updated);
      });

      item.append(name, removeBtn);
      list.append(item);
    }
  }

  container.append(list);
  app.append(container);

  // Re-focus input after render
  const newInput = container.querySelector<HTMLInputElement>('.add-input');
  newInput?.focus();
}

// Initial render
blockedDomains.getValue().then((domains) => render(domains));

// Re-render on storage changes
blockedDomains.watch((domains) => render(domains));
