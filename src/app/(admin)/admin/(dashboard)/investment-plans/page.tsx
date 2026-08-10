"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Doc } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Plan = Doc<"investmentPlans">;
const STATUSES = ["draft", "active", "paused", "closed", "archived"] as const;

function PlanFormDialog({ plan, trigger }: { plan?: Plan; trigger: React.ReactNode }) {
  const sessionToken = useSessionToken();
  const create = useMutation(api.admin.investmentPlans.create);
  const update = useMutation(api.admin.investmentPlans.update);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [minAmount, setMinAmount] = useState(String(plan?.minAmount ?? ""));
  const [maxAmount, setMaxAmount] = useState(String(plan?.maxAmount ?? ""));
  const [durationDays, setDurationDays] = useState(String(plan?.durationDays ?? ""));
  const [dailyReturnPercent, setDailyReturnPercent] = useState(String(plan?.dailyReturnPercent ?? ""));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const fields = {
      sessionToken,
      name,
      description,
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
      durationDays: Number(durationDays),
      dailyReturnPercent: Number(dailyReturnPercent),
    };
    setSubmitting(true);
    try {
      if (plan) {
        await update({ ...fields, planId: plan._id });
        toast.success("Plan updated.");
      } else {
        await create(fields);
        toast.success("Plan created as a draft.");
      }
      setOpen(false);
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? "Edit plan" : "New investment plan"}</DialogTitle>
          <DialogDescription>{plan ? "Update the plan's terms." : "New plans start as drafts."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan-name">Name</Label>
            <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan-description">Description</Label>
            <Textarea id="plan-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-min">Min amount (USD)</Label>
              <Input id="plan-min" type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-max">Max amount (USD)</Label>
              <Input id="plan-max" type="number" min={0} value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-duration">Duration (days)</Label>
              <Input id="plan-duration" type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan-return">Daily return (%)</Label>
              <Input
                id="plan-return"
                type="number"
                min={0}
                step="0.01"
                value={dailyReturnPercent}
                onChange={(e) => setDailyReturnPercent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2Icon className="size-4 animate-spin" /> : plan ? "Save changes" : "Create plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatusSelect({ plan }: { plan: Plan }) {
  const sessionToken = useSessionToken();
  const setStatus = useMutation(api.admin.investmentPlans.setStatus);

  return (
    <Select
      value={plan.status}
      onValueChange={async (status) => {
        try {
          await setStatus({ sessionToken, planId: plan._id, status: status as (typeof STATUSES)[number] });
          toast.success(`Plan marked ${status}.`);
        } catch (err) {
          toast.error(getConvexErrorMessage(err));
        }
      }}
    >
      <SelectTrigger className="w-full" aria-label={`Change status for ${plan.name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminInvestmentPlansPage() {
  const sessionToken = useSessionToken();
  const plans = useQuery(api.admin.investmentPlans.list, { sessionToken });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Investment Plans</h1>
          <p className="text-muted-foreground">Manage the plans available to investors.</p>
        </div>
        <PlanFormDialog
          trigger={
            <Button>
              <PlusIcon className="size-4" />
              New Plan
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(plans ?? []).map((plan) => (
          <Card key={plan._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <StatusBadge status={plan.status} />
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min / Max</span>
                <span className="font-medium">
                  {formatCurrency(plan.minAmount)} – {formatCurrency(plan.maxAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{plan.durationDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily return</span>
                <span className="font-medium">{plan.dailyReturnPercent.toFixed(2)}%</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <StatusSelect plan={plan} />
              <div className="flex w-full gap-2">
                <PlanFormDialog plan={plan} trigger={<Button variant="outline" className="flex-1">Edit</Button>} />
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/admin/investments?plan=${plan._id}`}>View Investors</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
