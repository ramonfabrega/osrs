import type { ReactNode } from "react";

export type Alignment = "left" | "center" | "right";

export type TableLayout<T> = {
  columns: Columns<T>;
  columnWidths: number[];
};

export type Columns<T> = ReadonlyArray<Column<T>>;

type Column<T> = { [K in keyof T]: ColumnDef<T, K> }[keyof T];

type ColumnDef<T, K extends keyof T> = {
  accessor: K;
  header: string;
  align?: Alignment;
  cell?: (value: T[K], row: T) => ReactNode;
};
