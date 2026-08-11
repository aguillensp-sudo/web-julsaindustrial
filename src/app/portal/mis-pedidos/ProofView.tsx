"use client";

import { useState } from "react";
import { getMyProofSignedUrl } from "./proofActions";
import type { ExistingProof } from "./ProofUpload";

/** Enlace de solo lectura al comprobante ya adjuntado (pedido ya verificado). */
export function ProofView({ proof }: { proof: ExistingProof }) {
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  async function handleView() {
    setOpening(true);
    setError(null);
    const result = await getMyProofSignedUrl(proof.file_path);
    setOpening(false);
    if (result.ok) window.open(result.url, "_blank", "noopener,noreferrer");
    else setError(result.error);
  }

  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={handleView}
        disabled={opening}
        className="underline text-[var(--link)] disabled:opacity-50"
      >
        {opening ? "Abriendo…" : "Ver comprobante"}
      </button>
      {error && (
        <span className="block text-red-700" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
