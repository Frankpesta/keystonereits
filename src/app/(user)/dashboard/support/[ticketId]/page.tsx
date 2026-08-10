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
import { uploadFile } from "@/lib/upload-file";
import { formatDate } from "@/lib/format";
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function SupportTicketPage() {
  const params = useParams<{ ticketId: string }>();
  const sessionToken = useSessionToken();
  const ticketId = params.ticketId as Id<"supportTickets">;
  const thread = useQuery(api.support.ticketMessages, { sessionToken, ticketId });
  const postMessage = useMutation(api.support.postMessage);
  const generateUploadUrl = useMutation(api.support.generateUploadUrl);

  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
      let fileId: Id<"_storage"> | undefined;
      if (file) {
        const uploadUrl = await generateUploadUrl({ sessionToken });
        fileId = await uploadFile(uploadUrl, file);
      }
      await postMessage({ sessionToken, ticketId, body: body.trim(), fileId });
      setBody("");
      setFile(null);
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{thread.ticket.subject}</h1>
          <p className="text-muted-foreground">{formatLabel(thread.ticket.category)}</p>
        </div>
        <StatusBadge status={thread.ticket.status} />
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
                m.authorType === "user" ? "self-end bg-primary/5" : "self-start bg-muted/50"
              )}
            >
              <p className="mb-1 text-xs text-muted-foreground">
                {m.authorType === "user" ? "You" : "Support"} · {formatDate(m.createdAt)}
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

      {isClosed ? (
        <p className="text-sm text-muted-foreground">
          This ticket is closed. Open a new ticket if you need further help.
        </p>
      ) : (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Textarea
                rows={3}
                placeholder="Type your reply..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                  <PaperclipIcon className="size-4" />
                  {file ? file.name : "Attach a file"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Send"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
