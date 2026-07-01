// ─────────────────────────────────────────────────────────────────────────
//  SITE CONFIG
//  Language-neutral data (same across every locale): name, contact details…
//  Keep real contact info here so it lives in one place.
//
//  ⚠️ PLACEHOLDERS — replace the email / social URLs with the real ones.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  name: "Byke",
  wordmark: "BYKE", // shown as the logo (top-left)
  role: "Live Visuals · VJ", // tagline (SEO / empty state)
  jobTitle: "VJ & Live Visual Artist",
  country: "FR", // ISO country code — used for SEO structured data
  email: "bykeproduction@gmail.com",
  instagram: { handle: "@byke_vo", url: "https://www.instagram.com/byke_vo?igsh=cWEwZGttYmMxcHFy" },
};

// Public profiles, used by SEO structured data (schema.org `sameAs`).
export const sameAs = [site.instagram.url];
