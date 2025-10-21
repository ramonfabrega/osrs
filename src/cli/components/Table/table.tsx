import { Box, Text } from "ink";
import { Fragment, type ReactNode } from "react";

import type { Alignment, Columns, TableLayout } from "./types";

type Props<T> = {
  data: T[];
  columns: Columns<T>;
};

export default function Table<T>({ data, columns }: Props<T>) {
  if (data.length === 0) return null;

  const layout = buildTableLayout(data, columns);
  const { borders, separators } = buildBorders(layout.columnWidths);

  return (
    <Box flexDirection="column">
      <Text>{borders.top}</Text>

      <Text bold>{buildHeaderRow(layout)}</Text>

      <Text>{separators.header}</Text>

      {data.map((row, rowIndex) => (
        <Box key={rowIndex} flexDirection="column">
          {buildStyledRow(layout, row)}
          {rowIndex < data.length - 1 && <Text>{separators.row}</Text>}
        </Box>
      ))}

      <Text>{borders.bottom}</Text>
    </Box>
  );
}

function buildTableLayout<T>(data: T[], columns: Columns<T>): TableLayout<T> {
  const columnWidths = columns.map((col) => {
    const headerLength = col.header.length;
    const maxDataLength = Math.max(
      ...data.map((row) => {
        // Always use raw value for width calculation
        const value = String(row[col.accessor]);
        return value.length;
      })
    );
    let width = Math.max(headerLength, maxDataLength);

    // For center-aligned columns, ensure symmetric padding is possible
    if (col.align === "center") {
      const maxPadding = width - maxDataLength;
      if (maxPadding % 2 !== 0) {
        width += 1;
      }
    }

    return width;
  });

  return { columns, columnWidths };
}

function buildBorders(columnWidths: number[]) {
  function buildBorder(l: string, m: string, r: string): string {
    const segments = columnWidths.map((w) => "─".repeat(w + 2));
    return l + segments.join(m) + r;
  }

  const top = buildBorder("┌", "┬", "┐");
  const header = buildBorder("├", "┼", "┤");
  const row = buildBorder("├", "┼", "┤");
  const bottom = buildBorder("└", "┴", "┘");

  return { borders: { top, bottom }, separators: { row, header } };
}

function buildHeaderRow<T>(layout: TableLayout<T>): string {
  const cells = layout.columns.map((col, i) => {
    const value = col.header;
    const width = layout.columnWidths[i];
    return alignText(value, width, "left");
  });
  return "│" + cells.join("│") + "│";
}

function buildStyledRow<T>(layout: TableLayout<T>, row: T): ReactNode {
  return (
    <Text>
      {"│"}
      {layout.columns.map((col, i) => {
        const rawValue = row[col.accessor];
        const value = String(rawValue);
        const width = layout.columnWidths[i];
        const alignedText = alignText(value, width, col.align || "left");

        // If column has a cell renderer, use it with proper alignment
        if (col.cell) {
          const padding = width - value.length;
          const align = col.align || "left";

          if (align === "center") {
            const leftPad = Math.floor(padding / 2);
            const rightPad = padding - leftPad;
            return (
              <Fragment key={i}>
                {" "}
                {" ".repeat(leftPad)}
                {col.cell(rawValue, row)}
                {" ".repeat(rightPad)} {"│"}
              </Fragment>
            );
          } else if (align === "right") {
            return (
              <Fragment key={i}>
                {" "}
                {" ".repeat(padding)}
                {col.cell(rawValue, row)} {"│"}
              </Fragment>
            );
          } else {
            return (
              <Fragment key={i}>
                {" "}
                {col.cell(rawValue, row)}
                {" ".repeat(padding)} {"│"}
              </Fragment>
            );
          }
        }

        return (
          <Fragment key={i}>
            {alignedText}
            {"│"}
          </Fragment>
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

  const layout = buildTableLayout(data, columns);

  // Total width = sum of column widths + padding (2 per column) + separators (1 per column + 1 for edges)
  const columnsWidth = layout.columnWidths.reduce((sum, w) => sum + w, 0);
  const padding = layout.columnWidths.length * 2; // 2 spaces per column (left and right)
  const separators = layout.columnWidths.length + 1; // │ between columns + edges
  return columnsWidth + padding + separators;
}
