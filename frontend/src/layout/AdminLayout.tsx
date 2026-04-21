import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { apiRequest, clearStoredSession } from "@/lib/api";

type ProfileResponse = {
  id: number;
  email: string;
  displayName: string;
  initials: string;
  role: string;
  joinedOn: string;
};

const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => pathname === `/${path}`;
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await apiRequest<ProfileResponse>("/api/admin/profile");
        if (active) {
          setProfile(response);
        }
      } catch {
        if (active) {
          setProfile(null);
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const roleLabel = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "";

  const handleLogout = () => {
    setLoggingOut(true);
    clearStoredSession();
    setProfile(null);
    setProfileLoading(false);
    navigate("/login", { replace: true });
    setLoggingOut(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar className="bg-surface-container-low border-r border-border">
          <SidebarHeader className="p-4">
            <h1 className="text-lg font-black text-primary uppercase tracking-widest">
              Admin Panel
            </h1>
            <p className="text-sm text-foreground/70">Market Manager</p>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("dashboard")}>
                  <NavLink
                    to="/dashboard"
                    end
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("inventory")}>
                  <NavLink
                    to="/inventory"
                    end
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <span className="material-symbols-outlined">
                      inventory_2
                    </span>
                    <span>Inventory</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("orders")}>
                  <NavLink
                    to="/orders"
                    end
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <span className="material-symbols-outlined">
                      shopping_bag
                    </span>
                    <span>Orders</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("users")}>
                  <NavLink
                    to="/users"
                    end
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <span className="material-symbols-outlined">group</span>
                    <span>Users</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("analytics")}>
                  <NavLink
                    to="/analytics"
                    end
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <span className="material-symbols-outlined">analytics</span>
                    <span>Analytics</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <NavLink
              to="/profile"
              end
              className="mb-4 block rounded-xl bg-surface-container-low px-3 py-3 transition-transform hover:-translate-y-0.5 hover:bg-surface-container"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{profile?.initials || "SO"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">
                    {profileLoading
                      ? "Loading profile..."
                      : profile?.displayName || "Signed out"}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {profileLoading
                      ? "Fetching account details..."
                      : profile?.email || "Not signed in"}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80">
                    {profileLoading ? "Loading..." : roleLabel || "Guest"}
                  </p>
                </div>
                <span className="material-symbols-outlined text-sm text-muted-foreground">
                  chevron_right
                </span>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-primary/80">
                View profile
              </p>
            </NavLink>
            <Button
              type="button"
              variant="outline"
              className="mb-4 w-full justify-start rounded-xl border-border px-3 py-3 text-sm font-medium"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <span className="material-symbols-outlined mr-2 text-sm">
                logout
              </span>
              {loggingOut ? "Signing out..." : "Log out"}
            </Button>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("settings")}>
                  <NavLink
                    to="/settings"
                    end
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <span className="material-symbols-outlined">settings</span>
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("profile")}
                  variant="outline"
                >
                  <NavLink
                    to="/profile"
                    end
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <span className="material-symbols-outlined">person</span>
                    <span>Profile</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
