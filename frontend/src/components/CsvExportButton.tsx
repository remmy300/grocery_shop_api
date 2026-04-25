import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CsvColumn<T> = {
  header: string;
  value: (row: T) => unknown;
};

type CsvExportButtonProps<T extends Record<string, unknown>> = {
  rows: readonly T[];
  columns: readonly CsvColumn<T>[];
  filename: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
};

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  const text = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

export const CsvExportButton = <T extends Record<string, unknown>>({
  rows,
  columns,
  filename,
  children,
  className,
  disabled = false,
  variant = "outline",
  size = "default",
}: CsvExportButtonProps<T>) => {
  const handleExport = () => {
    if (!rows.length || typeof document === "undefined") {
      return;
    }

    const headerRow = columns.map((column) => escapeCsvValue(column.header)).join(",");
    const dataRows = rows.map((row) =>
      columns.map((column) => escapeCsvValue(column.value(row))).join(","),
    );
    const csv = [headerRow, ...dataRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.toLowerCase().endsWith(".csv")
      ? filename
      : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleExport}
      disabled={disabled || rows.length === 0}
    >
      {children}
    </Button>
  );
};

export type { CsvColumn };
