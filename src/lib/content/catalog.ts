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

export interface CatalogItem {
  slug: string; // identificador para el portal
  line: ProductLine;
  name: string;
  description: string;
  specs?: string[]; // especificaciones técnicas (datos, no precio)
  /** "icon" → elige el coder (Combustibles); "photo" → aporte de Alvaro. */
  visual: "icon" | "photo";
  iconName?: string; // clave de icono si visual === "icon"
}

export const CATALOG: CatalogItem[] = [
  // Combustibles — iconos
  {
    slug: "gasolina",
    line: "fuels",
    name: "Gasolina",
    description: "Combustible líquido para vehículos y maquinaria.",
    visual: "icon",
    iconName: "fuel",
  },
  {
    slug: "petroleo",
    line: "fuels",
    name: "Petróleo",
    description: "Diésel para transporte pesado y generación.",
    visual: "icon",
    iconName: "droplet",
  },
  {
    slug: "balitas-gas",
    line: "fuels",
    name: "Balitas de gas",
    description: "GLP envasado para uso doméstico y comercial.",
    visual: "icon",
    iconName: "gas",
  },

  // Equipamiento energético — fotos Alvaro
  {
    slug: "placas-solares",
    line: "energy",
    name: "Placas solares",
    description: "Paneles fotovoltaicos monocristalinos bifaciales.",
    specs: ["630 W", "Monocristalino bifacial"],
    visual: "photo",
  },
  {
    slug: "baterias",
    line: "energy",
    name: "Baterías",
    description: "Almacenamiento de energía para sistemas solares.",
    specs: ["Desde 2,5 kWh", "Hasta 15 kWh"],
    visual: "photo",
  },
  {
    slug: "inversores",
    line: "energy",
    name: "Inversores",
    description: "Conversión de corriente para conexión de paneles.",
    specs: ["Desde 600 W", "Hasta 10 kW"],
    visual: "photo",
  },

  // Autopartes — fotos Alvaro
  {
    slug: "baterias-auto",
    line: "autoparts",
    name: "Baterías",
    description: "Baterías de arranque para vehículos.",
    visual: "photo",
  },
  {
    slug: "neumaticos",
    line: "autoparts",
    name: "Neumáticos",
    description: "Neumáticos para vehículos ligeros y pesados.",
    visual: "photo",
  },
  {
    slug: "lubricantes",
    line: "autoparts",
    name: "Lubricantes",
    description: "Aceites y lubricantes para motor e industria.",
    visual: "photo",
  },

  // Materias primas — fotos Alvaro
  {
    slug: "silo-manganeso",
    line: "raw_materials",
    name: "Sílico manganeso",
    description: "Aleación para la industria siderúrgica.",
    visual: "photo",
  },
  {
    slug: "ferrosilicio",
    line: "raw_materials",
    name: "Ferrosilicio",
    description: "Aleación ferroaleante para acerías.",
    visual: "photo",
  },
  {
    slug: "electrodos-grafito",
    line: "raw_materials",
    name: "Electrodos de grafito",
    description: "Electrodos para hornos eléctricos de acería.",
    visual: "photo",
  },
  {
    slug: "pulpa-celulosa",
    line: "raw_materials",
    name: "Pulpa de celulosa",
    description: "Materia prima para la industria del papel.",
    visual: "photo",
  },
  {
    slug: "trotman",
    line: "raw_materials",
    name: "Trotman",
    description: "Pendiente de confirmación de contenido (Alvaro).",
    visual: "photo",
  },
];

export const LINE_META: Record<
  ProductLine,
  { title: string; href: string; blurb: string }
> = {
  fuels: {
    title: "Combustibles",
    href: "/combustibles",
    blurb: "Gasolina, petróleo y balitas de gas para uso industrial y comercial.",
  },
  energy: {
    title: "Equipamiento energético",
    href: "/equipamiento-energetico",
    blurb: "Placas solares, baterías e inversores para generación y almacenamiento.",
  },
  autoparts: {
    title: "Autopartes",
    href: "/autopartes",
    blurb: "Baterías, neumáticos y lubricantes para vehículo.",
  },
  raw_materials: {
    title: "Materias primas",
    href: "/materias-primas",
    blurb: "Insumos para acerías e industrias del papel.",
  },
};

export function itemsByLine(line: ProductLine): CatalogItem[] {
  return CATALOG.filter((item) => item.line === line);
}
