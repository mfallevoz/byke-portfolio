"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A full-screen carousel slide — natively hosted video (<video>).
 *
 * Lazy-loading: the source is only loaded once the slide approaches the
 * viewport (rootMargin), which avoids overwhelming the browser when every
 * carousel copy is rendered at once. Once loaded, it stays mounted.
 *
 * The video is muted, looping, and starts playing the moment any part of it
 * enters the viewport (pauses only once it's fully off-screen).
 */
export default function VideoSlide({
  src,
  srcMobile,
  poster,
  onEnded,
}: {
  src: string;
  srcMobile?: string;
  poster?: string;
  onEnded?: () => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleRef = useRef(false);
  const [load, setLoad] = useState(false);

  // Keep the latest onEnded without re-subscribing the observers.
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  // On small screens, load the lighter cropped version when one exists.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const effectiveSrc = isMobile && srcMobile ? srcMobile : src;

  // Safari blocks autoplay unless the element is muted *at the moment* play()
  // is called — and React doesn't reliably set the `muted` property. So we set
  // it imperatively and retry once if WebKit still rejects the first attempt.
  const playSafe = (v: HTMLVideoElement) => {
    v.muted = true;
    v.play().catch(() => {
      v.muted = true;
      setTimeout(() => {
        if (visibleRef.current) v.play().catch(() => {});
      }, 120);
    });
  };

  // Force the muted property on mount (Safari autoplay requirement).
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.setAttribute("muted", "");
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Preload the source a bit before the slide reaches the viewport.
    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "150% 0px 150% 0px" }
    );
    loadObserver.observe(root);

    // Only the slide that fills most of the viewport is "active" and plays.
    // Off-screen slides are still loaded (see loadObserver above) but stay
    // paused — so a video the user can't see never plays, and only the active
    // one's `ended` event can advance the carousel.
    const playObserver = new IntersectionObserver(
      (entries) => {
        const active = (entries[0]?.intersectionRatio ?? 0) >= 0.6;
        visibleRef.current = active;
        const v = videoRef.current;
        if (!v) return;
        if (active) {
          // If it had already played through, rewind so it plays in full again
          // (videos no longer loop — they advance on end). A mid-play video
          // keeps its position.
          if (v.ended) {
            try {
              v.currentTime = 0;
            } catch {
              /* not ready yet */
            }
          }
          playSafe(v);
        } else v.pause();
      },
      { threshold: [0, 0.6, 1] }
    );
    playObserver.observe(root);

    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  // Resume playback once the video is ready (the IO may have fired earlier).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => {
      if (visibleRef.current) playSafe(v);
    };
    v.addEventListener("canplay", onReady);
    v.addEventListener("loadeddata", onReady);
    // Safari doesn't always begin loading a source set dynamically in JS —
    // an explicit load() kicks it off so the ready events actually fire.
    // Also re-runs if the chosen source switches (desktop ↔ mobile).
    if (load) v.load();
    return () => {
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("loadeddata", onReady);
    };
  }, [load, effectiveSrc]);

  // Safety net: if the browser blocked autoplay, the first user gesture
  // anywhere unlocks playback of the visible video (muted play is allowed then).
  useEffect(() => {
    const unlock = () => {
      const v = videoRef.current;
      if (v && visibleRef.current) playSafe(v);
    };
    const events = ["pointerdown", "touchstart", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, []);

  return (
    <section className="slide" ref={rootRef}>
      <video
        ref={videoRef}
        className="slide-media"
        src={load ? effectiveSrc : undefined}
        poster={poster}
        muted
        playsInline
        preload="auto"
        onEnded={() => {
          if (visibleRef.current) onEndedRef.current?.();
        }}
      />
      <div className="slide-vignette" />
    </section>
  );
}
