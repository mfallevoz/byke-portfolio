import type { Locale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";

// Register every language dictionary here.
const dictionaries: Record<Locale, Dictionary> = { en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
