"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero reel de la Home (fase3-design §3.1).
 * Carrusel sobrio de imágenes descriptivas (ISO tanques, balitas de gas, placas
 * solares). Auto-avance lento, pausa en hover, respeta prefers-reduced-motion.
 *
 * Las imágenes reales las aporta Alvaro; aquí usamos placeholders SVG temáticos
 * hasta que se sustituyan por las fotos en /public.
 */
const SLIDES = [
  { title: "Combustibles", subtitle: "ISO tanques y distribución de GLP" },
  { title: "Energía solar", subtitle: "Placas fotovoltaicas y almacenamiento" },
  { title: "Materias primas", subtitle: "Insumos para la industria" },
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
      aria-roledescription="carousel"
      aria-label="Líneas de producto de Julsa Industrial"
    >
      <div className="relative max-w-[1200px] mx-auto px-6 py-20 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[var(--accent)] font-semibold text-xs uppercase tracking-wide">
            Julsa Industrial
          </span>
          <h1 className="text-4xl font-extrabold mt-2">
            Suministro industrial y energético para Cuba
          </h1>
          <p className="mt-4 text-white/80">
            Importación y distribución de combustibles, materias primas,
            equipamiento energético y autopartes. Empresa española radicada en
            Cuba desde 2010.
          </p>
          <a
            href="/portal/login"
            className="mt-6 inline-flex no-underline items-center rounded bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-bold px-5 py-2"
          >
            Acceso clientes →
          </a>
        </div>

        {/* Slides temáticos (placeholder hasta fotos de Alvaro) */}
        <div className="relative z-0 mt-8 flex gap-3" aria-live="polite">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.title}
              className={`flex-1 rounded border border-white/10 bg-white/5 p-4 transition-opacity ${
                i === index ? "opacity-100" : "opacity-40"
              }`}
              aria-hidden={i !== index}
            >
              <p className="font-bold">{slide.title}</p>
              <p className="text-sm text-white/70">{slide.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Indicadores */}
        <div className="flex gap-2 mt-4" role="tablist" aria-label="Seleccionar slide">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={slide.title}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-[var(--accent)]" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
