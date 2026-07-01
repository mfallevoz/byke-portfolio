import type { Metadata } from "next";
import Carousel from "@/components/Carousel";
import Intro from "@/components/Intro";
import { getDictionary } from "@/i18n";
import { defaultLocale } from "@/i18n/config";
import { getProjects } from "@/lib/projects";
import { site, sameAs } from "@/config";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic"; // project list is editable at runtime

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = getDictionary(defaultLocale);
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: siteUrl },
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
      url: siteUrl,
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function HomePage() {
  const dict = getDictionary(defaultLocale);
  const projects = await getProjects();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: siteUrl,
    jobTitle: site.jobTitle,
    email: `mailto:${site.email}`,
    sameAs,
    knowsAbout: [
      "Live visuals",
      "VJing",
      "Dubstep",
      "Bass music",
      "Festival visuals",
      "Motion design",
      "Video editing",
    ],
    address: { "@type": "PostalAddress", addressCountry: site.country },
  };

  const structuredData = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );

  if (projects.length === 0) {
    return (
      <main className="landing">
        <Intro />
        {structuredData}
        <div className="landing-inner">
          <div className="landing-name">{site.wordmark}</div>
          <div className="landing-role">{site.role}</div>
          <p className="landing-empty">
            No videos yet — add them from <code>/admin</code>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Intro />
      {structuredData}
      <Carousel dict={dict} locale={defaultLocale} projects={projects} />
    </>
  );
}
