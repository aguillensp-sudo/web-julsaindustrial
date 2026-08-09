"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Formulario de contacto público (fase2-define-spec §2 / fase3 §3.3).
 * Campos: Nombre, Teléfono, Email, Mensaje. Anti-spam por honeypot + validación
 * básica en cliente. El envío real (email/CRM) se cablea en Hito 4 con un
 * route handler server-side que vuelve a validar.
 */
type Status = "idle" | "submitting" | "ok" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot: si el campo oculto viene relleno, es un bot.
    if ((data.get("company") as string)?.trim()) {
      setStatus("ok"); // silently succeed without sending
      form.reset();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Honeypot anti-spam: oculto a humanos, visible a bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          No rellenar
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Nombre" name="name" type="text" required />
      <Field label="Teléfono" name="phone" type="tel" />
      <Field label="Email" name="email" type="email" required />
      <div>
        <label htmlFor="message" className="block text-sm font-semibold mb-1">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)]"
        />
      </div>
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Enviando…" : "Enviar"}
      </Button>

      {status === "ok" && (
        <p className="text-sm text-green-700" role="status">
          Mensaje enviado. Le responderemos a la mayor brevedad.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-700" role="status">
          No se pudo enviar el mensaje. Inténtelo de nuevo o escríbanos a nuestro
          teléfono.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold mb-1">
        {label}
        {required && <span className="text-[var(--accent)]"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] focus:border-[var(--accent)]"
      />
    </div>
  );
}
