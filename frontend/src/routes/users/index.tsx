import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/api";

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
              chevron_right
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
        <div className="flex items-center gap-4">
          <Button className="px-6 py-3 rounded-full bg-surface-container-high text-primary font-semibold flex items-center gap-2 hover:scale-95 transition-transform">
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </Button>
          <Button className="px-8 py-3 rounded-full bg-linear-to-br from-tertiary to-tertiary-container text-on-tertiary font-bold flex items-center gap-2 shadow-sm hover:scale-95 transition-transform">
            <span className="material-symbols-outlined">person_add</span>
            Invite Member
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <span className="material-symbols-outlined">group</span>
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
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <span className="material-symbols-outlined">
                  admin_panel_settings
                </span>
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
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
                <span className="material-symbols-outlined">person_add</span>
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

      <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-foreground">
            search
          </span>
          <Input
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-body"
            placeholder="Search by name, email or ID..."
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none px-4 py-3 bg-surface-container-highest text-on-surface-variant rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>
            Filter
          </Button>
          <Button
            variant="outline"
            className="flex-1 md:flex-none px-4 py-3 bg-surface-container-highest text-on-surface-variant rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            Role: All
            <span className="material-symbols-outlined text-sm">
              expand_more
            </span>
          </Button>
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
                        edit
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        delete
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
                chevron_left
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
                chevron_right
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
