"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  createMembershipBenefit,
} from "@/actions/memberships";
import { MembershipPageHeader } from "@/components/memberships/memberships-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  PLAN_TYPE_LABELS,
  MEMBERSHIP_PRIMARY,
  MEMBERSHIP_GOLD,
} from "@/lib/memberships/constants";
import { Crown, Plus, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import type { MembershipPlanType, MembershipPlanStatus } from "@/generated/prisma/enums";

type PlanWithBenefits = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  type: MembershipPlanType;
  validityDays: number;
  price: number;
  discountPercent: number;
  walletBonus: number;
  rewardMultiplier: number;
  priorityBooking: boolean;
  vipAccess: boolean;
  themeColor: string;
  status: MembershipPlanStatus;
  benefits: { benefit: { id: string; name: string } }[];
  _count: { customerMemberships: number };
};

type Benefit = { id: string; name: string; type: string };

function PlanForm({
  plan,
  benefits,
  onSuccess,
}: {
  plan?: PlanWithBenefits;
  benefits: Benefit[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    plan?.benefits.map((b) => b.benefit.id) ?? []
  );

  const [planType, setPlanType] = useState<MembershipPlanType>(plan?.type ?? "MONTHLY");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      category: (fd.get("category") as string) || "Standard",
      type: planType,
      validityDays: Number(fd.get("validityDays")),
      price: Number(fd.get("price")),
      discountPercent: Number(fd.get("discountPercent") || 0),
      walletBonus: Number(fd.get("walletBonus") || 0),
      rewardMultiplier: Number(fd.get("rewardMultiplier") || 1),
      priorityBooking: fd.get("priorityBooking") === "on",
      vipAccess: fd.get("vipAccess") === "on",
      themeColor: (fd.get("themeColor") as string) || MEMBERSHIP_PRIMARY,
      benefitIds: selectedBenefits,
    };

    const result = plan
      ? await updateMembershipPlan(plan.id, data)
      : await createMembershipPlan(data);

    setLoading(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Plan name</Label>
          <Input name="name" required defaultValue={plan?.name} className="rounded-xl" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Textarea
            name="description"
            rows={2}
            defaultValue={plan?.description ?? ""}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Input name="category" defaultValue={plan?.category ?? "Standard"} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={planType} onValueChange={(v) => setPlanType(v as MembershipPlanType)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PLAN_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Validity (days)</Label>
          <Input
            name="validityDays"
            type="number"
            required
            defaultValue={plan?.validityDays ?? 30}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input
            name="price"
            type="number"
            required
            defaultValue={plan?.price ?? 999}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Service discount %</Label>
          <Input
            name="discountPercent"
            type="number"
            defaultValue={plan?.discountPercent ?? 0}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Wallet bonus (₹)</Label>
          <Input
            name="walletBonus"
            type="number"
            defaultValue={plan?.walletBonus ?? 0}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label>Theme color</Label>
          <Input
            name="themeColor"
            type="color"
            defaultValue={plan?.themeColor ?? MEMBERSHIP_PRIMARY}
            className="h-10 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="priorityBooking"
              defaultChecked={plan?.priorityBooking}
            />
            Priority booking
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="vipAccess" defaultChecked={plan?.vipAccess} />
            VIP access
          </label>
        </div>
      </div>

      {benefits.length > 0 && (
        <div className="space-y-2">
          <Label>Benefits</Label>
          <div className="flex flex-wrap gap-2">
            {benefits.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() =>
                  setSelectedBenefits((prev) =>
                    prev.includes(b.id)
                      ? prev.filter((id) => id !== b.id)
                      : [...prev, b.id]
                  )
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selectedBenefits.includes(b.id)
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-emerald-50"
                )}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl text-white"
        style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : plan ? "Update plan" : "Create plan"}
      </Button>
    </form>
  );
}

export function MembershipPlansClient({
  plans,
  benefits,
}: {
  plans: PlanWithBenefits[];
  benefits: Benefit[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<PlanWithBenefits | null>(null);
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [benefitLoading, setBenefitLoading] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Archive this plan?")) return;
    await deleteMembershipPlan(id);
    router.refresh();
  }

  async function handleCreateBenefit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBenefitLoading(true);
    const fd = new FormData(e.currentTarget);
    await createMembershipBenefit({
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      type: "OTHER",
    });
    setBenefitLoading(false);
    setBenefitOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <MembershipPageHeader
        title="Membership Plans"
        description="Design premium tiers with benefits, pricing, and perks."
      >
        <div className="flex gap-2">
          <Dialog open={benefitOpen} onOpenChange={setBenefitOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                <Sparkles className="mr-2 h-4 w-4" />
                Add Benefit
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New benefit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBenefit} className="space-y-4">
                <Input name="name" placeholder="Benefit name" required className="rounded-xl" />
                <Textarea name="description" placeholder="Description" className="rounded-xl" />
                <Button
                  type="submit"
                  disabled={benefitLoading}
                  className="w-full rounded-xl"
                  style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
                >
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-xl text-white"
                style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create membership plan</DialogTitle>
              </DialogHeader>
              <PlanForm
                benefits={benefits}
                onSuccess={() => {
                  setCreateOpen(false);
                  router.refresh();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </MembershipPageHeader>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
          >
            <div
              className="h-2"
              style={{ backgroundColor: plan.themeColor }}
            />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown
                      className="h-5 w-5"
                      style={{ color: plan.vipAccess ? MEMBERSHIP_GOLD : plan.themeColor }}
                    />
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                      {plan.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{plan.description}</p>
                </div>
                <Badge
                  variant={plan.status === "ACTIVE" ? "default" : "secondary"}
                  className="rounded-lg"
                >
                  {plan.status}
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-stone-900 dark:text-white">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-sm text-stone-500">
                  / {PLAN_TYPE_LABELS[plan.type]?.toLowerCase() ?? plan.type}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {plan.discountPercent > 0 && (
                  <Badge className="rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    {plan.discountPercent}% off
                  </Badge>
                )}
                {plan.walletBonus > 0 && (
                  <Badge className="rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-100">
                    ₹{plan.walletBonus} bonus
                  </Badge>
                )}
                {plan.priorityBooking && (
                  <Badge variant="outline" className="rounded-lg">
                    Priority
                  </Badge>
                )}
                {plan.vipAccess && (
                  <Badge
                    className="rounded-lg text-white"
                    style={{ backgroundColor: MEMBERSHIP_GOLD }}
                  >
                    VIP
                  </Badge>
                )}
              </div>

              {plan.benefits.length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-stone-100 pt-4 dark:border-stone-800">
                  {plan.benefits.map(({ benefit }) => (
                    <li
                      key={benefit.id}
                      className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: plan.themeColor }}
                      />
                      {benefit.name}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800">
                <span className="text-xs text-stone-500">
                  {plan._count.customerMemberships} members · {plan.validityDays} days
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => setEditPlan(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="rounded-3xl border border-dashed border-emerald-200 p-12 text-center">
          <Crown className="mx-auto h-10 w-10 text-emerald-400" />
          <p className="mt-3 font-medium text-stone-900">No plans yet</p>
          <p className="text-sm text-stone-500">Create your first membership tier to get started.</p>
        </div>
      )}

      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {editPlan?.name}</DialogTitle>
          </DialogHeader>
          {editPlan && (
            <PlanForm
              plan={editPlan}
              benefits={benefits}
              onSuccess={() => {
                setEditPlan(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
