"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useApp } from "@/contexts/AppContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LineChart,
  Settings,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logout } = useApp();
  const isAdmin = state.profile?.role?.toLowerCase() === "admin";

  const isActive = (path: string) =>
    pathname === `/dashboard/${path}` ||
    (path === "dashboard" && pathname === "/dashboard");

  useEffect(() => {
    if (state.loading) {
      return;
    }

    if (!state.isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, router, state.isAuthenticated, state.loading]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (state.loading || !state.isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Checking sign-in...</p>
        </div>
      </div>
    );
  }

  const profile = state.profile;
  const roleLabel = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "";

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }];

    if (segments.length > 1) {
      const current = segments[segments.length - 1];
      breadcrumbs.push({
        label: current.charAt(0).toUpperCase() + current.slice(1),
        href: pathname,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar className="border-r border-border bg-surface-container-low">
          <SidebarHeader className="p-4">
            <h1 className="text-lg font-black uppercase tracking-widest text-primary">
              Admin Panel
            </h1>
            <p className="text-sm text-foreground/70">Market Manager</p>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("dashboard")}>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("inventory")}>
                  <Link
                    href="/dashboard/inventory"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Package className="h-5 w-5" />
                    <span>Inventory</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("orders")}>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("users")}>
                  <Link
                    href="/dashboard/users"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Users className="h-5 w-5" />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("analytics")}>
                  <Link
                    href="/dashboard/analytics"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <LineChart className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-border p-3">
            <Link
              href="/dashboard/profile"
              className="mb-3 block overflow-hidden rounded-xl bg-surface-container-low px-3 py-3 transition-transform hover:-translate-y-0.5 hover:bg-surface-container"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs">
                    {profile?.initials || "SO"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-xs font-bold leading-tight">
                    {profile?.displayName || "Signed out"}
                  </p>
                  <p className="truncate text-[10px] leading-snug text-muted-foreground">
                    {profile?.email || "Not signed in"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                    {roleLabel || "Guest"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-primary/80">
                View profile
              </p>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="mb-3 w-full justify-start rounded-xl border-border px-3 py-2.5 text-sm font-medium"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              <span>Log out</span>
            </Button>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("settings")}>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("profile")}
                  variant="outline"
                >
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <User className="h-5 w-5 shrink-0" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 min-w-0 overflow-x-hidden p-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
