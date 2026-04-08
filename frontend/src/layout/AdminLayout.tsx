import { NavLink, Outlet, useLocation } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminLayout = () => {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === `/${path}`;

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
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUGtdq4yd70eA3Cu5s0XxyEWWSdkqxT190MUuX98wku5HaJBuB5ZOJTCX9SMq1j2zd9kqd1UuR6q1vT5eWnAZPFLNTWizE9irpxQtoK9569dv3Qv9gjgT3Sh85y0N2YP33Ph_z6mY8o2aN38TF1whFG-TxL16D5c0g2MEQ1lmpdZW5MFRNkeEO1GQf5mIYduX7sOowAqdAgich9c1s8hJ-cW7-ySbL5ESw3ZSo-eV0ERAE6XkLxjNlYZ0ZgQ4S2gd_AWP2p_OcmLk" />
                <AvatarFallback>AA</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-bold">Alex Mercer</p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  Head Archivist
                </p>
              </div>
            </div>
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
