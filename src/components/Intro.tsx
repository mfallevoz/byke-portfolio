"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────
//  INTRO ANIMATION
//
//  Plays the official BYKE logo video full-screen, which is pre-trimmed and
//  already fades to black at the end (see public/intro-byke.mp4). When it
//  finishes, the black overlay fades out → the live site is revealed.
//
//  • Plays once per browser session (sessionStorage) so it isn't repeated on
//    every internal navigation / refresh.
//  • Skipped instantly for users who prefer reduced motion.
//  • Click / tap anywhere (or SKIP) to bypass it.
//  • Resilient: if the video can't load/play, it reveals the site anyway
//    (a hard fallback timer guarantees the overlay never stays stuck).
// ─────────────────────────────────────────────────────────────────────────

const VIDEO_SRC = "/intro-byke.mp4";
const POSTER_SRC = "/intro-byke-poster.jpg";

// Hard fallback (ms): reveal no matter what, in case `ended` never fires
// (autoplay blocked, network stall…). A bit longer than the clip (~5s).
const FALLBACK_MS = 6500;

type Phase = "play" | "reveal" | "gone";

export default function Intro({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase] = useState<Phase>("play");
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);

  // Move to the reveal (overlay fades out), then unmount shortly after.
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    window.sessionStorage.setItem("byke-intro", "1");
    setPhase("reveal");
    onDone?.();
    window.setTimeout(() => setPhase("gone"), 700);
  };

  useEffect(() => {
    const seen = window.sessionStorage.getItem("byke-intro") === "1";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      doneRef.current = true;
      setPhase("gone");
      onDone?.();
      return;
    }

    // Safari/iOS: muted autoplay needs the property set imperatively.
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }

    const fallback = window.setTimeout(finish, FALLBACK_MS);
    return () => window.clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={"intro intro--" + phase}
      role="presentation"
      onClick={finish}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="intro-video"
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
      />

      <button className="intro-skip" onClick={finish} type="button">
        Skip
      </button>
    </div>
  );
}
