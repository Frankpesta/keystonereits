"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CryptoOption = { currency: string; network: string; address: string; note: string };

function PlatformConfigCard() {
  const sessionToken = useSessionToken();
  const config = useQuery(api.settings.platformConfig, {});
  const update = useMutation(api.admin.settings.updatePlatformConfig);

  const [platformName, setPlatformName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [fiatMinimum, setFiatMinimum] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync local editable form state the first time the query resolves (and
  // whenever it's refetched with a new object) — adjusting state during
  // render, React's documented alternative to useEffect+setState for this.
  const [syncedConfig, setSyncedConfig] = useState(config);
  if (config && config !== syncedConfig) {
    setSyncedConfig(config);
    setPlatformName(config.platformName);
    setContactEmail(config.contactEmail);
    setFiatMinimum(String(config.fiatDepositMinimumUsd));
    setMaintenanceMode(config.maintenanceMode);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await update({
        sessionToken,
        platformName,
        contactEmail,
        fiatDepositMinimumUsd: Number(fiatMinimum),
        maintenanceMode,
      });
      toast.success("Settings saved.");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>Branding, contact info, and deposit configuration.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="platform-name">Platform name</Label>
              <Input id="platform-name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-email">Contact email</Label>
              <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="fiat-minimum">Fiat deposit minimum (USD)</Label>
            <Input
              id="fiat-minimum"
              type="number"
              min={0}
              value={fiatMinimum}
              onChange={(e) => setFiatMinimum(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={(checked) => setMaintenanceMode(checked === true)}
            />
            <Label htmlFor="maintenance-mode" className="font-normal">
              Maintenance mode
            </Label>
          </div>
          <Button type="submit" disabled={submitting} className="self-end">
            {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CryptoOptionsCard() {
  const sessionToken = useSessionToken();
  const options = useQuery(api.settings.cryptoDepositOptions, {});
  const update = useMutation(api.admin.settings.updateCryptoDepositOptions);

  const [rows, setRows] = useState<CryptoOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [syncedOptions, setSyncedOptions] = useState(options);
  if (options && options !== syncedOptions) {
    setSyncedOptions(options);
    setRows(options.map((o) => ({ currency: o.currency, network: o.network, address: o.address, note: o.note ?? "" })));
  }

  function updateRow(index: number, patch: Partial<CryptoOption>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSave() {
    setSubmitting(true);
    try {
      await update({
        sessionToken,
        options: rows.map((r) => ({ currency: r.currency, network: r.network, address: r.address, note: r.note || undefined })),
      });
      toast.success("Crypto deposit options saved.");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Deposit Addresses</CardTitle>
        <CardDescription>These power the currency/network picker on the user deposit page.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rows.map((row, i) => (
          <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_2fr_auto]">
            <Input placeholder="Currency (USDT)" value={row.currency} onChange={(e) => updateRow(i, { currency: e.target.value })} />
            <Input placeholder="Network (TRC20)" value={row.network} onChange={(e) => updateRow(i, { network: e.target.value })} />
            <Input placeholder="Receiving address" value={row.address} onChange={(e) => updateRow(i, { address: e.target.value })} />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
              aria-label="Remove wallet address"
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => setRows((prev) => [...prev, { currency: "", network: "", address: "", note: "" }])}
        >
          <PlusIcon className="size-4" />
          Add Option
        </Button>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={submitting}>
          {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Save Crypto Options"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Platform-wide configuration.</p>
      </div>
      <PlatformConfigCard />
      <CryptoOptionsCard />
    </div>
  );
}
