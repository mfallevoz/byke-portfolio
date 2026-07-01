"use client";

import { site } from "@/config";
import type { Dictionary } from "@/i18n";

export type View = "carousel" | "contact";

/**
 * Fixed top bar. Purely presentational: the buttons trigger the animated
 * navigation handled by the Carousel.
 */
export default function TopBar({
  dict,
  view,
  onHome,
  onContact,
}: {
  dict: Dictionary;
  view: View;
  onHome: () => void;
  onContact: () => void;
}) {
  return (
    <header className="topbar">
      <button className="logo" onClick={onHome} aria-label={dict.nav.home}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="logo-img" src="/logo-byke-white.png" alt={site.wordmark} />
      </button>

      <span className="nav-center" aria-hidden="true" />

      <button
        className={"nav-link nav-end" + (view === "contact" ? " is-active" : "")}
        onClick={onContact}
      >
        {dict.nav.contact}
      </button>
    </header>
  );
}
