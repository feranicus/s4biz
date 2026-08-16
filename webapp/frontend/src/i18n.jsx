/* Site language — ONE store, many readers.
 *
 * WHY useSyncExternalStore AND NOT useState. A plain `useState` inside a shared hook gives every
 * caller its OWN private copy: clicking the toggle in the header re-renders the header and
 * nothing else, and the rest of the page only catches up when it happens to remount (which is
 * what navigating to another page or refreshing does). That reads as "I have to refresh before
 * the site is in German", and it is the exact bug this file exists to prevent. A value that more
 * than one component renders is APPLICATION state, not component state.
 *
 * One writer, many readers, all of them re-render on change. No context provider to wrap the tree
 * in. `subscribe` also listens for the `storage` event, so a SECOND OPEN TAB switches with the
 * first.
 */
import { useSyncExternalStore, useCallback } from "react";
import { EN } from "./locales/en.js";
import { DE } from "./locales/de.js";

export const LANGS = [
  { code: "en", label: "English", short: "EN" },
  { code: "de", label: "Deutsch", short: "DE" },
];

const PACKS = { en: EN, de: DE };
const KEY = "s4_lang";
const DEFAULT = "en";

function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && PACKS[saved]) return saved;
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("de")) return "de";
  } catch {
    /* SSR, or storage blocked. Fall through to the default. */
  }
  return DEFAULT;
}

let LANG = typeof window === "undefined" ? DEFAULT : initial();
const listeners = new Set();

export function getLang() {
  return LANG;
}

export function setLang(code) {
  if (!PACKS[code] || code === LANG) return;
  LANG = code;
  try {
    localStorage.setItem(KEY, code);
    // a11y + browser spellcheck: the document must declare the language it is actually in.
    document.documentElement.lang = code;
  } catch {
    /* non-fatal */
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (e) => {
    if (e.key === KEY && e.newValue && PACKS[e.newValue] && e.newValue !== LANG) {
      LANG = e.newValue;
      listeners.forEach((f) => f());
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function useLang() {
  return useSyncExternalStore(
    subscribe,
    () => LANG,
    // THE SERVER SNAPSHOT MUST READ THE STORE, not a constant. Returning DEFAULT here renders
    // every page in English no matter what setLang() was told, which is invisible in a browser
    // (the client snapshot takes over on hydration) and silently defeats any server-side render.
    // The render gate caught exactly that: eighteen pages, and the German ones were byte-identical
    // to the English ones. It is safe because LANG cannot change during a single render pass.
    () => LANG
  );
}

/* Resolve one key.
 *
 * FALLBACK ORDER: requested language -> English -> the key itself. A missing translation
 * degrades to readable English rather than white-screening. It NEVER silently prints the key on
 * a page we ship: tools/i18n_catalogue.mjs --check fails the build if any locale is incomplete,
 * and the render audit fails if a raw dotted key ever reaches the DOM. A fallback that prints
 * the key looks like content, which is worse than a crash.
 */
export function tr(lang, key) {
  const pack = PACKS[lang] || EN;
  const v = pack[key];
  if (v !== undefined) return v;
  const e = EN[key];
  if (e !== undefined) return e;
  return key;
}

/* The hook every component uses.  const [lang, setL, t] = useT();
 *
 * `t` is memoised on [lang]. Anything handed to a useEffect dependency array must be stable, or
 * the effect re-runs on EVERY render; where that effect builds DOM with innerHTML it appends a
 * duplicate copy of everything each time. That defect has shipped here before.
 */
export function useT() {
  const lang = useLang();
  const t = useCallback((key) => tr(lang, key), [lang]);
  return [lang, setLang, t];
}

/* Structured content (arrays of objects: pillars, practices, case studies).
 *
 * These are DATA, not markup. The page component holds the layout and zero copy, so a
 * translation can only ever change words. A translator cannot move a box, drop a column or
 * reorder the page, because none of those things are in the file they edit.
 *
 * The fallback is WHOLE-ARRAY, never per index: `sections` is an array whose order is the page
 * order, so an index-wise merge would silently pair the German heading of one section with the
 * English body of another the moment one locale gained an entry. tools/content_gate.mjs proves
 * the arrays are parallel, which is what makes the whole-array rule safe.
 */
export function useContent(name) {
  const lang = useLang();
  const pack = PACKS[lang] || EN;
  const arr = pack.__content && pack.__content[name];
  if (Array.isArray(arr) && arr.length) return arr;
  return (EN.__content && EN.__content[name]) || [];
}
