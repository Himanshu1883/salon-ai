"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";

export type ReportColumn = {
  key: string;
  header: string;
  align?: "left" | "right";
};

export type ReportRow = Record<string, React.ReactNode>;

export function ReportStatCards({
  stats,
}: {
  stats: { label: string; value: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-stone-900">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ReportDataTable({
  title,
  columns,
  rows,
  footer,
}: {
  title?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  footer?: React.ReactNode;
}) {
  return (
    <Card>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.align === "right" ? "text-right" : undefined}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-stone-500"
                >
                  No data for the selected period.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={
                        col.align === "right"
                          ? "text-right tabular-nums"
                          : undefined
                      }
                    >
                      {row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {footer}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function CurrencyCell({ amount }: { amount: number }) {
  return <span>{formatCurrency(amount)}</span>;
}
