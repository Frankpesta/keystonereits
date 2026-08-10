"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { CopyIcon, MailIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ReferralsPage() {
  const sessionToken = useSessionToken();
  const summary = useQuery(api.referrals.mySummary, { sessionToken });
  // Lazy initializer only runs once, before hydration — safe place for the
  // one-time impure `window` read that a plain render-time read isn't.
  const [origin] = useState(() => (typeof window !== "undefined" ? window.location.origin : ""));

  const referralLink = summary && origin ? `${origin}/signup?ref=${summary.referralCode}` : "";
  const referredUsers = summary?.referredUsers ?? [];
  const earnings = summary?.earnings ?? [];

  async function copyLink() {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard.");
  }

  const shareText = "Join me on Keystone REIT and start investing in real estate.";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Referrals</h1>
        <p className="text-muted-foreground">Invite friends and earn a share of their investment activity.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your referral link</CardTitle>
          <CardDescription>Share this link — anyone who signs up through it is linked to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input readOnly value={referralLink} className="font-mono text-sm" />
            <Button type="button" variant="outline" size="icon" onClick={copyLink} aria-label="Copy referral link">
              <CopyIcon className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={`mailto:?subject=${encodeURIComponent("Join me on Keystone REIT")}&body=${encodeURIComponent(`${shareText} ${referralLink}`)}`}
              >
                <MailIcon className="size-4" />
                Email
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                X / Twitter
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referred users</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {referredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrals yet.</p>
            ) : (
              referredUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span className="font-medium">
                    {u.firstName} {u.lastName}
                  </span>
                  <span className="text-muted-foreground">Joined {formatDate(u.createdAt)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Referral earnings</CardTitle>
            <span className="font-medium">{summary ? formatCurrency(summary.totalEarned) : "—"}</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {earnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referral earnings yet.</p>
            ) : (
              earnings.map((e) => (
                <div key={e._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground">{formatDate(e.createdAt)}</span>
                  <span className="font-medium">{formatCurrency(e.amount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
