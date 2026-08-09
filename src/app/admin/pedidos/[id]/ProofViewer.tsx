"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getProofSignedUrl } from "../orderAdminActions";

export function ProofViewer({ filePath }: { filePath: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getProofSignedUrl(filePath);

    if (result.ok) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div>
      <Button variant="ghost" onClick={handleClick} disabled={isLoading}>
        {isLoading ? "Generando..." : "Ver comprobante"}
      </Button>
      {error && <p className="text-red-700 text-xs mt-1">{error}</p>}
    </div>
  );
}
