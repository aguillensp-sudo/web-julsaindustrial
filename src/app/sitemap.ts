import type { MetadataRoute } from "next";

/**
 * sitemap.xml — SEO on-page (fase2-define-spec §4). Solo zona pública; las
 * rutas /portal y /admin son privadas y no se indexan.
 */
const BASE = "https://julsaindustrial.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/nosotros",
    "/combustibles",
    "/equipamiento-energetico",
    "/autopartes",
    "/materias-primas",
    "/contacto",
  ];
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
