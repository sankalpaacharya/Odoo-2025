"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
  expandedContent?: (item: T) => React.ReactNode;
  expandedRows?: Set<string>;
  footer?: React.ReactNode;
  onRowClick?: (item: T) => void;
}

type SortDirection = "asc" | "desc";

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data available",
  isLoading = false,
  loadingMessage = "Loading...",
  expandedContent,
  expandedRows,
  footer,
  onRowClick,
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

  // Ensure data is always an array
  const dataArray = Array.isArray(data) ? data : [];

  const sortedData = sortField
    ? [...dataArray].sort((a, b) => {
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
    : dataArray;

  return (
    <div className="w-full max-w-full">
      <div className="rounded-lg border overflow-x-auto">
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
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {loadingMessage}
              </TableCell>
            </TableRow>
          ) : sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => {
              const itemKey = keyExtractor(item);
              const isExpanded = expandedRows?.has(itemKey);

              return (
                <>
                  <TableRow
                    key={itemKey}
                    onClick={() => onRowClick?.(item)}
                    className={
                      onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                    }
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render
                          ? column.render(item)
                          : String(item[column.key] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded && expandedContent && (
                    <TableRow key={`${itemKey}-expanded`}>
                      <TableCell colSpan={columns.length} className="p-0">
                        {expandedContent(item)}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })
          )}
        </TableBody>
        {footer && <TableFooter>{footer}</TableFooter>}
      </Table>
      </div>
    </div>
  );
}
