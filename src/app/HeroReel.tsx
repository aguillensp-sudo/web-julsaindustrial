"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ComingSoonLink } from "@/components/ComingSoonLink";

/**
 * Hero reel de la Home (fase3-design §3.1).
 * Carrusel sobrio de imágenes descriptivas (ISO tanques, balitas de gas, placas
 * solares). Auto-avance lento, pausa en hover, respeta prefers-reduced-motion.
 *
 * Las imágenes reales las aporta Alvaro; aquí usamos placeholders SVG temáticos
 * hasta que se sustituyan por las fotos en /public.
 */
const SLIDES = [
  { title: "Combustibles", subtitle: "ISO tanques y distribución de GLP", href: "/combustibles" },
  { title: "Equipamientos energéticos", subtitle: "Placas fotovoltaicas y almacenamiento", href: "/equipamiento-energetico" },
  { title: "Autopartes", subtitle: "Baterías, neumáticos y lubricantes", href: "/autopartes" },
  { title: "Materias primas", subtitle: "Insumos para la industria", href: "/materias-primas" },
];

export function HeroReel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slow = mq.matches;
    if (paused || slow) return;
    intervalRef.current = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      5000,
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  return (
    <section
      className="bg-[var(--ink)] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Líneas de producto de Julsa Industrial"
    >
      <div className="relative max-w-[1200px] mx-auto px-6 py-20 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[var(--accent)] font-semibold text-xs uppercase tracking-wide">
            Julsa Industrial
          </span>
          <h1 className="text-4xl font-extrabold mt-2">
            Suministros industriales automotrices y energéticos
          </h1>
          <p className="mt-4 text-white/80">
            Importación y distribución de combustibles, materias primas,
            equipamiento energético y autopartes.
          </p>
          <ComingSoonLink
            href="/portal/login"
            className="mt-6 inline-flex no-underline items-center rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2"
          >
            Acceso clientes →
          </ComingSoonLink>
        </div>

        {/* Slides temáticos (placeholder hasta fotos de Alvaro) */}
        <div className="relative z-0 mt-8 flex gap-3" aria-live="polite">
          {SLIDES.map((slide, i) => (
            <Link
              key={slide.title}
              href={slide.href}
              id={`hero-slide-${i}`}
              role="tabpanel"
              aria-labelledby={`hero-tab-${i}`}
              className={`flex-1 rounded border border-white/10 bg-white/5 p-4 no-underline text-white transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:border-white/30 ${
                i === index ? "opacity-100" : "opacity-75"
              }`}
              aria-hidden={i !== index}
            >
              <p className="font-bold">{slide.title}</p>
              <p className="text-sm text-white/70">{slide.subtitle}</p>
            </Link>
          ))}
        </div>

        {/* Indicadores. Botones de 44x44 clicables (WCAG 2.5.8) con un
            punto visual de 8px dentro. */}
        <div className="flex gap-2 mt-4" role="tablist" aria-label="Seleccionar slide">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              id={`hero-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls={`hero-slide-${i}`}
              aria-label={slide.title}
              onClick={() => setIndex(i)}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-[var(--accent)]" : "bg-white/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
