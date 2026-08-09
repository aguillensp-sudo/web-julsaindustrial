"use client";

import { useSyncExternalStore } from "react";

/**
 * Signature element — Red de distribución de Cuba (fase3-design §2).
 *
 * Mapa SVG estilizado de Cuba con 5 emplazamientos reales de Julsa como nodos
 * naranja, unidos por rutas de distribución en hairline. Un pulso sutil recorre
 * las rutas representando el flujo de suministro.
 *
 * No es decoración: codifica la red logística real de Julsa. El movimiento es
 * literal (la empresa distribuye). Si el pulso distrae, se reduce a estático.
 *
 * Accesibilidad:
 * - prefers-reduced-motion → el pulso se detiene (nodos/rutas estáticos).
 * - Cada nodo tiene aria-label con la ciudad; la lista textual siempre visible
 *   (dual encoding: el mapa nunca es la única fuente de la información).
 */

interface Node {
  id: string;
  label: string;
  // Coordenadas en el viewBox 0..600 x 0..300 (estilizado, no a escala).
  x: number;
  y: number;
}

const NODES: Node[] = [
  { id: "habana", label: "La Habana", x: 120, y: 120 },
  { id: "cinfuegos", label: "Cienfuegos", x: 230, y: 165 },
  { id: "camaguey", label: "Camagüey", x: 360, y: 140 },
  { id: "holguin", label: "Holguín", x: 470, y: 120 },
  { id: "bayamo", label: "Bayamo", x: 450, y: 180 },
];

// Rutas: La Habana como hub → resto de nodos.
const ROUTES: [string, string][] = [
  ["habana", "cinfuegos"],
  ["cinfuegos", "camaguey"],
  ["camaguey", "holguin"],
  ["camaguey", "bayamo"],
];

function nodeById(id: string): Node {
  return NODES.find((n) => n.id === id)!;
}

// Suscripción idiomática a prefers-reduced-motion sin setState-in-effect.
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribePrefersReducedMotion(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot(): boolean {
  return typeof window !== "undefined"
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false;
}
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export function DistributionMap({ compact = false }: { compact?: boolean }) {
  const reducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  return (
    <div role="group" aria-label="Red de distribución de Julsa en Cuba">
      <svg
        viewBox="0 0 600 300"
        className="w-full h-auto"
        aria-hidden="true"
      >
        {/* Silueta estilizada de Cuba (forma simplificada, no cartográfica) */}
        <path
          d="M70 150 Q90 110 130 115 Q170 100 220 130 Q280 150 330 135 Q400 115 470 110 Q520 110 545 125 L555 140 Q545 155 510 160 Q470 175 430 175 Q420 200 400 205 Q370 210 360 185 Q330 175 300 180 Q260 185 230 185 Q190 175 160 175 Q120 170 90 165 Z"
          fill="var(--bg)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* Rutas de distribución */}
        <g stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.6">
          {ROUTES.map(([a, b]) => {
            const na = nodeById(a);
            const nb = nodeById(b);
            return (
              <line
                key={`${a}-${b}`}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                strokeDasharray={reducedMotion ? undefined : "4 4"}
              >
                {!reducedMotion && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="16"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
            );
          })}
        </g>

        {/* Nodos */}
        <g>
          {NODES.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={5}
                fill="var(--accent)"
                stroke="white"
                strokeWidth="1.5"
              />
              <text
                x={node.x}
                y={node.y - 10}
                textAnchor="middle"
                fontSize={compact ? 9 : 11}
                fill="var(--text)"
                fontWeight={600}
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Dual encoding: lista textual accesible (siempre visible) */}
      <ul className={`flex flex-wrap gap-x-4 gap-y-1 ${compact ? "text-xs" : "text-sm"} text-[var(--text)] mt-2`}>
        {NODES.map((n) => (
          <li key={n.id} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
              aria-hidden="true"
            />
            {n.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
