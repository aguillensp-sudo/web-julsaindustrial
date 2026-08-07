import type { MetadataRoute } from "next";

const BASE = "https://julsaindustrial.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/portal", "/admin", "/api"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
