import { Card } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CustomerStatus } from "@/lib/db/types";
import { CustomerStatusButton } from "./CustomerStatusButton";

export const dynamic = "force-dynamic";

const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  pending_verification: "Pendiente de verificación",
  active: "Activo",
  suspended: "Suspendido",
};

type CustomerListRow = {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  location: string | null;
  status: CustomerStatus;
  created_at: string;
};

export default async function AdminClientesPage() {
  const supabase = createAdminClient();

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, company_name, contact_name, phone, location, status, created_at")
    .order("created_at", { ascending: false });

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const emailMap = new Map<string, string>();
  if (usersData?.users) {
    for (const user of usersData.users) {
      if (user.email) {
        emailMap.set(user.id, user.email);
      }
    }
  }

  if (customersError || usersError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Clientes</h1>
        <Card>
          <p className="text-gray-500">No se pudieron cargar los clientes.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>
      {customers.length === 0 ? (
        <Card>
          <p className="text-gray-500">Todavía no hay clientes registrados.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {(customers as CustomerListRow[]).map((customer) => {
            const email = emailMap.get(customer.id) ?? "—";
            return (
              <Card key={customer.id}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900">
                        {customer.company_name}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          customer.status === "active"
                            ? "bg-green-100 text-green-700"
                            : customer.status === "suspended"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {CUSTOMER_STATUS_LABEL[customer.status]}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-1">{customer.contact_name}</p>
                    <p className="text-gray-500">{email}</p>
                    {customer.phone && (
                      <p className="text-gray-500">{customer.phone}</p>
                    )}
                    {customer.location && (
                      <p className="text-gray-500">{customer.location}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      Alta: {new Date(customer.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  {customer.status !== "pending_verification" && (
                    <CustomerStatusButton
                      customerId={customer.id}
                      status={customer.status as "active" | "suspended"}
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
