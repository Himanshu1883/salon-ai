"use client";

import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Building2,
  Users,
  Scissors,
  UserCircle,
  Tag,
  FileText,
  Star,
  RotateCcw,
  FileDown,
  Sheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import {
  REPORT_CATEGORIES,
  type ReportCategory,
} from "@/lib/reports-catalog";

type Props = {
  search: string;
  createdBy: string;
  category: ReportCategory | "all";
  onSearchChange: (v: string) => void;
  onCreatedByChange: (v: string) => void;
  onApplyFilters: (category?: ReportCategory | "all") => void;
  onReset: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
};

function StubFilter({
  icon: Icon,
  label,
  stacked = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  stacked?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled
      title="Coming soon"
      className={
        stacked
          ? "h-11 w-full rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-[#9CA3AF] opacity-70"
          : "h-9 rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-[#9CA3AF] opacity-70"
      }
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

function ReportFilterFields({
  createdBy,
  category,
  onCreatedByChange,
  onApplyFilters,
  stacked = false,
}: {
  createdBy: string;
  category: ReportCategory | "all";
  onCreatedByChange: (v: string) => void;
  onApplyFilters: (category?: ReportCategory | "all") => void;
  stacked?: boolean;
}) {
  const triggerClass = stacked
    ? "h-11 w-full rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm"
    : "h-9 w-[130px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm";

  return (
    <>
      <StubFilter icon={Calendar} label="Date Range" stacked={stacked} />
      <StubFilter icon={Building2} label="Branch" stacked={stacked} />
      <StubFilter icon={Users} label="Staff" stacked={stacked} />
      <StubFilter icon={Scissors} label="Service" stacked={stacked} />
      <StubFilter icon={UserCircle} label="Customer" stacked={stacked} />

      <Select
        value={category}
        onValueChange={(v) => onApplyFilters(v as ReportCategory | "all")}
      >
        <SelectTrigger className={triggerClass}>
          {!stacked && <Tag className="mr-1.5 h-3.5 w-3.5 text-[#6C3BFF]" />}
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {REPORT_CATEGORIES.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={createdBy} onValueChange={onCreatedByChange}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Created by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Created by</SelectItem>
          <SelectItem value="Go Tix">Go Tix</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all">
        <SelectTrigger className={triggerClass}>
          {!stacked && <FileText className="mr-1.5 h-3.5 w-3.5 text-[#6C3BFF]" />}
          <SelectValue placeholder="Report type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All reports</SelectItem>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="premium">Premium</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

export function ReportsFilterToolbar({
  search,
  createdBy,
  category,
  onSearchChange,
  onCreatedByChange,
  onApplyFilters,
  onReset,
  onExportPdf,
  onExportExcel,
}: Props) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
      <div className="space-y-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            placeholder="Search by report name or description…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onApplyFilters()}
            className="h-11 rounded-xl border-[#E8ECF4] bg-[#F7F8FC] pl-9 text-sm"
          />
        </div>

        <div className="hidden flex-wrap items-center gap-2 lg:flex">
          <ReportFilterFields
            createdBy={createdBy}
            category={category}
            onCreatedByChange={onCreatedByChange}
            onApplyFilters={onApplyFilters}
          />

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#E8ECF4] bg-[#F7F8FC]"
            onClick={() => router.push("/reports/favourites")}
          >
            <Star className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            Saved Reports
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#E8ECF4] bg-[#F7F8FC]"
            onClick={onReset}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#E8ECF4] bg-[#F7F8FC]"
            onClick={onExportPdf}
          >
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#E8ECF4] bg-[#F7F8FC]"
            onClick={onExportExcel}
          >
            <Sheet className="mr-1.5 h-3.5 w-3.5" />
            Excel
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 lg:hidden">
          <FilterDrawer
            triggerLabel="Report filters"
            onApply={() => onApplyFilters()}
            onReset={onReset}
            className="flex-1 min-w-[140px]"
          >
            <ReportFilterFields
              createdBy={createdBy}
              category={category}
              onCreatedByChange={onCreatedByChange}
              onApplyFilters={onApplyFilters}
              stacked
            />
          </FilterDrawer>

          <Button
            variant="outline"
            className="h-11 min-h-[48px] flex-1 rounded-xl border-[#E8ECF4] bg-[#F7F8FC]"
            onClick={() => router.push("/reports/favourites")}
          >
            <Star className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            Saved
          </Button>
        </div>
      </div>
    </div>
  );
}
