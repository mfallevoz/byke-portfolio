// ─────────────────────────────────────────────────────────────────────────
//  PORTFOLIO DATA — TYPES, HELPERS & SEED
//
//  The live project list is no longer hard-coded here: it is edited from the
//  /admin page and persisted to storage (local file in dev, Vercel Blob in
//  prod) as `projects.json`. This file only defines the shape, the title
//  helper, and the SEED used the very first time (when no projects.json exists).
//
//  Every text field is OPTIONAL: empty fields are simply not shown on the site
//  (the cousin can leave some blank on purpose for a minimal look). On upload,
//  the title is pre-filled from the file name; it can then be edited or cleared.
// ─────────────────────────────────────────────────────────────────────────

// What is stored / edited in the admin.
export type StoredProject = {
  id: string;
  title?: string;
  client?: string;
  year?: number;
  category?: string;
  src: string; // video URL (e.g. /videos/x.mp4 in dev, or a Blob URL in prod)
  srcMobile?: string; // lighter, side-cropped (9:16) version for small screens
  poster?: string; // optional poster image URL
};

// What the site consumes (title is a string — empty when blank).
export type Project = StoredProject & { title: string };

// Derive a display title from a video file name (Title Case):
// "sur-le-fil.mp4" → "Sur Le Fil". Used to pre-fill the title on upload.
export function titleFromSrc(src: string): string {
  const file = (src.split("?")[0].split("/").pop() ?? src).trim();
  const base = file.replace(/\.[^.]+$/, "");
  return base
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function resolveProject(p: StoredProject): Project {
  return { ...p, title: p.title ?? "" };
}

// Seed list — only used to initialise storage on first run in DEV.
export const seedProjects: StoredProject[] = [
  {
    id: "showreel",
    title: "Showreel",
    category: "Live Visuals",
    year: 2025,
    src: "/videos/showreel.mp4",
  },
  {
    id: "bass-cathedral",
    title: "Bass Cathedral",
    category: "Festival",
    year: 2025,
    src: "/videos/bass-cathedral.mp4",
  },
  {
    id: "subzero",
    title: "Subzero",
    category: "Club Set",
    year: 2024,
    src: "/videos/subzero.mp4",
  },
];
