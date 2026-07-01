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
  SidebarTrigger,
  useSidebar,
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
  Leaf,
  Package,
  ShoppingBag,
  Users,
  LineChart,
  Settings,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";

const NAV_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    key: "dashboard",
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: Package,
    key: "inventory",
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: ShoppingBag,
    key: "orders",
  },
  { href: "/dashboard/users", label: "Users", icon: Users, key: "users" },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: LineChart,
    key: "analytics",
  },
  { href: "/", label: "Home Page", icon: Leaf, key: "home" },
];

const FOOTER_LINKS = [
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    key: "settings",
  },
  { href: "/dashboard/profile", label: "Profile", icon: User, key: "profile" },
];

function AdminSidebar({
  pathname,
  profile,
  roleLabel,
  onLogout,
}: {
  pathname: string;
  profile: { initials?: string; displayName?: string; email?: string } | null;
  roleLabel: string;
  onLogout: () => void;
}) {
  const { setOpenMobile, isMobile } = useSidebar();

  const isActive = (key: string) =>
    pathname === `/dashboard/${key}` ||
    (key === "dashboard" && pathname === "/dashboard");

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border bg-surface-container-low">
      <SidebarHeader className="p-4">
        <h1 className="text-lg font-black uppercase tracking-widest text-primary">
          Admin Panel
        </h1>
        <p className="text-sm text-foreground/70">Market Manager</p>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-4">
        <SidebarMenu>
          {NAV_LINKS.map(({ href, label, icon: Icon, key }) => (
            <SidebarMenuItem key={key}>
              <SidebarMenuButton asChild isActive={isActive(key)}>
                <Link
                  href={href}
                  onClick={closeOnMobile}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        {/* Profile card */}
        <Link
          href="/dashboard/profile"
          onClick={closeOnMobile}
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

        {/* Footer nav links */}
        <SidebarMenu className="mb-1">
          {FOOTER_LINKS.map(({ href, label, icon: Icon, key }) => (
            <SidebarMenuItem key={key}>
              <SidebarMenuButton asChild isActive={isActive(key)}>
                <Link
                  href={href}
                  onClick={closeOnMobile}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Back to Store */}
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <Link href="/" onClick={closeOnMobile}>
            <Leaf className="mr-2 h-4 w-4 shrink-0" />
            Back to Store
          </Link>
        </Button>

        {/* Logout */}
        <Button
          type="button"
          variant="outline"
          className="mt-1 w-full justify-start rounded-xl border-border px-3 py-2.5 text-sm font-medium"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4 shrink-0" />
          Log out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logout } = useApp();
  const isAdmin = state.profile?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (state.loading) return;
    if (!state.isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) router.replace("/");
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
        <AdminSidebar
          pathname={pathname}
          profile={profile}
          roleLabel={roleLabel}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-w-0 overflow-x-hidden">
          {/* Top bar — hamburger only on mobile */}
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-sm">
            <SidebarTrigger aria-label="Toggle sidebar" className="md:hidden" />

            <Breadcrumb>
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
          </div>

          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
