"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Calendar,
  Sparkles,
  Heart,
  Clock,
  IndianRupee,
  Cake,
  UserX,
  Repeat,
  Crown,
  Moon,
  Search,
  Plus,
  ChevronDown,
  Users,
  Trash2,
  Eye,
} from "lucide-react";
import { createCustomSegment, deleteCustomSegment } from "@/actions/segments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SegmentListItem } from "@/actions/segments";
import type { SegmentIconKey } from "@/lib/segments";

const ICON_MAP: Record<
  SegmentIconKey | "sparkles",
  React.ComponentType<{ className?: string }>
> = {
  "user-plus": UserPlus,
  calendar: Calendar,
  sparkles: Sparkles,
  heart: Heart,
  clock: Clock,
  "indian-rupee": IndianRupee,
  cake: Cake,
  "user-x": UserX,
  repeat: Repeat,
  crown: Crown,
  moon: Moon,
};

function SegmentIcon({ iconKey }: { iconKey: string }) {
  const Icon = ICON_MAP[iconKey as SegmentIconKey] ?? Users;
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
      <Icon className="h-5 w-5" />
    </div>
  );
}

function AddSegmentForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createCustomSegment(new FormData(e.currentTarget));
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Segment name</Label>
        <Input id="name" name="name" required placeholder="e.g. Wedding season" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe who belongs in this segment"
          rows={3}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create segment"}
      </Button>
    </form>
  );
}

function SegmentRow({
  segment,
  isCustom,
  onDelete,
}: {
  segment: SegmentListItem;
  isCustom?: boolean;
  onDelete?: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-stone-300">
      <Link
        href={`/clients/segments/${segment.id}`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <SegmentIcon iconKey={segment.iconKey} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-stone-900">{segment.name}</h3>
            <Badge variant="secondary">{segment.clientCount}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-stone-500">{segment.description}</p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Actions
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/clients/segments/${segment.id}`)}
          >
            <Eye className="h-4 w-4" />
            View clients
          </DropdownMenuItem>
          {isCustom && onDelete && (
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => onDelete(segment.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function SegmentsClient({
  standardSegments,
  customSegments,
  totalCount,
}: {
  standardSegments: SegmentListItem[];
  customSegments: SegmentListItem[];
  totalCount: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filteredStandard = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return standardSegments;
    return standardSegments.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [search, standardSegments]);

  const filteredCustom = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customSegments;
    return customSegments.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [search, customSegments]);

  async function handleDelete(id: string) {
    const result = await deleteCustomSegment(id);
    if (!result.error) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-stone-900">Client segments</h1>
            <Badge>{totalCount} segments</Badge>
          </div>
          <p className="mt-1 text-stone-500">
            Automated segments for marketing, reporting, and calendar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Options
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Export segments</DropdownMenuItem>
              <DropdownMenuItem disabled>Import segments</DropdownMenuItem>
              <DropdownMenuItem disabled>Segment settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create custom segment</DialogTitle>
              </DialogHeader>
              <AddSegmentForm
                onSuccess={() => {
                  setAddOpen(false);
                  router.refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="standard">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="standard">
              Standard ({standardSegments.length})
            </TabsTrigger>
            <TabsTrigger value="custom">
              Custom ({customSegments.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="standard" className="mt-4 space-y-3">
          {filteredStandard.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500">
              No segments match your search.
            </p>
          ) : (
            filteredStandard.map((segment) => (
              <SegmentRow key={segment.id} segment={segment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="custom" className="mt-4 space-y-3">
          {filteredCustom.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-stone-400" />
              <p className="mt-2 text-sm font-medium text-stone-700">
                No custom segments yet
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Create a segment to group clients for campaigns and reports.
              </p>
              <Button className="mt-4" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Add segment
              </Button>
            </div>
          ) : (
            filteredCustom.map((segment) => (
              <SegmentRow
                key={segment.id}
                segment={segment}
                isCustom
                onDelete={handleDelete}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
