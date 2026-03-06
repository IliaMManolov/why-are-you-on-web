import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createSession } from '../utils/session-manager';
import {
  isFormValid,
  getReasonError,
  ALLOWED_DURATIONS,
  MIN_REASON_LENGTH,
  MAX_REASON_LENGTH,
  type FormState,
} from '../utils/form-validation';

export async function mountModal(
  ctx: ContentScriptContext,
  hostname: string,
): Promise<void> {
  const ui = await createShadowRootUi(ctx, {
    name: 'wayro-modal',
    position: 'overlay',
    zIndex: 2147483647,
    isolateEvents: ['keydown', 'keyup', 'keypress'],
    onMount(container) {
      const state: FormState = { reason: '', duration: null };
      const root = buildModal(hostname, state, () => {
        onSubmit(state, hostname, ui);
      });
      container.append(root);

      // Auto-focus textarea
      const textarea = root.querySelector<HTMLTextAreaElement>('.wayro-textarea');
      textarea?.focus();

      // Focus trap
      setupFocusTrap(root);

      return root;
    },
    onRemove(root) {
      root?.remove();
    },
  });

  ui.mount();
}

function buildModal(
  hostname: string,
  state: FormState,
  onSubmitCb: () => void,
): HTMLElement {
  const backdrop = el('div', { className: 'wayro-backdrop' });
  const modal = el('div', { className: 'wayro-modal' });

  // Title
  const title = el('h2', { className: 'wayro-title', textContent: 'Why are you on...' });
  const subtitle = el('p', { className: 'wayro-subtitle' });
  const domainSpan = el('span', { className: 'wayro-domain', textContent: hostname });
  subtitle.append(domainSpan, '?');

  // Textarea
  const label = el('label', { className: 'wayro-label', textContent: 'Justify your visit' });
  const textarea = el('textarea', {
    className: 'wayro-textarea',
    placeholder: `Explain why you need to visit ${hostname} right now... (${MIN_REASON_LENGTH}-${MAX_REASON_LENGTH} characters)`,
  }) as HTMLTextAreaElement;
  textarea.setAttribute('maxlength', String(MAX_REASON_LENGTH));

  const counter = el('div', { className: 'wayro-counter', textContent: `0/${MAX_REASON_LENGTH}` });

  // Duration buttons
  const durationGroup = el('div', { className: 'wayro-duration-group' });
  const durationLabel = el('label', { className: 'wayro-label', textContent: 'Time limit' });
  const durationRow = el('div', { className: 'wayro-duration-row' });
  const durationButtons: HTMLButtonElement[] = [];

  for (const d of ALLOWED_DURATIONS) {
    const btn = el('button', {
      className: 'wayro-duration',
      textContent: `${d} min`,
    }) as HTMLButtonElement;
    btn.dataset.duration = String(d);
    btn.addEventListener('click', () => {
      state.duration = d;
      durationButtons.forEach((b) => b.classList.remove('wayro-duration--selected'));
      btn.classList.add('wayro-duration--selected');
      updateEnterButton();
    });
    durationButtons.push(btn);
    durationRow.append(btn);
  }

  durationGroup.append(durationLabel, durationRow);

  // Enter button
  const enterBtn = el('button', {
    className: 'wayro-enter',
    textContent: 'Enter Site',
  }) as HTMLButtonElement;
  enterBtn.disabled = true;

  function updateEnterButton() {
    enterBtn.disabled = !isFormValid(state);
  }

  textarea.addEventListener('input', () => {
    state.reason = textarea.value;
    const len = textarea.value.length;
    const error = getReasonError(textarea.value);

    counter.textContent = `${len}/${MAX_REASON_LENGTH}`;
    counter.className = error && len >= MIN_REASON_LENGTH
      ? 'wayro-counter wayro-counter--error'
      : len < MIN_REASON_LENGTH
        ? 'wayro-counter'
        : 'wayro-counter';

    if (len > MAX_REASON_LENGTH) {
      counter.className = 'wayro-counter wayro-counter--error';
    }

    updateEnterButton();
  });

  // Enter key submits (Shift+Enter for newlines)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && isFormValid(state)) {
      e.preventDefault();
      onSubmitCb();
    }
  });

  enterBtn.addEventListener('click', () => {
    if (isFormValid(state)) {
      onSubmitCb();
    }
  });

  modal.append(title, subtitle, label, textarea, counter, durationGroup, enterBtn);
  backdrop.append(modal);

  // Prevent clicking backdrop from doing anything on the host page
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      textarea.focus();
    }
  });

  return backdrop;
}

async function onSubmit(
  state: FormState,
  hostname: string,
  ui: { remove: () => void },
): Promise<void> {
  if (!isFormValid(state)) return;
  await createSession(hostname, state.reason, state.duration!);

  // Fire-and-forget social media post
  const text = `[Why Are You On ${hostname}?] ${state.reason} (${state.duration} min)`;
  browser.runtime.sendMessage({ type: 'POST_TO_SOCIAL', text }).catch(() => {
    // Silently ignore — social posting is optional
  });

  ui.remove();
}

function setupFocusTrap(root: HTMLElement): void {
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusable = root.querySelectorAll<HTMLElement>(
      'textarea, button:not(:disabled)',
    );
    const elements = Array.from(focusable);
    if (elements.length === 0) return;

    const shadowRoot = root.getRootNode() as ShadowRoot;
    const activeEl = shadowRoot.activeElement as HTMLElement | null;
    const currentIndex = activeEl ? elements.indexOf(activeEl) : -1;

    if (e.shiftKey) {
      const prevIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
      elements[prevIndex].focus();
    } else {
      const nextIndex = currentIndex >= elements.length - 1 ? 0 : currentIndex + 1;
      elements[nextIndex].focus();
    }
    e.preventDefault();
  });
}

function el(
  tag: string,
  props?: Record<string, unknown>,
): HTMLElement {
  const element = document.createElement(tag);
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key in element) {
        (element as Record<string, unknown>)[key] = value;
      }
    });
  }
  return element;
}
