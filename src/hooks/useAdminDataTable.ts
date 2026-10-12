"use client";

import { useState, useMemo, useEffect, useRef } from "react";

export type SortOrder = "asc" | "desc";

export interface UseAdminDataTableOptions<T> {
  data: T[];
  initialPageSize?: number;
  searchQuery?: string;
  searchFields?: (keyof T | string | ((item: T) => string | number | null | undefined))[];
  filterKey?: string | number | boolean;
  filterFn?: (item: T) => boolean;
  defaultSortKey?: string | null;
  defaultSortOrder?: SortOrder;
  sortResolvers?: Record<string, (item: T) => any>;
}

export function useAdminDataTable<T>({
  data,
  initialPageSize = 10,
  searchQuery = "",
  searchFields = [],
  filterKey,
  filterFn,
  defaultSortKey = null,
  defaultSortOrder = "asc",
  sortResolvers,
}: UseAdminDataTableOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);

  // Store function/object refs to avoid re-triggering effects or recalculations when parent re-renders
  const filterFnRef = useRef(filterFn);
  filterFnRef.current = filterFn;

  const searchFieldsRef = useRef(searchFields);
  searchFieldsRef.current = searchFields;

  const sortResolversRef = useRef(sortResolvers);
  sortResolversRef.current = sortResolvers;

  // 1. Filter & Search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Custom filter predicate
    if (filterFnRef.current) {
      result = result.filter(filterFnRef.current);
    }

    // Search query
    const trimmed = searchQuery.trim().toLowerCase();
    const fields = searchFieldsRef.current;
    if (trimmed && fields.length > 0) {
      result = result.filter((item) => {
        return fields.some((field) => {
          let val: any;
          if (typeof field === "function") {
            val = field(item);
          } else {
            val = (item as any)[field];
          }
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(trimmed);
        });
      });
    }

    // 2. Sorting
    if (sortKey) {
      const resolvers = sortResolversRef.current;
      result.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (resolvers && resolvers[sortKey]) {
          valA = resolvers[sortKey](a);
          valB = resolvers[sortKey](b);
        } else {
          valA = (a as any)[sortKey];
          valB = (b as any)[sortKey];
        }

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        let comp = 0;
        if (typeof valA === "number" && typeof valB === "number") {
          comp = valA - valB;
        } else if (valA instanceof Date && valB instanceof Date) {
          comp = valA.getTime() - valB.getTime();
        } else {
          comp = String(valA).localeCompare(String(valB), undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }

        return sortOrder === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [data, searchQuery, sortKey, sortOrder, filterKey]);

  // Reset to page 1 ONLY when search query or filterKey actually changes
  const prevSearchRef = useRef(searchQuery);
  const prevFilterKeyRef = useRef(filterKey);

  useEffect(() => {
    const searchChanged = prevSearchRef.current !== searchQuery;
    const filterChanged = prevFilterKeyRef.current !== filterKey;

    if (searchChanged || filterChanged) {
      prevSearchRef.current = searchQuery;
      prevFilterKeyRef.current = filterKey;
      setCurrentPage(1);
    }
  }, [searchQuery, filterKey]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // 3. Paginate
  const paginatedData = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, safeCurrentPage, pageSize]);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safeCurrentPage * pageSize);
  const rangeText =
    totalItems === 0
      ? "No records found"
      : `Showing ${startItem} to ${endItem} of ${totalItems} entries`;

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  function handlePageSizeChange(newSize: number) {
    setPageSize(newSize);
    setCurrentPage(1);
  }

  function handlePageChange(newPage: number) {
    const target = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(target);
  }

  return {
    currentPage: safeCurrentPage,
    setCurrentPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    totalItems,
    paginatedData,
    rangeText,
    sortKey,
    sortOrder,
    toggleSort,
  };
}
