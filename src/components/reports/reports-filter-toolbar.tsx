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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled
      title="Coming soon"
      className="h-9 rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-[#9CA3AF] opacity-70"
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Button>
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            placeholder="Search by report name or description…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onApplyFilters()}
            className="h-9 rounded-xl border-[#E8ECF4] bg-[#F7F8FC] pl-9 text-sm"
          />
        </div>

        <StubFilter icon={Calendar} label="Date Range" />
        <StubFilter icon={Building2} label="Branch" />
        <StubFilter icon={Users} label="Staff" />
        <StubFilter icon={Scissors} label="Service" />
        <StubFilter icon={UserCircle} label="Customer" />

        <Select
          value={category}
          onValueChange={(v) => onApplyFilters(v as ReportCategory | "all")}
        >
          <SelectTrigger className="h-9 w-[130px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm">
            <Tag className="mr-1.5 h-3.5 w-3.5 text-[#6C3BFF]" />
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
          <SelectTrigger className="h-9 w-[130px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm">
            <SelectValue placeholder="Created by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Created by</SelectItem>
            <SelectItem value="Glow Desk">Glow Desk</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-[130px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm">
            <FileText className="mr-1.5 h-3.5 w-3.5 text-[#6C3BFF]" />
            <SelectValue placeholder="Report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reports</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>

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
    </div>
  );
}
