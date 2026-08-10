"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { CopyIcon, Loader2Icon } from "lucide-react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Used only until convex/settings.ts's platformConfig query resolves —
// matches DEFAULT_PLATFORM_CONFIG.fiatDepositMinimumUsd server-side.
const FIAT_MINIMUM_FALLBACK = 10_000;

function optionKeyFor(o: { currency: string; network: string }) {
  return `${o.currency}|${o.network}`;
}

function CryptoTab() {
  const sessionToken = useSessionToken();
  const options = useQuery(api.settings.cryptoDepositOptions);
  const deposits = useQuery(api.deposits.myDeposits, { sessionToken });
  const submitCrypto = useMutation(api.deposits.submitCrypto);

  const [optionKey, setOptionKey] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const depositList = deposits ?? [];
  const selected = (options ?? []).find((o) => optionKeyFor(o) === optionKey);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) {
      toast.error("Select a currency and network.");
      return;
    }
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!txHash.trim()) {
      toast.error("Enter the transaction hash.");
      return;
    }

    setSubmitting(true);
    try {
      await submitCrypto({
        sessionToken,
        amountUsd: amountNum,
        currency: selected.currency,
        network: selected.network,
        txHash: txHash.trim(),
      });
      toast.success("Deposit submitted. We'll credit it once verified.");
      setAmount("");
      setTxHash("");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function copyAddress() {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.address);
    toast.success("Address copied to clipboard.");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Deposit crypto</CardTitle>
          <CardDescription>
            Deposits are manually verified once your transaction confirms on-chain — this typically completes
            within minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="deposit-currency">Currency &amp; network</Label>
              <Select value={optionKey} onValueChange={setOptionKey}>
                <SelectTrigger id="deposit-currency" className="w-full">
                  <SelectValue placeholder="Select currency and network" />
                </SelectTrigger>
                <SelectContent>
                  {(options ?? []).map((o) => (
                    <SelectItem key={optionKeyFor(o)} value={optionKeyFor(o)}>
                      {o.currency} ({o.network})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selected && (
              <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
                <span className="text-xs text-muted-foreground">Send to this address</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all text-sm">{selected.address}</code>
                  <Button type="button" variant="outline" size="icon" onClick={copyAddress} aria-label="Copy deposit address">
                    <CopyIcon className="size-4" />
                  </Button>
                </div>
                {selected.note && <p className="text-xs text-muted-foreground">{selected.note}</p>}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="txHash">Transaction hash</Label>
                <Input id="txHash" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="self-end">
              {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Submit deposit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past crypto deposits</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {depositList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No crypto deposits yet.</p>
          ) : (
            depositList.map((d) => (
              <div key={d._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {d.currency} ({d.network})
                  </p>
                  <p className="text-muted-foreground">{formatDate(d.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(d.amountUsd)}</span>
                  <StatusBadge status={d.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FiatTab() {
  const sessionToken = useSessionToken();
  const config = useQuery(api.settings.platformConfig);
  const requestFiatDeposit = useMutation(api.support.requestFiatDeposit);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fiatMinimum = config?.fiatDepositMinimumUsd ?? FIAT_MINIMUM_FALLBACK;
  const amountNum = Number(amount);
  const isValid = Number.isFinite(amountNum) && amountNum >= fiatMinimum;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) {
      toast.error(`Enter at least ${formatCurrency(fiatMinimum)}.`);
      return;
    }
    setSubmitting(true);
    try {
      await requestFiatDeposit({ sessionToken, amountUsd: amountNum });
      toast.success("Support ticket opened. Our team will send you bank details shortly.");
      setAmount("");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit via bank transfer</CardTitle>
        <CardDescription>
          Fiat deposits require a minimum of {formatCurrency(fiatMinimum)} and are processed via bank transfer.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Crypto deposits arrive in your Keystone wallet within minutes. Fiat transfers require manual bank
          verification and typically take longer to clear — we recommend crypto whenever possible for the fastest
          access to your funds.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="fiat-amount">Amount (USD)</Label>
            <Input
              id="fiat-amount"
              type="number"
              min={fiatMinimum}
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={submitting || !isValid}>
            {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Request Fiat Deposit Details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function DepositPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Deposit</h1>
        <p className="text-muted-foreground">Fund your account via crypto or fiat bank transfer.</p>
      </div>
      <Tabs defaultValue="crypto">
        <TabsList>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="fiat">Fiat</TabsTrigger>
        </TabsList>
        <TabsContent value="crypto">
          <CryptoTab />
        </TabsContent>
        <TabsContent value="fiat">
          <FiatTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
