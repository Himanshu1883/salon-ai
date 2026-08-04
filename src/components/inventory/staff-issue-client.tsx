"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  issueProductToStaff,
  returnProductFromStaff,
} from "@/actions/inventory/staff-issue";
import { InventoryPageHeader } from "@/components/inventory/inventory-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
import {
  InventoryMobileCard,
  InventoryMobileField,
} from "@/components/inventory/inventory-list-helpers";

type Issue = Awaited<
  ReturnType<typeof import("@/actions/inventory/staff-issue").getStaffIssues>
>[number];

export function StaffIssueClient({
  issues,
  employees,
  products,
  canWrite,
}: {
  issues: Issue[];
  employees: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string }>;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [stockItemId, setStockItemId] = useState(products[0]?.id ?? "");

  async function handleIssue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("employeeId", employeeId);
    formData.set("stockItemId", stockItemId);
    const result = await issueProductToStaff(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function handleReturn(e: React.FormEvent<HTMLFormElement>, issueId: string) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("issueId", issueId);
    const result = await returnProductFromStaff(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setReturnOpen(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <InventoryPageHeader title="Staff Product Issue" description="Issue products to staff and track returns.">
        {canWrite && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#6C3BFF]"><Plus className="mr-2 h-4 w-4" /> Issue Product</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Issue to staff</DialogTitle></DialogHeader>
              <form onSubmit={handleIssue} className="space-y-4">
                <div className="space-y-2">
                  <Label>Staff member</Label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={stockItemId} onValueChange={setStockItemId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input name="quantity" type="number" min={1} required defaultValue={1} />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6C3BFF]">Issue</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </InventoryPageHeader>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <ResponsiveTableWrapper
            cards={
              issues.length === 0 ? (
                <p className="py-8 text-center text-stone-500">No issues yet.</p>
              ) : (
                <div className="divide-y divide-[#ECECEC] rounded-xl border">
                  {issues.map((issue) => (
                    <InventoryMobileCard key={issue.id}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#1C103D]">{issue.stockItem.name}</p>
                          <p className="text-xs text-stone-500">{issue.employee.name}</p>
                        </div>
                        <Badge variant="secondary" className="capitalize rounded-lg">{issue.status}</Badge>
                      </div>
                      <p className="text-xs text-stone-500">{format(new Date(issue.issueDate), "MMM d, yyyy")}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <InventoryMobileField label="Issued">{issue.quantity}</InventoryMobileField>
                        <InventoryMobileField label="Returned">{issue.quantityReturned}</InventoryMobileField>
                      </div>
                      {canWrite && issue.status !== "returned" && (
                        <Dialog open={returnOpen === issue.id} onOpenChange={(v) => setReturnOpen(v ? issue.id : null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-11 min-h-[48px] w-full rounded-lg">Return</Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl">
                            <DialogHeader><DialogTitle>Return product</DialogTitle></DialogHeader>
                            <form onSubmit={(e) => handleReturn(e, issue.id)} className="space-y-4">
                              <Input name="quantity" type="number" min={1} max={issue.quantity - issue.quantityReturned} required defaultValue={1} />
                              {error && <p className="text-sm text-red-600">{error}</p>}
                              <Button type="submit" disabled={loading} className="h-12 min-h-[48px] w-full rounded-xl">Confirm return</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </InventoryMobileCard>
                  ))}
                </div>
              )
            }
            table={
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Returned</TableHead>
                    <TableHead>Status</TableHead>
                    {canWrite && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-stone-500">No issues yet.</TableCell></TableRow>
                  ) : (
                    issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>{format(new Date(issue.issueDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>{issue.employee.name}</TableCell>
                        <TableCell>{issue.stockItem.name}</TableCell>
                        <TableCell>{issue.quantity}</TableCell>
                        <TableCell>{issue.quantityReturned}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize rounded-lg">{issue.status}</Badge></TableCell>
                        {canWrite && issue.status !== "returned" && (
                          <TableCell>
                            <Dialog open={returnOpen === issue.id} onOpenChange={(v) => setReturnOpen(v ? issue.id : null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="rounded-lg">Return</Button>
                              </DialogTrigger>
                              <DialogContent className="rounded-2xl">
                                <DialogHeader><DialogTitle>Return product</DialogTitle></DialogHeader>
                                <form onSubmit={(e) => handleReturn(e, issue.id)} className="space-y-4">
                                  <Input name="quantity" type="number" min={1} max={issue.quantity - issue.quantityReturned} required defaultValue={1} />
                                  {error && <p className="text-sm text-red-600">{error}</p>}
                                  <Button type="submit" disabled={loading} className="w-full rounded-xl">Confirm return</Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
