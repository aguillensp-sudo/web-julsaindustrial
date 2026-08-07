"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

/**
 * Registro de cliente. Auto-registro con verificación de email.
 * Pide datos de empresa que van como user_metadata; el trigger handle_new_user
 * los lee para crear la fila en customers con status='active'.
 *
 * Tras signup, Supabase envía email de confirmación; el acceso se completa al
 * confirmar (email confirmation habilitado en el panel de Auth).
 */
export function RegisterForm() {
  const supabase = createClient();
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          company_name: form.company_name,
          contact_name: form.contact_name,
          phone: form.phone,
          location: form.location,
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(translateError(error.message));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-3" role="status">
        <p className="font-bold text-green-700">Cuenta creada.</p>
        <p className="text-sm">
          Le hemos enviado un email de confirmación. Haga clic en el enlace del
          correo para activar su cuenta y acceder al portal.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Razón social" value={form.company_name} onChange={(v) => set("company_name", v)} required />
      <Field label="Persona de contacto" value={form.contact_name} onChange={(v) => set("contact_name", v)} required />
      <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} required />
      <Field label="Teléfono" value={form.phone} onChange={(v) => set("phone", v)} />
      <Field label="Ubicación / sede" value={form.location} onChange={(v) => set("location", v)} />
      <Field label="Contraseña (mín. 8 caracteres)" type="password" value={form.password} onChange={(v) => set("password", v)} required />
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-bold px-5 py-2 disabled:opacity-50"
      >
        {loading ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] outline-none"
      />
    </div>
  );
}

function translateError(message: string): string {
  if (message.includes("already registered") || message.includes("already been"))
    return "Ya existe una cuenta con ese email.";
  if (message.includes("Password")) return "La contraseña no cumple los requisitos.";
  return "No se pudo crear la cuenta. Inténtelo de nuevo.";
}
