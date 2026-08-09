import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Critical e2e flow (docs/HANDOFF.md §5.1):
 *   registro -> login -> crear pedido -> subir comprobante -> admin cambia estado.
 *
 * Runs against the real (hosted) Supabase project configured in .env.local.
 * All data created here (auth user, customer, order, proof, test product) is
 * removed in afterAll via the service-role client, regardless of pass/fail.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

const admin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const runId = Date.now();
const testEmail = `e2e-test-${runId}@nortexsys.com`;
const testPassword = "TestPassword123!";
const companyName = `E2E Test Co ${runId}`;
const contactName = "E2E Tester";

let testProductId: string;
let testUserId: string;
let testOrderId: string;

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const { data: product, error } = await admin
    .from("products")
    .insert({
      line: "fuels",
      name: `E2E Test Product ${runId}`,
      description: "Producto temporal creado por el test e2e.",
      price_usd: 10,
      unit: "unidad",
      stock: 100,
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !product) {
    throw new Error(`Failed to create test product: ${error?.message}`);
  }
  testProductId = product.id;
});

test.afterAll(async () => {
  if (testUserId) {
    // Remove uploaded proof files (not covered by DB cascade).
    const { data: files } = await admin.storage
      .from("payment-proofs")
      .list(testUserId, { limit: 100 });
    if (files && files.length > 0) {
      const paths = files.map((f) => `${testUserId}/${f.name}`);
      await admin.storage.from("payment-proofs").remove(paths);
    }
    // Cascades: auth.users -> customers -> orders -> order_items/payment_proofs.
    await admin.auth.admin.deleteUser(testUserId);
  }
  if (testProductId) {
    await admin.from("products").delete().eq("id", testProductId);
  }
});

test("registro -> login -> crear pedido -> subir comprobante -> admin cambia estado", async ({
  page,
  browser,
}) => {
  await test.step("registro", async () => {
    // The Supabase project has "Confirm email" enabled with the default
    // (unconfigured) email provider, which has a very low send-rate limit
    // (a handful of emails/hour). Driving the real RegisterForm through the
    // UI would send a real confirmation email on every test run and quickly
    // exhaust that limit, making the suite unusable in CI. RegisterForm's
    // own client-side behavior is already covered by
    // src/app/portal/registro/RegisterForm.test.tsx (tanda 4a), so here we
    // create the user the way the trigger expects (same user_metadata shape
    // RegisterForm sends) via the admin API -- equivalent server-side effect
    // to a real signup, without sending mail or touching the rate limit.
    const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        company_name: companyName,
        contact_name: contactName,
        phone: "+34600000000",
        location: "Madrid",
      },
    });

    if (error || !data.user) {
      throw new Error(`Failed to create test user: ${error?.message}`);
    }
    testUserId = data.user.id;

    // Confirms the on_auth_user_created trigger created the matching
    // `customers` row (active, profile_completed) before continuing.
    const { data: customer, error: customerError } = await admin
      .from("customers")
      .select("status, profile_completed")
      .eq("id", testUserId)
      .single();
    if (customerError || !customer) {
      throw new Error(`Customer row not created: ${customerError?.message}`);
    }
    expect(customer.status).toBe("active");
    expect(customer.profile_completed).toBe(true);
  });

  await test.step("login", async () => {
    await page.goto("/portal/login?redirect=/portal");
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL((url) => url.pathname === "/portal", { timeout: 10_000 });
  });

  await test.step("crear pedido", async () => {
    await page.goto(`/portal/producto/${testProductId}`);
    await page.locator("#quantity").fill("2");
    await page.getByRole("button", { name: "Crear pedido" }).click();
    await expect(page.getByRole("status")).toContainText("Pedido creado.");

    const { data: orders, error } = await admin
      .from("orders")
      .select("id")
      .eq("customer_id", testUserId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !orders || orders.length === 0) {
      throw new Error(`Could not find created order: ${error?.message}`);
    }
    testOrderId = orders[0].id;
  });

  await test.step("subir comprobante", async () => {
    await page.goto("/portal/mis-pedidos");
    const fileInput = page.getByLabel(
      "Comprobante de pago (PDF, JPG o PNG, máx 5MB)"
    );
    await fileInput.setInputFiles({
      name: "comprobante.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 e2e test file"),
    });
    await page.getByRole("button", { name: "Subir" }).click();
    await expect(page.getByRole("status").last()).toContainText("Subido ✓");
  });

  await test.step("admin cambia estado", async () => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/portal/login?redirect=/admin");
    await adminPage.locator('input[type="email"]').fill(ADMIN_EMAIL!);
    await adminPage.locator('input[type="password"]').fill(ADMIN_PASSWORD!);
    await adminPage.getByRole("button", { name: "Entrar" }).click();
    await adminPage.waitForURL((url) => url.pathname === "/admin", { timeout: 10_000 });

    await adminPage.goto(`/admin/pedidos/${testOrderId}`);
    await adminPage
      .getByRole("button", { name: "Marcar como disponible para entrega" })
      .click();
    await expect(adminPage.getByText("Disponible para entrega")).toBeVisible();

    await adminContext.close();
  });

  await test.step("verifica el estado final en la BD", async () => {
    const { data: order } = await admin
      .from("orders")
      .select("status")
      .eq("id", testOrderId)
      .single();
    expect(order?.status).toBe("ready_for_delivery");
  });
});
