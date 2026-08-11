"use client";

import { useActionState, useState } from "react";
import {
  getMyProofSignedUrl,
  uploadProof,
  type UploadProofResult,
} from "./proofActions";

export type ExistingProof = {
  file_path: string;
  uploaded_at: string;
};

/**
 * Subida de comprobante para un pedido. Formulario por pedido.
 *
 * Si el pedido ya tiene un comprobante adjunto se indica, con enlace para
 * verlo, y el formulario pasa a ser de sustitución: solo se admite un
 * archivo por pedido, así que subir otro reemplaza al anterior.
 */
export function ProofUpload({
  orderId,
  existing,
}: {
  orderId: string;
  existing?: ExistingProof | null;
}) {
  const [state, formAction, pending] = useActionState<
    UploadProofResult | null,
    FormData
  >(async (_prev, formData) => uploadProof(formData), null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  async function handleView() {
    if (!existing) return;
    setOpening(true);
    setOpenError(null);
    const result = await getMyProofSignedUrl(existing.file_path);
    setOpening(false);
    if (result.ok) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      setOpenError(result.error);
    }
  }

  return (
    <div className="space-y-2">
      {existing ? (
        <div className="text-xs">
          <p className="text-green-700 font-semibold">Archivo adjuntado ✓</p>
          <p className="text-[var(--text)]/70">
            {new Date(existing.uploaded_at).toLocaleDateString("es-ES")}
          </p>
          <button
            type="button"
            onClick={handleView}
            disabled={opening}
            className="mt-1 underline text-[var(--link)] disabled:opacity-50"
          >
            {opening ? "Abriendo…" : "Ver comprobante"}
          </button>
          {openError && (
            <span className="block text-red-700" role="alert">
              {openError}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-amber-700 font-semibold">
          Sin comprobante adjuntado
        </p>
      )}

      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="order_id" value={orderId} />
        <input
          aria-label={
            existing
              ? "Sustituir comprobante de pago (PDF, JPG o PNG, máx 5MB)"
              : "Comprobante de pago (PDF, JPG o PNG, máx 5MB)"
          }
          name="file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          required
          disabled={pending}
          className="text-xs file:rounded file:border-0 file:bg-[var(--ink)] file:text-white file:px-3 file:py-1 file:mr-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white text-xs font-bold px-3 py-1.5 disabled:opacity-50"
        >
          {pending ? "Subiendo…" : existing ? "Sustituir" : "Subir"}
        </button>
        {state && !state.ok && (
          <span className="text-xs text-red-700" role="alert">
            {state.error}
          </span>
        )}
        {state?.ok && (
          <span className="text-xs text-green-700" role="status">
            Subido ✓
          </span>
        )}
      </form>
    </div>
  );
}
