"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  header: string | React.ReactNode;
  accessor?: (row: T) => any;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  pageSize = 10,
  onRowClick,
  isLoading = false,
  className,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) => {
      const val = row[searchKey];
      return val ? String(val).toLowerCase().includes(term) : false;
    });
  }, [data, searchTerm, searchKey]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    return [...filteredData].sort((a, b) => {
      const aVal = col?.accessor ? col.accessor(a) : a[sortKey];
      const bVal = col?.accessor ? col.accessor(b) : b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return (
      <div className={cn("bg-white border border-[#E2E8F0] rounded-lg p-4 animate-pulse space-y-4 shadow-xs", className)}>
        <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-[#E2E8F0] rounded-lg overflow-hidden flex flex-col shadow-xs", className)}>
      {/* Search Header */}
      {searchKey && (
        <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-white border border-[#E2E8F0] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </div>
          <div className="text-xs text-[#64748B] shrink-0 font-medium">
            {sortedData.length} total records
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[#EEF2F7] border-b border-[#E2E8F0] text-xs font-semibold uppercase tracking-wider text-[#475569]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 select-none",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.headerClassName
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5 hover:text-[#0F172A] transition-colors group"
                    >
                      <span>{col.header}</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60 group-hover:opacity-100 text-[#166534]" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs text-[#64748B]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-[#F8FAFC] transition-colors",
                    onRowClick ? "cursor-pointer" : ""
                  )}
                >
                  {columns.map((col) => {
                    const content = col.render
                      ? col.render(row, rowIndex)
                      : col.accessor
                      ? col.accessor(row)
                      : row[col.key];

                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-xs text-[#0F172A]",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-[#64748B]">
            Page <span className="font-semibold text-[#0F172A]">{currentPage}</span> of{" "}
            <span className="font-semibold text-[#0F172A]">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="p-1 rounded-md border border-[#E2E8F0] bg-white disabled:opacity-40 hover:bg-[#EEF2F7] text-[#64748B] hover:text-[#0F172A] transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-[#E2E8F0] bg-white disabled:opacity-40 hover:bg-[#EEF2F7] text-[#64748B] hover:text-[#0F172A] transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-[#E2E8F0] bg-white disabled:opacity-40 hover:bg-[#EEF2F7] text-[#64748B] hover:text-[#0F172A] transition-colors"
              title="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1 rounded-md border border-[#E2E8F0] bg-white disabled:opacity-40 hover:bg-[#EEF2F7] text-[#64748B] hover:text-[#0F172A] transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
