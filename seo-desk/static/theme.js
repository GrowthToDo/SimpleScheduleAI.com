// Dark or light. Dark is the default; the choice is kept in this browser only. Every colour is a
// CSS variable in app.css: dark under :root, light under :root[data-theme='light'], so switching is
// one attribute on <html>. index.html sets the attribute before the page draws (no flash); this
// module reads and saves the choice and draws the switch in the sidebar foot.
//
//   readTheme(storage)          'dark' or 'light'
//   saveTheme(storage, value)   true when saved, false when storage refused
//   applyTheme(value)           sets <html data-theme>, tells listeners
//   themeSwitch(h)              the Dark / Light switch (browser only)

export const THEME_KEY = 'seo-desk-theme';
export const THEMES = ['dark', 'light'];

const storageOrNull = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

export function readTheme(storage = storageOrNull()) {
  try {
    return storage?.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(storage, value) {
  try {
    storage.setItem(THEME_KEY, value);
    return true;
  } catch {
    // A private window or blocked storage: the choice lasts for this page only.
    return false;
  }
}

export function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

// The tab icon, drawn in the theme's accent (read from the CSS variables, so no colour is named here).
export function drawFavicon() {
  const link = document.getElementById('favicon');
  if (!link) return;
  const css = getComputedStyle(document.documentElement);
  const fill = css.getPropertyValue('--accent').trim();
  const ink = css.getPropertyValue('--accent-ink').trim();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' rx='4' fill='${fill}'/><path d='M4 11l3-3 2 2 3-4' fill='none' stroke='${ink}' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function applyTheme(value) {
  const theme = value === 'light' ? 'light' : 'dark';
  if (theme === 'light') document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;
  drawFavicon();
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function themeSwitch(h) {
  const buttons = THEMES.map((t) =>
    h(
      'button',
      {
        type: 'button',
        dataset: { theme: t },
        'aria-pressed': String(currentTheme() === t),
        onclick: () => {
          applyTheme(t);
          saveTheme(storageOrNull(), t);
          for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.theme === t));
        },
      },
      t === 'dark' ? 'Dark' : 'Light'
    )
  );
  return h('div', { class: 'seg theme-switch', role: 'group', 'aria-label': 'Colours' }, buttons);
}
