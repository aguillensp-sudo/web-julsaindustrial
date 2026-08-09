import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Nuevo producto</h1>
      <div className="rounded-lg border border-[var(--border)] bg-white p-6">
        <ProductForm />
      </div>
    </div>
  );
}
