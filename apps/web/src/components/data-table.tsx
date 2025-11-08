"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  label?: string; // Optional for columns without headers (like profile pictures)
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

type SortDirection = "asc" | "desc";

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data available",
  isLoading = false,
  loadingMessage = "Loading...",
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (columnKey: string) => {
    if (sortField === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = sortField
    ? [...data].sort((a, b) => {
        const aValue = a[sortField] ?? "";
        const bValue = b[sortField] ?? "";

        let aComp = aValue;
        let bComp = bValue;

        if (typeof aValue === "string") aComp = aValue.toLowerCase();
        if (typeof bValue === "string") bComp = bValue.toLowerCase();

        if (aComp < bComp) return sortDirection === "asc" ? -1 : 1;
        if (aComp > bComp) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : data;

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.label ? (
                  column.sortable === false ? (
                    column.label
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="h-auto p-0! font-medium hover:bg-transparent"
                    >
                      {column.label}
                      <ArrowUpDown className="ml-2 size-3.5" />
                    </Button>
                  )
                ) : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render
                    ? column.render(item)
                    : String(item[column.key] ?? "—")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
