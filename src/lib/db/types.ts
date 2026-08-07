/**
 * Tipos del dominio Web Julsa (design.md §Data model).
 * Tipos técnicos en inglés (base-standards §2). Valores de enum en español
 * solo donde sean label de UI; los valores de DB son ingleses snake_case.
 */

export type ProductLine = "fuels" | "energy" | "autoparts" | "raw_materials";

export type CustomerStatus =
  | "pending_verification"
  | "active"
  | "suspended";

/** Release 1: dos estados, gestionados manualmente por el admin. */
export type OrderStatus = "in_payment" | "ready_for_delivery";

export interface Product {
  id: string;
  line: ProductLine;
  name: string;
  description: string | null;
  image_path: string | null;
  price_usd: number;
  unit: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string; // FK a auth.users.id
  company_name: string;
  contact_name: string;
  phone: string | null;
  location: string | null;
  status: CustomerStatus;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_usd: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_usd: number; // snapshot del precio en fecha de pedido
  line_total_usd: number;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  file_path: string;
  uploaded_at: string;
}

/** Etiquetas en español para el semáforo de estados (UI). */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  in_payment: "En proceso de pago",
  ready_for_delivery: "Disponible para entrega",
};
