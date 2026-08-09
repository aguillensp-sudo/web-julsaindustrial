"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { markReadyForDelivery } from "../orderAdminActions";

export function MarkReadyButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    const result = await markReadyForDelivery(orderId);

    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div>
      <Button variant="primary" onClick={handleClick} disabled={isLoading}>
        {isLoading ? "Procesando..." : "Marcar como disponible para entrega"}
      </Button>
      {error && <p className="text-red-700 text-xs mt-2">{error}</p>}
    </div>
  );
}
