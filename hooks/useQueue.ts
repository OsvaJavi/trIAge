// hooks/useQueue.ts
// Hook para mantener la cola sincronizada con el backend.
// Cuando el backend esté listo, descomenta `fetchQueue()` y quita el mock.

import { useEffect, useRef, useState } from "react";
import { fetchQueue, type QueuePatient } from "@/api/client";

interface UseQueueOptions {
  /** Intervalo de polling en ms. Default: 5000 */
  interval?: number;
  /** Si es false, el polling no arranca. Útil para desarrollo con mock data. */
  enabled?: boolean;
}

interface UseQueueReturn {
  queue: QueuePatient[];
  loading: boolean;
  error: string | null;
  /** Fuerza un refresh inmediato */
  refresh: () => void;
}

export function useQueue({
  interval = 5000,
  enabled = true,
}: UseQueueOptions = {}): UseQueueReturn {
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQueue();
      // Ordena localmente por prioridad como fallback
      setQueue(data.sort((a, b) => a.priority - b.priority));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la cola");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!enabled) return;

    load(); // carga inicial

    timerRef.current = setInterval(load, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, interval]);

  return { queue, loading, error, refresh: load };
}

/* 
  ─── Cómo activar cuando el backend esté listo ──────────────────────────────

  En page.tsx, reemplaza el useState<Patient[]>(MOCK_PATIENTS) por:

    const { queue, loading, refresh } = useQueue({ interval: 4000, enabled: true });

  Y adapta el tipo QueuePatient → Patient si difieren los campos.
  El polling se detiene solo cuando el componente se desmonta.
*/
