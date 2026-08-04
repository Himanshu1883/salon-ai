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
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

function ReportMobileCards({
  columns,
  rows,
}: {
  columns: ReportColumn[];
  rows: ReportRow[];
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-stone-500">
        No data for the selected period.
      </p>
    );
  }

  return (
    <div className="divide-y divide-[#ECECEC]">
      {rows.map((row, i) => (
        <div key={i} className="space-y-2 p-4">
          {columns.map((col) => (
            <div
              key={col.key}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="shrink-0 text-[#9CA3AF]">{col.header}</span>
              <span
                className={
                  col.align === "right"
                    ? "text-right font-medium tabular-nums text-[#1C103D]"
                    : "text-right font-medium text-[#1C103D]"
                }
              >
                {row[col.key]}
              </span>
            </div>
          ))}
        </div>
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
        <ResponsiveTableWrapper
          cards={<ReportMobileCards columns={columns} rows={rows} />}
          table={
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
          }
        />
      </CardContent>
    </Card>
  );
}

export function CurrencyCell({ amount }: { amount: number }) {
  return <span>{formatCurrency(amount)}</span>;
}
