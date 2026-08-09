import { describe, it, expect } from "vitest";
import { POST } from "./route";

function createContactForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  form.set("name", "Juan Pérez");
  form.set("email", "juan@example.com");
  form.set("message", "Mensaje de prueba suficientemente largo");
  for (const [key, value] of Object.entries(overrides)) {
    form.set(key, value);
  }
  return form;
}

function createRequest(form: FormData) {
  return new Request("http://localhost/api/contacto", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/contacto", () => {
  it("returns 200 with ok true for valid form data", async () => {
    const request = createRequest(createContactForm());
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
  });

  it("returns 422 when name is too short", async () => {
    const form = createContactForm({ name: "A" });
    const request = createRequest(form);
    const response = await POST(request);
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toBe("validation");
    expect(body.issues).toBeDefined();
  });

  it("returns 422 when email is invalid", async () => {
    const form = createContactForm({ email: "invalid-email" });
    const request = createRequest(form);
    const response = await POST(request);
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toBe("validation");
    expect(body.issues).toBeDefined();
  });

  it("returns 200 with ok true when honeypot company is filled", async () => {
    const form = createContactForm({ company: "spam-company" });
    const request = createRequest(form);
    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
  });

  it("returns 422 when message is too short", async () => {
    const form = createContactForm({ message: "hola" });
    const request = createRequest(form);
    const response = await POST(request);
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toBe("validation");
  });
});
