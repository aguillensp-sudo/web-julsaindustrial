"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function RecoverForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/portal/actualizar-password`,
    });
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <p className="text-sm" role="status">
        Si existe una cuenta con ese email, recibirá un mensaje para restablecer
        su contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="recover-email" className="block text-sm font-semibold mb-1">
          Email
        </label>
        <input
          id="recover-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Enviar enlace"}
      </button>
    </form>
  );
}
