/**
 * Datos sembrados del catálogo público (Hito 2).
 * Contenido derivado de `Definiciones Previas.md`. Cuando exista el panel admin
 * (Hito 4), estos datos pasarán a Supabase; mientras tanto viven en el repo
 * como fuente para la zona pública y el portal.
 *
 * NOTA: sin precios aquí. El precio es privado (visible solo en portal autenticado).
 * Los `specs` son información técnica del producto, pública.
 */
import type { ProductLine } from "@/lib/db/types";

export interface CatalogLink {
  label: string;
  href: string;
}

export interface CatalogItem {
  slug: string; // identificador para el portal
  line: ProductLine;
  name: string;
  description: string;
  specs?: string[]; // especificaciones técnicas (datos, no precio)
  /** "icon" → elige el coder (Combustibles); "photo" → aporte de Alvaro; "image" → foto real en /public/images. */
  visual: "icon" | "photo" | "image";
  iconName?: string; // clave de icono si visual === "icon"
  imageSrc?: string; // ruta pública si visual === "image"
  links?: CatalogLink[]; // enlaces a fichas técnicas / catálogos PDF, abren en nueva pestaña
  /** Enlace interno opcional: convierte la tarjeta completa en un link de navegación. */
  pageHref?: string;
}

export const CATALOG: CatalogItem[] = [
  // Combustibles — iconos
  {
    slug: "gasolina",
    line: "fuels",
    name: "Gasolina",
    description: "Combustible líquido para vehículos y maquinaria.",
    visual: "image",
    imageSrc: "/images/gasolina.webp",
  },
  {
    slug: "petroleo",
    line: "fuels",
    name: "Petróleo",
    description: "Diésel para transporte pesado y generación.",
    visual: "image",
    imageSrc: "/images/petroleo.jpg",
  },
  {
    slug: "balitas-gas",
    line: "fuels",
    name: "Balitas de gas",
    description: "GLP envasado para uso doméstico y comercial.",
    visual: "image",
    imageSrc: "/images/balitas_gas.jpg",
  },

  // Equipamiento energético — fotos Alvaro
  {
    slug: "placas-solares",
    line: "energy",
    name: "Paneles Solares",
    description: "Paneles fotovoltaicos monocristalinos bifaciales.",
    specs: ["630 W"],
    visual: "image",
    imageSrc: "/images/panel_solar.jpg",
    links: [{ label: "Ver ficha técnica", href: "/docs/ficha_tecnica_skymax.pdf" }],
  },
  {
    slug: "baterias",
    line: "energy",
    name: "Baterías",
    description: "Almacenamiento de energía para sistemas solares.",
    specs: ["Desde 2,5 kWh", "Hasta 15 kWh"],
    visual: "image",
    imageSrc: "/images/bateria_solar.webp",
  },
  {
    slug: "inversores",
    line: "energy",
    name: "Inversores",
    description: "Conversión de corriente para conexión de paneles.",
    specs: ["Desde 600 W", "Hasta 10 kW"],
    visual: "image",
    imageSrc: "/images/Inversor-Solar.png",
  },

  // Autopartes — fotos Alvaro
  {
    slug: "baterias-auto",
    line: "autoparts",
    name: "Baterías",
    description: "Baterías de arranque para vehículos.",
    visual: "image",
    imageSrc: "/images/bateria.webp",
    links: [
      { label: "Ver catálogo", href: "/docs/CATALOGO-VT-BATTERIES-AMERICA-ESP.pdf" },
    ],
  },
  {
    slug: "neumaticos",
    line: "autoparts",
    name: "Neumáticos",
    description: "Neumáticos para vehículos ligeros y pesados.",
    visual: "image",
    imageSrc: "/images/neumatico.webp",
    links: [{ label: "Ver catálogo", href: "/docs/DK_catalogue.pdf" }],
  },
  {
    slug: "lubricantes",
    line: "autoparts",
    name: "Lubricantes",
    description:
      "Aceites, lubricantes y productos químicos para motores de vehículos y maquinaria industrial.",
    visual: "image",
    imageSrc: "/images/andel.webp",
    links: [
      { label: "Ver catálogo Lubricantes", href: "/docs/catalogo-lubricantes-andel.pdf" },
      { label: "Ver catálogo Químicos", href: "/docs/catalogo-quimicos-andel.pdf" },
    ],
  },

  // Materias primas — fotos Alvaro
  {
    slug: "pulpa-celulosa",
    line: "raw_materials",
    name: "Pulpa de celulosa",
    description: "Materia prima para la industria del papel.",
    visual: "image",
    imageSrc: "/images/pulpa1.png",
    pageHref: "/materias-primas/pulpa-de-celulosa",
  },
  {
    slug: "electrodos-grafito",
    line: "raw_materials",
    name: "Electrodos de grafito",
    description: "Electrodos para hornos eléctricos de acería.",
    visual: "image",
    imageSrc: "/images/electrodografito.jpg",
  },
  {
    slug: "silo-manganeso",
    line: "raw_materials",
    name: "Sílico manganeso",
    description: "Aleación para la industria siderúrgica.",
    visual: "image",
    imageSrc: "/images/silicomanganeso.jpg",
  },
  {
    slug: "ferrosilicio",
    line: "raw_materials",
    name: "Ferrosilicio",
    description: "Aleación ferroaleante para acerías.",
    visual: "image",
    imageSrc: "/images/ferrosilicio.jpg",
  },
];

export const LINE_META: Record<
  ProductLine,
  { title: string; href: string; blurb: string; cardBlurb: string }
> = {
  fuels: {
    title: "Combustibles",
    href: "/combustibles",
    blurb: "Gasolina, petróleo y balitas de gas para uso industrial y comercial.",
    cardBlurb: "Gasolina, petróleo y balitas de gas para uso industrial y comercial.",
  },
  energy: {
    title: "Equipamientos energéticos",
    href: "/equipamiento-energetico",
    blurb:
      "Suministramos y comercializamos paneles solares, baterías e inversores para generación y almacenamiento de energía. Contamos con stock permanente en nuestras instalaciones para un servicio tanto a particulares como mayoristas.",
    cardBlurb: "Paneles solares, baterías e inversores para generación y almacenamiento de energía",
  },
  autoparts: {
    title: "Autopartes",
    href: "/autopartes",
    blurb:
      "Somos distribuidores oficiales de la marca VT Batteries que cuenta con una gama de baterías para vehículos desde 45A hasta 220 A ofreciendo una calidad excepcional con un precio competitivo. Asimismo distribuimos la marca Double King con una gama amplia en neumáticos para carros, camiones y tractores. Completamos nuestra oferta automotriz con una variada gama de lubricantes y productos químicos de la marca Andel Automoción que garantizan un rendimiento óptimo y protección para el motor y el vehículo.",
    cardBlurb: "Descubra nuestra oferta para vehículos automotrices de la mano de VT Batteries y Andel Automoción.",
  },
  raw_materials: {
    title: "Materias primas",
    href: "/materias-primas",
    blurb: "Insumos para acerías e industrias del papel.",
    cardBlurb: "Insumos para acerías e industrias del papel.",
  },
};

export function itemsByLine(line: ProductLine): CatalogItem[] {
  return CATALOG.filter((item) => item.line === line);
}
