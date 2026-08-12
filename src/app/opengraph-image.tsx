import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Julsa Industrial — Suministro industrial y energético";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagen social (Open Graph / Twitter) generada en build. Se sirve desde
 * /opengraph-image y Next la enlaza automáticamente en <head>.
 */
export default async function Image() {
  let logoSrc = "";
  try {
    const logo = await readFile(
      join(process.cwd(), "public", "images", "logo-julsa.png"),
    );
    logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  } catch {
    // Sin logo no bloqueamos la generación de la imagen.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
          color: "#111",
          fontFamily: "sans-serif",
        }}
      >
        {logoSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            width={240}
            height={158}
            alt="Julsa Industrial"
            style={{ objectFit: "contain" }}
          />
        )}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            marginTop: logoSrc ? 24 : 0,
          }}
        >
          Julsa Industrial
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#b5520a",
            marginTop: 12,
            textAlign: "center",
            padding: "0 48px",
          }}
        >
          Suministro industrial y energético desde 2010
        </div>
      </div>
    ),
    size,
  );
}
