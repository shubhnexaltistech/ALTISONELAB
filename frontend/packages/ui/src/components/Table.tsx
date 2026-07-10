import { DataTable, type DataTableColumn, type DataTableProps } from "./DataTable";

export type Column<T> = DataTableColumn<T>;
export type TableProps<T> = DataTableProps<T>;

export function Table<T>(props: TableProps<T>) {
  return <DataTable {...props} />;
}

export { DataTable, type DataTableColumn, type DataTableProps };
