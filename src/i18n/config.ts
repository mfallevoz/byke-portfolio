// ─────────────────────────────────────────────────────────────────────────
//  i18n CONFIG
//
//  The site currently ships in a SINGLE language (no language picker). The
//  whole i18n machinery is kept in place so a second language can be added
//  later without re-architecting.
//
//  👉 TO ADD A NEW LANGUAGE LATER:
//     1. Add its code to `locales` below.
//     2. Add its native name to `localeNames`.
//     3. Create `src/i18n/dictionaries/<code>.ts` (copy `en.ts` as a template).
//     4. Register it in `src/i18n/index.ts`.
//     5. Re-introduce a `/[locale]` route + a language landing page on `/`.
// ─────────────────────────────────────────────────────────────────────────

export const locales = ["en"] as const;

export type Locale = (typeof locales)[number];

// The single active language while the site is monolingual.
export const defaultLocale: Locale = "en";

// Each language displayed in its own language (used by a future language picker).
export const localeNames: Record<Locale, string> = {
  en: "English",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
