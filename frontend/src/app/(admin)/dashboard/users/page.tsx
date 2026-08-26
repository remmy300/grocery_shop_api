"use client";

import { useEffect, useState } from "react";
import {
  Download,
  ShieldCheck,
  UserPlus,
  Users,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CsvExportButton } from "@/components/CsvExportButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

type UsersResponse = {
  stats: {
    totalUsers: number;
    activeAdmins: number;
    customers: number;
  };
  users: Array<{
    id: string;
    userId: number;
    name: string;
    initials: string;
    email: string;
    role: string;
    joinDate: string;
  }>;
};

const UsersPage = () => {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    userId: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/api/admin/users/${deleteTarget.userId}`, {
        method: "DELETE",
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              stats: { ...prev.stats, totalUsers: prev.stats.totalUsers - 1 },
              users: prev.users.filter(
                (user) => user.userId !== deleteTarget.userId,
              ),
            }
          : prev,
      );
      toast.success("User deleted");
      setDeleteTarget(null);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete user",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<UsersResponse>("/api/admin/users");
        if (!active) return;
        setData(response);
        setError(null);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load users",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || "Unable to load users"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="mb-4 flex items-center gap-2 text-xs font-label uppercase tracking-widest text-secondary-foreground">
            <span>Admin</span>
            <span className="material-symbols-outlined text-xs">
              <ChevronRight />
            </span>
            <span className="text-foreground font-bold">User Management</span>
          </nav>
          <h2 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Curation of Members
          </h2>
          <p className="mt-2 max-w-xl font-body text-secondary-foreground">
            Oversee the Botanical Archivist community. Manage permissions, audit
            join dates, and maintain the integrity of our member registry.
          </p>
        </div>
        <CsvExportButton
          rows={data.users}
          columns={[
            { header: "User ID", value: (user) => user.id },
            { header: "Name", value: (user) => user.name },
            { header: "Email", value: (user) => user.email },
            { header: "Role", value: (user) => user.role },
            { header: "Join Date", value: (user) => user.joinDate },
          ]}
          filename="users"
          className="px-6 py-3 rounded-full bg-surface-container-high text-primary font-semibold flex items-center gap-2 hover:scale-95 transition-transform"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </CsvExportButton>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <Badge className="bg-primary/10 text-primary text-xs font-bold px-2 py-1">
                Live
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Total Community
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.stats.totalUsers}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Active Admins
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.stats.activeAdmins}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <UserPlus className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Customer Accounts
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {data.stats.customers}
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between">
        <div className="relative w-full md:w-96  p-3">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-foreground">
            {<SearchIcon />}
          </span>
          <Input
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-body"
            placeholder="Search by name, email or ID..."
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low border-none">
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                User ID
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Name
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Email Address
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Role
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Join Date
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.map((user) => (
              <TableRow
                key={user.userId}
                className="hover:bg-surface-container-low/50 transition-colors group"
              >
                <TableCell className="px-6 py-5 text-sm font-mono text-secondary">
                  {user.id}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">
                      {user.initials}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {user.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-sm text-secondary-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <Badge
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                      user.role === "Admin"
                        ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-5 text-sm text-secondary-foreground font-body">
                  {user.joinDate}
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        <Pencil />
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                      onClick={() =>
                        setDeleteTarget({
                          userId: user.userId,
                          name: user.name,
                        })
                      }
                    >
                      <span className="material-symbols-outlined text-lg">
                        <Trash />
                      </span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
          <span className="text-xs text-secondary-foreground font-label">
            Showing {data.users.length} members
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              disabled
            >
              <span className="material-symbols-outlined text-sm">
                <ChevronLeft />
              </span>
            </Button>
            <div className="flex gap-1">
              <Button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                1
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              disabled
            >
              <span className="material-symbols-outlined text-sm">
                <ChevronRight />
              </span>
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.name} from the
              community registry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
