"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { registerCustomer } from "./registerActions";

/**
 * Registro de cliente. Auto-registro con verificación de email.
 * Pide datos de empresa que van como user_metadata; el trigger handle_new_user
 * los lee para crear la fila en customers con status='active'.
 *
 * Razón social, persona de contacto, email y contraseña son obligatorios: el
 * botón permanece deshabilitado hasta que están informados y el email es válido.
 * El campo "Ubicación / sede" está oculto de momento (se sigue enviando a
 * Supabase, vacío, para no romper el flujo cuando se reactive).
 *
 * El alta la hace un server action con la clave de servicio: el auto-registro
 * por email dependía del correo de confirmación de Supabase, limitado a unos
 * pocos envíos por hora, y fallaba en producción. Creada la cuenta, se inicia
 * sesión con las mismas credenciales y se entra directo al portal.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function RegisterForm() {
  const router = useRouter();
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

  const emailValid = EMAIL_RE.test(form.email.trim());
  const canSubmit =
    form.company_name.trim().length > 0 &&
    form.contact_name.trim().length > 0 &&
    emailValid &&
    form.password.length >= 8;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!emailValid) {
      setError("Introduzca un email válido.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.set("company_name", form.company_name);
    formData.set("contact_name", form.contact_name);
    formData.set("email", form.email);
    formData.set("password", form.password);
    formData.set("phone", form.phone);
    formData.set("location", form.location);

    const result = await registerCustomer(formData);
    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }

    // Cuenta creada: se entra directamente con las credenciales recién dadas.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);
    if (signInError) {
      // La cuenta existe; solo falló el acceso automático.
      setDone(true);
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  if (done) {
    return (
      <div className="space-y-3" role="status">
        <p className="font-bold text-green-700">Cuenta creada.</p>
        <p className="text-sm">
          Ya puede acceder al portal con su email y su contraseña.
        </p>
        <a href="/portal/login" className="text-[15px] no-underline">
          Ir a acceder →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <p className="text-xs text-[var(--text)]/70">
        Los campos marcados con <span aria-hidden="true">*</span> son
        obligatorios.
      </p>
      <Field
        id="register-company-name"
        label="Razón social"
        value={form.company_name}
        onChange={(v) => set("company_name", v)}
        required
      />
      <Field
        id="register-contact-name"
        label="Persona de contacto"
        value={form.contact_name}
        onChange={(v) => set("contact_name", v)}
        required
      />
      <Field
        id="register-email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => set("email", v)}
        required
        error={
          form.email.length > 0 && !emailValid
            ? "Introduzca un email válido (ejemplo: nombre@empresa.com)."
            : undefined
        }
      />
      <Field
        id="register-phone"
        label="Teléfono"
        type="tel"
        value={form.phone}
        onChange={(v) => set("phone", v)}
      />
      {/* Ubicación / sede oculta de momento; se sigue enviando a Supabase. */}
      <input type="hidden" name="location" value={form.location} />
      <Field
        id="register-password"
        label="Contraseña (mín. 8 caracteres)"
        type="password"
        value={form.password}
        onChange={(v) => set("password", v)}
        required
      />
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1">
        {label}
        {required && (
          <span className="text-red-700 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
      />
      {error && (
        <p className="text-xs text-red-700 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
