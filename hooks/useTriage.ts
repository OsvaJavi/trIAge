// hooks/useTriage.ts
// Hook para manejar el flujo de clasificación de un paciente.
// Llama al backend POST /triage y devuelve el resultado.

import { useState } from "react";
import { submitTriage, type TriagePayload, type TriageResponse } from "@/api/client";

interface UseTriageReturn {
  result: TriageResponse | null;
  loading: boolean;
  error: string | null;
  classify: (payload: TriagePayload) => Promise<TriageResponse | null>;
  reset: () => void;
}

export function useTriage(): UseTriageReturn {
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function classify(payload: TriagePayload): Promise<TriageResponse | null> {
    setLoading(true);
    setError(null);
    try {
      const data = await submitTriage(payload);
      setResult(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al clasificar paciente");
      return null;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { result, loading, error, classify, reset };
}

/*
  ─── Cómo usar cuando el backend esté listo ─────────────────────────────────

  En triage/page.tsx reemplaza la lógica local por:

    const { classify, loading, error } = useTriage();

    async function handleSubmit(formData) {
      const result = await classify(formData);
      if (result) {
        // result.priority, result.ai_label, result.tx_hash
      }
    }

  El hook se encarga de llamar al backend, manejar errores y el estado de carga.
*/
