"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon, PaperclipIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatDate } from "@/lib/format";
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function AdminSupportTicketPage() {
  const params = useParams<{ ticketId: string }>();
  const sessionToken = useSessionToken();
  const ticketId = params.ticketId as Id<"supportTickets">;
  const thread = useQuery(api.admin.support.thread, { sessionToken, ticketId });
  const currentAdmin = useQuery(api.admins.currentAdmin, { sessionToken });
  const reply = useMutation(api.admin.support.reply);
  const close = useMutation(api.admin.support.close);
  const assign = useMutation(api.admin.support.assign);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (thread === undefined) return null;
  const isClosed = thread.ticket.status === "closed";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      toast.error("Enter a message.");
      return;
    }
    setSubmitting(true);
    try {
      await reply({ sessionToken, ticketId, body: body.trim() });
      setBody("");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose() {
    try {
      await close({ sessionToken, ticketId });
      toast.success("Ticket closed.");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    }
  }

  const isAssignedToMe = !!currentAdmin && thread.ticket.assignedTo === currentAdmin._id;

  async function handleToggleAssign() {
    if (!currentAdmin) return;
    try {
      await assign({ sessionToken, ticketId, assignedTo: isAssignedToMe ? null : currentAdmin._id });
      toast.success(isAssignedToMe ? "Unassigned." : "Assigned to you.");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{thread.ticket.subject}</h1>
          <p className="text-muted-foreground">
            {thread.user ? `${thread.user.firstName} ${thread.user.lastName}` : "Unknown user"} · {thread.user?.email} ·{" "}
            {formatLabel(thread.ticket.category)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={thread.ticket.status} />
          <Button variant="outline" size="sm" onClick={handleToggleAssign}>
            {isAssignedToMe ? "Unassign" : "Assign to Me"}
          </Button>
          {!isClosed && (
            <Button variant="outline" size="sm" onClick={handleClose}>
              Close Ticket
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {thread.messages.map((m) => (
            <div
              key={m._id}
              className={cn(
                "max-w-[85%] rounded-lg border p-3 text-sm",
                m.authorType === "admin" ? "self-end bg-primary/5" : "self-start bg-muted/50"
              )}
            >
              <p className="mb-1 text-xs text-muted-foreground">
                {m.authorType === "admin" ? "Support" : "User"} · {formatDate(m.createdAt)}
              </p>
              <p className="whitespace-pre-wrap">{m.body}</p>
              {m.fileUrl && (
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <PaperclipIcon className="size-3" /> View attachment
                </a>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {!isClosed && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Textarea rows={3} placeholder="Type your reply..." value={body} onChange={(e) => setBody(e.target.value)} />
              <Button type="submit" disabled={submitting} className="self-end">
                {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Send Reply"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
