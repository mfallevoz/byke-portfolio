"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import VideoSlide from "./VideoSlide";
import ContactSection from "./ContactSection";
import TopBar, { type View } from "./TopBar";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

// The video list is repeated several times; the scroll position is reset when
// crossing a boundary → seamless infinite loop. (Minimum 3 copies to work.)
const COPIES = 6;

// Contact slide-in tuning.
const SLIDE_MS = 620; // transition duration for the coupled slide
const EASE = "cubic-bezier(0.7, 0, 0.2, 1)";
// How far the video travels vs the contact panel during the open (0–1).
// < 1 → the video lags behind the panel = parallax depth.
const PARALLAX = 0.7;

export default function Carousel({
  dict,
  locale,
  projects,
}: {
  dict: Dictionary;
  locale: Locale;
  projects: Project[];
}) {
  const P = projects.length;
  const ref = useRef<HTMLDivElement>(null); // carousel = video layer
  const panelRef = useRef<HTMLDivElement>(null); // contact panel layer
  const [active, setActive] = useState(0);

  // Contact is a panel that slides in as if it were the next slide. It only
  // exists after its button is clicked; a scroll gesture slides it back out in
  // the gesture's direction. Synchronous refs for use inside event handlers.
  const [contactOpen, _setContactOpen] = useState(false);
  const contactRef = useRef(false);
  const busyRef = useRef(false); // an open/close animation is in flight
  const guardRef = useRef(false); // briefly absorb scroll after a close
  const lastAdvanceRef = useRef(0); // debounce auto-advance
  const setContactOpen = (v: boolean) => {
    contactRef.current = v;
    _setContactOpen(v);
  };

  // Reflect the locale on the <html> element for accessibility.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Offsets derived from a slide's height.
  const offsets = () => {
    const c = ref.current!;
    const h = c.clientHeight;
    return { h, copyH: h * P };
  };

  // Starting position: top of the centre video copy.
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.scrollTop = c.clientHeight * P;
  }, []);

  // Drive the two layers' vertical transforms together.
  const place = (videoY: number, panelY: number, animate: boolean) => {
    const v = ref.current;
    const k = panelRef.current;
    if (!v || !k) return;
    const t = animate ? `transform ${SLIDE_MS}ms ${EASE}` : "none";
    v.style.transition = t;
    k.style.transition = t;
    v.style.transform = `translateY(${videoY}px)`;
    k.style.transform = `translateY(${panelY}px)`;
  };

  // Force a synchronous style/layout flush so the "start" transform is
  // committed before the animated one. More reliable than rAF on Safari,
  // which can coalesce frames and skip the transition (→ an abrupt jump).
  const commit = () => {
    void ref.current?.offsetHeight;
  };

  // Absorb residual scroll momentum (trackpad inertia) for a moment after a
  // close, so the gesture that dismissed Contact doesn't also flick the
  // carousel to another slide.
  const cool = () => {
    guardRef.current = true;
    window.setTimeout(() => (guardRef.current = false), 450);
  };

  const openContact = () => {
    const c = ref.current;
    if (!c || busyRef.current || contactRef.current) return;
    busyRef.current = true;
    setContactOpen(true);
    const H = c.clientHeight;
    place(0, H, false); // video centred, panel just below
    commit();
    place(-PARALLAX * H, 0, true); // video lags up (parallax), panel slides in
    window.setTimeout(() => (busyRef.current = false), SLIDE_MS);
  };

  // Leaving Contact is a single slide back to the SAME video; only the exit
  // direction follows the gesture. Up → panel drops back down; down → panel
  // lifts out the top and the video slides up into place.
  const closeUp = () => {
    const c = ref.current;
    if (!c) return;
    const H = c.clientHeight;
    place(0, H, true);
    window.setTimeout(() => {
      setContactOpen(false);
      busyRef.current = false;
      place(0, H, false);
      cool();
    }, SLIDE_MS);
  };

  const closeDown = () => {
    const c = ref.current;
    if (!c) return;
    const H = c.clientHeight;
    place(H, 0, false); // hide the video below the panel
    commit();
    place(0, -H, true); // panel exits the top, video slides up into view
    window.setTimeout(() => {
      setContactOpen(false);
      busyRef.current = false;
      place(0, H, false);
      cool();
    }, SLIDE_MS);
  };

  const dismiss = (dir: "up" | "down") => {
    if (busyRef.current) return;
    busyRef.current = true;
    if (dir === "down") closeDown();
    else closeUp();
  };

  const goContact = () => openContact();
  const goHome = () => {
    if (contactRef.current) dismiss("up");
  };

  // Advance to the next video (used when the current one finishes, and by keys).
  const advanceNext = () => {
    const c = ref.current;
    if (!c || contactRef.current || busyRef.current) return;
    const now = Date.now();
    if (now - lastAdvanceRef.current < 700) return; // debounce
    lastAdvanceRef.current = now;
    c.scrollBy({ top: c.clientHeight, behavior: "smooth" });
  };

  // ───────── Scroll: infinite loop + momentum guard ─────────
  useEffect(() => {
    const c = ref.current;
    if (!c) return;

    let ticking = false;
    const onScroll = () => {
      if (contactRef.current) return; // frozen while Contact is up
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const { h, copyH } = offsets();
        if (c.scrollTop >= copyH * 2) c.scrollTop -= copyH;
        else if (c.scrollTop < h * 0.5) c.scrollTop += copyH;
        const idx = Math.round(c.scrollTop / h);
        setActive(((idx % P) + P) % P);
        ticking = false;
      });
    };
    const block = (e: Event) => {
      if (guardRef.current) e.preventDefault();
    };

    c.addEventListener("scroll", onScroll, { passive: true });
    c.addEventListener("wheel", block, { passive: false });
    c.addEventListener("touchmove", block, { passive: false });
    return () => {
      c.removeEventListener("scroll", onScroll);
      c.removeEventListener("wheel", block);
      c.removeEventListener("touchmove", block);
    };
  }, []);

  // ───────── Dismiss Contact in the direction of the gesture ─────────
  useEffect(() => {
    if (!contactOpen) return;
    let startY = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dismiss(e.deltaY >= 0 ? "down" : "up");
    };
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = startY - (e.touches[0]?.clientY ?? startY);
      if (Math.abs(dy) < 8) return;
      dismiss(dy > 0 ? "down" : "up");
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        dismiss("down");
      } else if (["ArrowUp", "PageUp", "Escape"].includes(e.key)) {
        e.preventDefault();
        dismiss("up");
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [contactOpen]);

  // Keyboard navigation (carousel only).
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const onKey = (e: KeyboardEvent) => {
      if (contactRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        c.scrollBy({ top: c.clientHeight, behavior: "smooth" });
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        c.scrollBy({ top: -c.clientHeight, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const slides = Array.from({ length: COPIES }).flatMap((_, ci) =>
    projects.map((p, i) => (
      <VideoSlide
        key={`${ci}-${i}`}
        src={p.src}
        srcMobile={p.srcMobile}
        poster={p.poster}
        onEnded={advanceNext}
      />
    ))
  );

  const current = projects[active];
  const view: View = contactOpen ? "contact" : "carousel";
  const hidden = contactOpen ? " is-hidden" : "";

  return (
    <>
      <TopBar dict={dict} view={view} onHome={goHome} onContact={goContact} />

      <div className="carousel" ref={ref}>
        {slides}
      </div>

      {/* Contact — slides in as the next slide when its button is clicked */}
      <div
        ref={panelRef}
        className={"contact-panel" + (contactOpen ? " is-open" : "")}
        aria-hidden={!contactOpen}
      >
        <ContactSection dict={dict} />
      </div>

      {/* Active project info — spread across the bottom; empty fields hidden */}
      <div className={"info" + hidden} key={active}>
        <div className="info-main">
          {current.category && (
            <div className="info-cat">{current.category}</div>
          )}
          {current.title && <h2 className="info-title">{current.title}</h2>}
        </div>
        {(current.client || current.year) && (
          <div className="info-side">
            {current.client && <div className="info-meta">{current.client}</div>}
            {current.year && <div className="info-meta">{current.year}</div>}
          </div>
        )}
      </div>
    </>
  );
}
