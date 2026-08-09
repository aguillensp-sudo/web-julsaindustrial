"use client";

import { useActionState } from "react";
import { uploadProof, type UploadProofResult } from "./proofActions";

/**
 * Subida de comprobante para un pedido. Formulario por pedido.
 */
export function ProofUpload({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState<
    UploadProofResult | null,
    FormData
  >(async (_prev, formData) => uploadProof(formData), null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="order_id" value={orderId} />
      <input
        aria-label="Comprobante de pago (PDF, JPG o PNG, máx 5MB)"
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
        {pending ? "Subiendo…" : "Subir"}
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
  );
}
