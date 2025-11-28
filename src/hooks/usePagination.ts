/**
 * Hook de paginación
 * 
 * Maneja la lógica de paginación para listas de datos
 */

import { useState, useCallback, useEffect } from 'react';
import { PaginatedResponse } from '../services/http';

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

interface UsePaginationReturn<T, F> {
  data: T[];
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number;
  to: number;
  isLoading: boolean;
  error: string | null;
  filters: F;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setFilters: (filters: Partial<F>) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
}

export function usePagination<T = any, F extends Record<string, any> = Record<string, any>>(
  fetchFunction: (filters: F & { page: number; per_page: number }) => Promise<PaginatedResponse<T>>,
  initialFilters: F = {} as F,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T, F> {
  const { initialPage = 1, initialPerPage = 10 } = options;

  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<F>(initialFilters);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchFunction({
        ...filters,
        page: currentPage,
        per_page: perPage,
      });

      setData(response.data);
      setTotal(response.total);
      setLastPage(response.last_page);
      setFrom(response.from);
      setTo(response.to);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, filters, currentPage, perPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setPerPageHandler = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  }, []);

  const setFilters = useCallback((newFilters: Partial<F>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when changing filters
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setCurrentPage(1);
  }, [initialFilters]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const hasNextPage = currentPage < lastPage;
  const hasPreviousPage = currentPage > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  return {
    data,
    currentPage,
    perPage,
    total,
    lastPage,
    from,
    to,
    isLoading,
    error,
    filters,
    setPage,
    setPerPage: setPerPageHandler,
    setFilters,
    resetFilters,
    refetch,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
  };
}
