import { Box, Text } from "ink";
import React from "react";

type Alignment = "left" | "center" | "right";

type Columns<T, K extends keyof T = keyof T> = ReadonlyArray<{
  accessor: K;
  header: string;
  align?: Alignment;
  cell?: (value: T[K], row: T) => React.ReactNode;
}>;

type TableProps<T> = {
  data: T[];
  columns: Columns<T>;
};

export default function Table<T>({ data, columns }: TableProps<T>) {
  if (data.length === 0) {
    return null;
  }

  const columnWidths = columns.map((col) => {
    const headerLength = col.header.length;
    const maxDataLength = Math.max(
      ...data.map((row) => {
        // Always use raw value for width calculation
        const value = String(row[col.accessor]);
        return value.length;
      })
    );
    return Math.max(headerLength, maxDataLength);
  });

  const { topBorder, headerSeparator, rowSeparator, bottomBorder } =
    buildBorders(columnWidths);

  return (
    <Box flexDirection="column">
      <Text>{topBorder}</Text>
      <Text bold>{buildHeaderRow(columns, columnWidths)}</Text>
      <Text>{headerSeparator}</Text>

      {data.map((row, rowIndex) => (
        <Box key={rowIndex} flexDirection="column">
          {buildStyledRow(columns, columnWidths, row)}
          {rowIndex < data.length - 1 && <Text>{rowSeparator}</Text>}
        </Box>
      ))}

      <Text>{bottomBorder}</Text>
    </Box>
  );
}

function buildBorders(columnWidths: number[]) {
  function buildBorder(l: string, m: string, r: string): string {
    const segments = columnWidths.map((w) => "─".repeat(w + 2));
    return l + segments.join(m) + r;
  }

  const topBorder = buildBorder("┌", "┬", "┐");
  const headerSeparator = buildBorder("├", "┼", "┤");
  const rowSeparator = buildBorder("├", "┼", "┤");
  const bottomBorder = buildBorder("└", "┴", "┘");

  return { topBorder, headerSeparator, rowSeparator, bottomBorder };
}

function buildHeaderRow<T>(
  columns: Columns<T>,
  columnWidths: number[]
): string {
  const cells = columns.map((col, i) => {
    const value = col.header;
    const width = columnWidths[i];
    return alignText(value, width, col.align || "left");
  });
  return "│" + cells.join("│") + "│";
}

function buildStyledRow<T>(
  columns: Columns<T>,
  columnWidths: number[],
  row: T
): React.ReactNode {
  return (
    <Text>
      {"│"}
      {columns.map((col, i) => {
        const rawValue = row[col.accessor];
        const value = String(rawValue);
        const width = columnWidths[i];
        const alignedText = alignText(value, width, col.align || "left");

        // If column has a cell renderer, use it with proper alignment
        if (col.cell) {
          const padding = width - value.length;
          const align = col.align || "left";

          if (align === "center") {
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            return (
              <React.Fragment key={i}>
                {" "}
                {" ".repeat(leftPad)}
                {col.cell(rawValue, row)}
                {" ".repeat(rightPad)} {"│"}
              </React.Fragment>
            );
          } else if (align === "right") {
            return (
              <React.Fragment key={i}>
                {" "}
                {" ".repeat(padding)}
                {col.cell(rawValue, row)} {"│"}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={i}>
                {" "}
                {col.cell(rawValue, row)}
                {" ".repeat(padding)} {"│"}
              </React.Fragment>
            );
          }
        }

        return (
          <React.Fragment key={i}>
            {alignedText}
            {"│"}
          </React.Fragment>
        );
      })}
    </Text>
  );
}

function alignText(text: string, width: number, align: Alignment): string {
  const padding = width - text.length;

  if (align === "center") {
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ` ${" ".repeat(leftPad)}${text}${" ".repeat(rightPad)} `;
  } else if (align === "right") {
    return ` ${" ".repeat(padding)}${text} `;
  } else {
    return ` ${text}${" ".repeat(padding)} `;
  }
}
export function calculateTableWidth<T>(data: T[], columns: Columns<T>): number {
  if (data.length === 0) return 0;

  const columnWidths = columns.map((col) => {
    const headerLength = col.header.length;
    const maxDataLength = Math.max(
      ...data.map((row) => {
        // Always use raw value for width calculation
        const value = String(row[col.accessor]);
        return value.length;
      })
    );
    return Math.max(headerLength, maxDataLength);
  });

  // Total width = sum of column widths + padding (2 per column) + separators (1 per column + 1 for edges)
  const columnsWidth = columnWidths.reduce((sum, w) => sum + w, 0);
  const padding = columnWidths.length * 2; // 2 spaces per column (left and right)
  const separators = columnWidths.length + 1; // │ between columns + edges
  return columnsWidth + padding + separators;
}

// Helper to create properly typed columns
export function createColumns<T>(columns: Columns<T>) {
  return columns;
}
