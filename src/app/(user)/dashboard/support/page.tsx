"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Doc } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatDate } from "@/lib/format";
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const CATEGORIES: { value: Doc<"supportTickets">["category"]; label: string }[] = [
  { value: "general", label: "General" },
  { value: "kyc", label: "KYC" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "fiat_deposit", label: "Fiat Deposit" },
  { value: "other", label: "Other" },
];

function NewTicketDialog() {
  const router = useRouter();
  const sessionToken = useSessionToken();
  const createTicket = useMutation(api.support.createTicket);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<Doc<"supportTickets">["category"]>("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Enter a subject and message.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createTicket({ sessionToken, subject: subject.trim(), category, message: message.trim() });
      setOpen(false);
      setSubject("");
      setMessage("");
      setCategory("general");
      router.push(`/dashboard/support/${result.ticketId}`);
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" />
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New support ticket</DialogTitle>
          <DialogDescription>Our team typically responds within one business day.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input id="ticket-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger id="ticket-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-message">Message</Label>
            <Textarea id="ticket-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SupportPage() {
  const sessionToken = useSessionToken();
  const tickets = useQuery(api.support.myTickets, { sessionToken });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Support</h1>
          <p className="text-muted-foreground">Get help from our team.</p>
        </div>
        <NewTicketDialog />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2">
          {(tickets ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No support tickets yet.</p>
          ) : (
            (tickets ?? []).map((t) => (
              <Link
                key={t._id}
                href={`/dashboard/support/${t._id}`}
                className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-muted-foreground">
                    {formatLabel(t.category)} · {formatDate(t.updatedAt)}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
