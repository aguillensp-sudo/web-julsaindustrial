"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { setCustomerStatus } from "./customerActions";

interface CustomerStatusButtonProps {
  customerId: string;
  status: "active" | "suspended";
}

export function CustomerStatusButton({
  customerId,
  status,
}: CustomerStatusButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    const nextStatus = status === "active" ? "suspended" : "active";
    const result = await setCustomerStatus(customerId, nextStatus);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Procesando..." : status === "active" ? "Suspender" : "Reactivar"}
      </Button>
      {error && <p className="text-red-700 text-xs mt-1">{error}</p>}
    </div>
  );
}
