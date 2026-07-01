// English dictionary — this file is the source of truth for the dictionary
// shape. Every other language must match the `Dictionary` type derived from it.

const en = {
  // SEO — edit freely to refine ranking keywords (see README → SEO).
  seo: {
    title: "Byke — Live Visuals & VJ for Dubstep / Bass Music",
    description:
      "Byke — live visual artist (VJ) crafting reactive visuals for dubstep and bass music shows, clubs and festivals. Aftermovies, reels and live sets.",
    keywords: [
      "Byke",
      "VJ",
      "live visuals",
      "visual artist",
      "dubstep",
      "bass music",
      "festival visuals",
      "concert visuals",
      "VJing",
      "aftermovie",
      "motion design",
    ],
  },
  nav: {
    contact: "Contact",
    home: "Home",
  },
  contact: {
    label: "Booking · Contact",
    title: "Let's light up your show.",
    links: {
      email: "Email",
      instagram: "Instagram",
      vimeo: "Showreel",
    },
    note: "(Placeholder details — replace with the real contact info.)",
  },
};

export default en;

export type Dictionary = typeof en;
