/**
 * Hook genérico para llamadas a la API
 * 
 * Proporciona un patrón consistente para hacer llamadas a la API con
 * manejo de estados (loading, error, data)
 */

import { useState, useCallback } from 'react';
import { handleApiError } from '../services/http';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T, P extends any[]> extends UseApiState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Hook para ejecutar llamadas a la API con manejo de estado
 * 
 * @param apiFunction - Función que realiza la llamada a la API
 * @param immediate - Si es true, ejecuta la función inmediatamente
 */
export function useApi<T = any, P extends any[] = any[]>(
  apiFunction: (...params: P) => Promise<T>,
  immediate = false
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        
        const result = await apiFunction(...params);
        
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (err) {
        const errorMessage = handleApiError(err);
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  // Ejecutar inmediatamente si se especifica
  useState(() => {
    if (immediate) {
      execute();
    }
  });

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook para ejecutar múltiples llamadas a la API en paralelo
 */
export function useParallelApi<T extends any[]>(
  apiFunctions: Array<() => Promise<any>>,
  immediate = false
): UseApiReturn<T, []> {
  const execute = useCallback(async () => {
    const results = await Promise.all(apiFunctions.map((fn) => fn()));
    return results as T;
  }, [apiFunctions]);

  return useApi(execute, immediate);
}
