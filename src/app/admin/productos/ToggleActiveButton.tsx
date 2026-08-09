"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { setProductActive } from "./productActions";

export function ToggleActiveButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    const result = await setProductActive(productId, !isActive);
    if (result.ok) {
      router.refresh();
    }
    setPending(false);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? "Procesando..." : isActive ? "Dar de baja" : "Reactivar"}
    </Button>
  );
}
