"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

/**
 * Login del portal. Supabase Auth email/contraseña.
 * Tras login correcto, redirige al portal (o al ?redirect indicado por middleware).
 */
export function LoginForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") ?? "/portal";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    window.location.href = redirect;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field id="login-email" label="Email" type="email" value={email} onChange={setEmail} required />
      <Field
        id="login-password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={setPassword}
        required
      />
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 disabled:opacity-50"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
      />
    </div>
  );
}
