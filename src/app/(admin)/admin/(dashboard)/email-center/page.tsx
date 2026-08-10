"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Doc } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatDate } from "@/lib/format";
import { formatLabel } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type SegmentKey = "all" | "kyc_approved" | "kyc_pending" | "active_investors" | "has_deposited" | "has_not_invested" | "referral_users";

function ComposeFields({
  subject,
  setSubject,
  body,
  setBody,
}: {
  subject: string;
  setSubject: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-subject">Subject</Label>
        <Input id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-body">Message</Label>
        <Textarea id="email-body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
    </>
  );
}

function IndividualSendTab() {
  const sessionToken = useSessionToken();
  const send = useMutation(api.admin.emailCenter.send);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Doc<"users"> | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const results = useQuery(api.admin.users.list, search.length > 1 ? { sessionToken, search } : "skip");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) {
      toast.error("Select a recipient.");
      return;
    }
    setSubmitting(true);
    try {
      await send({ sessionToken, subject, body, target: { mode: "individual", userId: selected._id } });
      toast.success("Email sent.");
      setSubject("");
      setBody("");
      setSelected(null);
      setSearch("");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {selected ? (
        <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
          <span>
            To: <span className="font-medium">{selected.firstName} {selected.lastName}</span> ({selected.email})
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>
            Change
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="recipient-search">Recipient</Label>
          <Input
            id="recipient-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {results && results.length > 0 && (
            <div className="flex flex-col rounded-lg border">
              {results.slice(0, 5).map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => setSelected(u)}
                  className="border-b p-2 text-left text-sm last:border-b-0 hover:bg-muted/50"
                >
                  {u.firstName} {u.lastName} · {u.email}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <ComposeFields subject={subject} setSubject={setSubject} body={body} setBody={setBody} />
      <Button type="submit" disabled={submitting || !selected} className="self-end">
        {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Send"}
      </Button>
    </form>
  );
}

function BroadcastTab() {
  const sessionToken = useSessionToken();
  const send = useMutation(api.admin.emailCenter.send);
  const counts = useQuery(api.admin.emailCenter.segmentCounts, { sessionToken });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalRecipients = counts?.find((c) => c.segment === "all")?.count ?? 0;

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error("Enter a subject and message.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await send({ sessionToken, subject, body, target: { mode: "segment", segment: "all" } });
      toast.success(`Sent to ${result.recipientCount} users.`);
      setSubject("");
      setBody("");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">This sends to every user on the platform ({totalRecipients} recipients).</p>
      <ComposeFields subject={subject} setSubject={setSubject} body={body} setBody={setBody} />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={submitting} className="self-end">
            {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Broadcast to All Users"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to all {totalRecipients} users?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone once sent.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SegmentTab() {
  const sessionToken = useSessionToken();
  const send = useMutation(api.admin.emailCenter.send);
  const counts = useQuery(api.admin.emailCenter.segmentCounts, { sessionToken });
  const [segment, setSegment] = useState<SegmentKey>("kyc_approved");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const segmentOptions = (counts ?? []).filter((c) => c.segment !== "all");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error("Enter a subject and message.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await send({ sessionToken, subject, body, target: { mode: "segment", segment } });
      toast.success(`Sent to ${result.recipientCount} users.`);
      setSubject("");
      setBody("");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="broadcast-segment">Segment</Label>
        <Select value={segment} onValueChange={(v) => setSegment(v as SegmentKey)}>
          <SelectTrigger id="broadcast-segment" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {segmentOptions.map((s) => (
              <SelectItem key={s.segment} value={s.segment}>
                {formatLabel(s.segment)} ({s.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ComposeFields subject={subject} setSubject={setSubject} body={body} setBody={setBody} />
      <Button type="submit" disabled={submitting} className="self-end">
        {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Send to Segment"}
      </Button>
    </form>
  );
}

function EmailHistory() {
  const sessionToken = useSessionToken();
  const history = useQuery(api.admin.emailCenter.history, { sessionToken });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send history</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(history ?? []).map((log) => (
              <TableRow key={log._id}>
                <TableCell>{log.recipientEmail}</TableCell>
                <TableCell>{log.subject}</TableCell>
                <TableCell>{formatLabel(log.status)}</TableCell>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
              </TableRow>
            ))}
            {history && history.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No emails sent yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminEmailCenterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Email Center</h1>
        <p className="text-muted-foreground">Send individual, broadcast, or segment-targeted emails.</p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Every send is logged below and routed through the platform&apos;s email action.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="individual">
            <TabsList>
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
              <TabsTrigger value="segment">Segment</TabsTrigger>
            </TabsList>
            <TabsContent value="individual">
              <IndividualSendTab />
            </TabsContent>
            <TabsContent value="broadcast">
              <BroadcastTab />
            </TabsContent>
            <TabsContent value="segment">
              <SegmentTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EmailHistory />
    </div>
  );
}
