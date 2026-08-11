"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

/**
 * Establece una contraseña nueva. Se llega aquí desde el email de
 * recuperación, que pasa por /auth/callback y deja una sesión de recovery
 * activa; con ella updateUser puede cambiar la contraseña.
 */
export function ResetPasswordForm() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== repeat) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(
        "No se pudo cambiar la contraseña. El enlace puede haber caducado; solicite uno nuevo.",
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-3" role="status">
        <p className="font-bold text-green-700">Contraseña actualizada.</p>
        <p className="text-base">
          <a href="/portal" className="no-underline">
            Ir a mi área personal →
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="new-password" className="block text-sm font-semibold mb-1">
          Nueva contraseña (mín. 8 caracteres)
        </label>
        <input
          id="new-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
        />
      </div>
      <div>
        <label htmlFor="repeat-password" className="block text-sm font-semibold mb-1">
          Repita la contraseña
        </label>
        <input
          id="repeat-password"
          type="password"
          required
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
        />
      </div>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || password.length === 0}
        className="w-full rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
