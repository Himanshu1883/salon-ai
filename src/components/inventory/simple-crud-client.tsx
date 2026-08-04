"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";
import {
  InventoryIconButton,
  InventoryMobileCard,
  InventoryMobileField,
} from "@/components/inventory/inventory-list-helpers";

type CrudActions = {
  create: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  update: (id: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  remove: (id: string) => Promise<{ error?: string; success?: boolean }>;
};

type SimpleCrudClientProps<T extends { id: string; name: string }> = {
  title: string;
  description: string;
  items: T[];
  canWrite: boolean;
  actions: CrudActions;
  detailKey?: keyof T & string;
  detailHeader?: string;
  fields?: Array<{ name: string; label: string; type?: string; optional?: boolean }>;
};

export function SimpleCrudClient<T extends { id: string; name: string }>({
  title,
  description,
  items,
  canWrite,
  actions,
  detailKey,
  detailHeader = "Details",
  fields = [{ name: "name", label: "Name" }],
}: SimpleCrudClientProps<T>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>, item?: T) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = item
      ? await actions.update(item.id, formData)
      : await actions.create(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setEditItem(undefined);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await actions.remove(id);
    router.refresh();
  }

  function Form({ item }: { item?: T }) {
    return (
      <form onSubmit={(e) => submit(e, item)} className="space-y-4">
        {fields.map((f) => (
          <div key={f.name} className="space-y-2">
            <Label>{f.label}</Label>
            <Input
              name={f.name}
              type={f.type ?? "text"}
              required={!f.optional}
              defaultValue={
                item ? (item as Record<string, unknown>)[f.name]?.toString() ?? "" : ""
              }
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full rounded-xl bg-[#6C3BFF]">
          {loading ? "Saving..." : item ? "Update" : "Create"}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <InventoryPageHeader title={title} description={description}>
        {canWrite && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-[#6C3BFF]">
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Add {title.slice(0, -1)}</DialogTitle></DialogHeader>
              <Form />
            </DialogContent>
          </Dialog>
        )}
      </InventoryPageHeader>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardContent className="pt-6">
          <ResponsiveTableWrapper
            cards={
              items.length === 0 ? (
                <p className="py-8 text-center text-stone-500">No items yet.</p>
              ) : (
                <div className="divide-y divide-[#ECECEC] rounded-xl border">
                  {items.map((item) => (
                    <InventoryMobileCard key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="font-semibold text-[#1C103D]">{item.name}</p>
                          {detailKey && (
                            <InventoryMobileField label={detailHeader}>
                              {String(item[detailKey] ?? "—")}
                            </InventoryMobileField>
                          )}
                        </div>
                        {canWrite && (
                          <div className="flex shrink-0 gap-1">
                            <InventoryIconButton onClick={() => setEditItem(item)}>
                              <Pencil className="h-4 w-4" />
                            </InventoryIconButton>
                            <InventoryIconButton
                              className="text-red-600"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </InventoryIconButton>
                          </div>
                        )}
                      </div>
                    </InventoryMobileCard>
                  ))}
                </div>
              )
            }
            table={
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {detailKey && <TableHead>{detailHeader}</TableHead>}
                    {canWrite && <TableHead className="w-24" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-stone-500">
                        No items yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        {detailKey && (
                          <TableCell>{String(item[detailKey] ?? "")}</TableCell>
                        )}
                        {canWrite && (
                          <TableCell>
                            <div className="flex gap-1">
                              <InventoryIconButton onClick={() => setEditItem(item)}>
                                <Pencil className="h-4 w-4" />
                              </InventoryIconButton>
                              <InventoryIconButton
                                className="text-red-600"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </InventoryIconButton>
                            </div>
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

      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(undefined)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Edit</DialogTitle></DialogHeader>
          {editItem && <Form item={editItem} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
