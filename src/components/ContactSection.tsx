import { site } from "@/config";
import type { Dictionary } from "@/i18n";

/**
 * "Contact" section — slides in over the carousel on demand. Two columns on
 * desktop: booking details on the left, his portrait (with an accent glow) on
 * the right; stacked on mobile.
 */
export default function ContactSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="slide section">
      <div className="section-scan" aria-hidden="true" />
      <div className="section-inner section-contact">
        <div className="contact-text">
          <div className="section-label">{dict.contact.label}</div>
          <h2 className="section-title glitch" data-text={dict.contact.title}>
            {dict.contact.title}
          </h2>

          <ul className="section-links">
            <li>
              <span>{dict.contact.links.email}</span>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <span>{dict.contact.links.instagram}</span>
              <a href={site.instagram.url} target="_blank" rel="noreferrer">
                {site.instagram.handle}
              </a>
            </li>
          </ul>

          <p className="section-text section-muted">{dict.contact.note}</p>
        </div>

        <figure className="contact-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/byke-portrait.jpg" alt={site.name} />
        </figure>
      </div>
    </section>
  );
}
