import type { MetadataRoute } from "next";

const BASE = "https://opportuniq.app";

/**
 * Robots.txt: allow public marketing/legal/product pages;
 * disallow app, auth, admin, API, and invite/join flows.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/auth",
          "/api",
          "/invite",
          "/join",
          "/onboarding",
          "/banned",
          "/demo",
          "/redesign",
          "/case-study/",
          "/new-landing",
          "/marketing-landing-page",
          "/logo-concepts",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/auth",
          "/api",
          "/invite",
          "/join",
          "/onboarding",
          "/banned",
          "/demo",
          "/redesign",
          "/case-study/",
          "/new-landing",
          "/marketing-landing-page",
          "/logo-concepts",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
