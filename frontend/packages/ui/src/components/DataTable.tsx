import { type ReactNode } from "react";
import clsx from "clsx";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data",
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface px-6 py-12 text-center text-body-sm text-text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx("table-container w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "border-b border-border px-4 py-4 text-left text-xs font-bold uppercase text-text-muted",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={clsx(onRowClick && "cursor-pointer hover:bg-bg-main")}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={clsx(
                    "border-b border-[#f1f5f9] px-4 py-5 text-body-sm text-text-main",
                    col.className
                  )}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
