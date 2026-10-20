/**
 * Pre-paint theme resolution.
 *
 * Rendered as the first child of `<body>` so it executes before any content
 * paints, which is what prevents a flash of the wrong theme. Resolution order:
 * an explicit user choice (localStorage) wins, otherwise **light** — the default.
 *
 * Kept as a raw inline script on purpose — it must not wait for React.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('vcw:theme');
    var dark = stored ? stored === 'dark' : false;
    var root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (error) {
    /* Private mode / blocked storage: default to light */
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
})();
`.trim()

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}
