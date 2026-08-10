"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Doc } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatDate } from "@/lib/format";
import { formatLabel } from "@/components/shared/status-badge";
import { ADMIN_ROLES, type AdminRole } from "@/lib/admin-access";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function NewAdminDialog() {
  const sessionToken = useSessionToken();
  const create = useMutation(api.admin.admins.create);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("support");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await create({ sessionToken, name, email, password, role });
      toast.success("Admin created.");
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("support");
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
          New Admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new admin</DialogTitle>
          <DialogDescription>They can sign in immediately with the password you set here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-name">Name</Label>
            <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-password">Temporary password</Label>
            <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
              <SelectTrigger id="admin-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {formatLabel(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Create Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminRow({ admin, currentAdminId }: { admin: Doc<"admins">; currentAdminId: string | undefined }) {
  const sessionToken = useSessionToken();
  const updateRole = useMutation(api.admin.admins.updateRole);
  const setStatus = useMutation(api.admin.admins.setStatus);
  const isSelf = admin._id === currentAdminId;

  return (
    <TableRow>
      <TableCell className="font-medium">{admin.name}</TableCell>
      <TableCell>{admin.email}</TableCell>
      <TableCell>
        <Select
          value={admin.role}
          disabled={isSelf}
          onValueChange={async (role) => {
            try {
              await updateRole({ sessionToken, adminId: admin._id, role: role as AdminRole });
              toast.success("Role updated.");
            } catch (err) {
              toast.error(getConvexErrorMessage(err));
            }
          }}
        >
          <SelectTrigger className="w-40" aria-label={`Change role for ${admin.email}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {formatLabel(r)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>{formatDate(admin.createdAt)}</TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          disabled={isSelf}
          onClick={async () => {
            try {
              await setStatus({ sessionToken, adminId: admin._id, status: admin.status === "active" ? "disabled" : "active" });
              toast.success(admin.status === "active" ? "Admin disabled." : "Admin re-enabled.");
            } catch (err) {
              toast.error(getConvexErrorMessage(err));
            }
          }}
        >
          {admin.status === "active" ? "Disable" : "Enable"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminAdminsPage() {
  const sessionToken = useSessionToken();
  const admins = useQuery(api.admin.admins.list, { sessionToken });
  const currentAdmin = useQuery(api.admins.currentAdmin, { sessionToken });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Admins &amp; Roles</h1>
          <p className="text-muted-foreground">Manage who has access to the admin console.</p>
        </div>
        <NewAdminDialog />
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(admins ?? []).map((admin) => (
                <AdminRow key={admin._id} admin={admin} currentAdminId={currentAdmin?._id} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
