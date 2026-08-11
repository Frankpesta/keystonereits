"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { CheckIcon } from "lucide-react";
import { api } from "@/lib/convex-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGsap, gsap } from "@/hooks/use-gsap";

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    amount
  );
}

/** Reads live from Convex (status: "active") — never hardcoded, so admin plan edits show up immediately. */
export function InvestmentPlanCards() {
  const plans = useQuery(api.investmentPlans.listActive);

  const scope = useGsap<HTMLDivElement>(
    ({ scope: gridScope }) => {
      if (!gridScope.current) return;
      gsap.from(gridScope.current.children, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        force3D: false,
        clearProps: "transform",
      });
    },
    [plans]
  );

  if (plans === undefined) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return <p className="text-center text-muted-foreground">Investment plans will be available shortly.</p>;
  }

  return (
    <div ref={scope} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <div
          key={plan._id}
          className="group flex flex-col overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <span className="-mx-6 -mt-6 mb-6 block h-1 bg-gradient-to-r from-accent to-primary" aria-hidden />
          <h3 className="font-display text-xl font-semibold text-foreground">{plan.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

          <dl className="mt-6 flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Minimum</dt>
              <dd className="font-medium text-foreground">{formatUsd(plan.minAmount)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Weekly ROI</dt>
              <dd className="font-medium text-foreground">{plan.weeklyReturnPercent.toFixed(0)}%</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium text-foreground">{Math.round(plan.durationDays / 365)} Year</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Distribution</dt>
              <dd className="font-medium text-foreground">Weekly</dd>
            </div>
          </dl>

          <ul className="mt-4 flex flex-col gap-2">
            {["Real property backing", "Professionally managed", "Insured underlying assets"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckIcon className="size-3.5 text-success" />
                {f}
              </li>
            ))}
          </ul>

          <Button className="mt-6" asChild>
            <Link href="/signup">Select {plan.name} Plan</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
