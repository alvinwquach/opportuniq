import type { Metadata } from "next";

const SITE_NAME = "OpportunIQ";
const BASE_URL = "https://opportuniq.app";
const DEFAULT_DESCRIPTION =
  "Expert guidance for every home and auto decision. Know if it's safe, risky, or urgent. Compare costs, find pros, track projects with family—in any language.";

/** JSON-LD Organization for rich results (e.g. knowledge panel). */
export const structuredDataOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/og-image.png`,
  description: DEFAULT_DESCRIPTION,
  sameAs: ["https://twitter.com/opportuniq"],
} as const;

/** JSON-LD WebSite for sitelinks search box and rich results. */
export const structuredDataWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: BASE_URL,
  description: DEFAULT_DESCRIPTION,
  publisher: { "@id": `${BASE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/dashboard?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

/** Organization with @id for WebSite publisher reference. */
export const structuredDataOrganizationWithId = {
  ...structuredDataOrganization,
  "@id": `${BASE_URL}/#organization`,
} as const;

/**
 * Array of JSON-LD objects to inject in the document (Organization + WebSite).
 * Render in root layout as: <script type="application/ld+json">{JSON.stringify(getStructuredData())}</script>
 */
export function getStructuredData(): object[] {
  return [
    structuredDataOrganizationWithId,
    structuredDataWebSite,
  ];
}

export interface PageMetaOptions {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

/**
 * Build metadata for a page. Use in export const metadata or generateMetadata.
 * Ensures metadataBase, openGraph, and twitter are consistent.
 */
export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  noIndex = false,
}: PageMetaOptions): Metadata {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = path ? `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}` : BASE_URL;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: path ? { canonical: url } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      creator: "@opportuniq",
    },
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}
