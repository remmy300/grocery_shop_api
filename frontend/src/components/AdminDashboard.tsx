import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminDashboard = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="bg-surface border-r border-surface-container">
          <SidebarHeader className="p-4">
            <h1 className="text-lg font-black text-primary uppercase tracking-widest">
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground">Market Manager</p>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-surface-container transition-transform hover:translate-x-1">
                  <span className="material-symbols-outlined">dashboard</span>
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 bg-secondary/10 text-secondary font-bold rounded-lg">
                  <span className="material-symbols-outlined">inventory_2</span>
                  <span>Inventory</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-surface-container transition-transform hover:translate-x-1">
                  <span className="material-symbols-outlined">
                    shopping_bag
                  </span>
                  <span>Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-surface-container transition-transform hover:translate-x-1">
                  <span className="material-symbols-outlined">group</span>
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-surface-container transition-transform hover:translate-x-1">
                  <span className="material-symbols-outlined">analytics</span>
                  <span>Analytics</span>
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
                <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-surface-container transition-transform hover:translate-x-1">
                  <span className="material-symbols-outlined">settings</span>
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-surface-container transition-transform hover:translate-x-1">
                  <span className="material-symbols-outlined">logout</span>
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-8">
          <header className="flex justify-between items-end mb-12">
            <div>
              <nav className="flex gap-2 text-xs font-label text-secondary mb-2 uppercase tracking-widest">
                <span>Admin</span>
                <span>/</span>
                <span className="text-foreground font-bold">
                  Inventory Management
                </span>
              </nav>
              <h2 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
                Archive Collection
              </h2>
            </div>
            <Button className="bg-gradient-to-br from-primary to-primary-container text-primary-foreground px-8 py-3 rounded-full flex items-center gap-2 font-semibold hover:scale-95 transition-transform">
              <span className="material-symbols-outlined text-xl">add</span>
              Add New Product
            </Button>
          </header>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card shadow-sm">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs font-label text-secondary uppercase tracking-widest mb-1">
                    Total Products
                  </p>
                  <h3 className="text-4xl font-heading font-bold text-foreground">
                    1,284
                  </h3>
                  <div className="mt-4 flex items-center gap-1 text-primary text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">
                      trending_up
                    </span>
                    <span>+12% this month</span>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-muted opacity-20">
                  inventory
                </span>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs font-label text-secondary uppercase tracking-widest mb-1">
                    Low Stock Items
                  </p>
                  <h3 className="text-4xl font-heading font-bold text-destructive">
                    42
                  </h3>
                  <div className="mt-4 flex items-center gap-1 text-destructive text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">
                      warning
                    </span>
                    <span>Requires attention</span>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-destructive/5">
                  notification_important
                </span>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-xs font-label text-secondary uppercase tracking-widest mb-1">
                    Inventory Value
                  </p>
                  <h3 className="text-4xl font-heading font-bold text-foreground">
                    $84,320
                  </h3>
                  <div className="mt-4 flex items-center gap-1 text-primary text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">
                      payments
                    </span>
                    <span>Asset valuation</span>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-muted opacity-20">
                  account_balance_wallet
                </span>
              </CardContent>
            </Card>
          </section>
          <section className="bg-surface-container-low p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px] relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <Input
                className="pl-12 bg-card border-none focus:ring-1 focus:ring-primary/20"
                placeholder="Search by botanical name or SKU..."
              />
            </div>
            <div className="flex gap-3">
              <Select>
                <SelectTrigger className="bg-card border-none focus:ring-1 focus:ring-primary/20">
                  <SelectValue placeholder="All Stock Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="bg-card border-none focus:ring-1 focus:ring-primary/20">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="herbs">Herbs</SelectItem>
                  <SelectItem value="fungi">Fungi</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <span className="material-symbols-outlined">filter_list</span>
              </Button>
            </div>
          </section>
          <div className="bg-card rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-container text-muted-foreground">
                  <TableHead className="px-6 py-4 text-xs font-label uppercase tracking-widest font-bold">
                    Visual
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-label uppercase tracking-widest font-bold">
                    Product ID
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-label uppercase tracking-widest font-bold">
                    Botanical Name
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-label uppercase tracking-widest font-bold">
                    Category
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-label uppercase tracking-widest font-bold">
                    Stock
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-label uppercase tracking-widest font-bold text-right">
                    Price
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-label uppercase tracking-widest font-bold text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-surface transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJWcY4bUSgvMfZHPjWu34rLuj8ZrsOi4CERsPDiIlg1qJxaXEBWc7ChHM0ky1riYORqtluY2_yF1BJJ-BEkuywbX13lsoZZmvC4-W8YntprPbvTFk8XvYsZ6OsBVjYMq2XBpB7iYgQTvVfreN1N8D56XDszit3CMP0MjCrBFvtp1RBvfHuLM9uo36H9e2oKrLM7G1SbeReXvVoS_A2nrJkGjyD6dO98ok8RyuKAlSjBnn25gJnjMQOvnKbEkhu3b-tUgUMzSYTXKY"
                        alt="Valencia Oranges"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-mono text-xs text-outline">
                    #ARC-7721
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="font-heading font-bold text-foreground">
                      Valencia Oranges
                    </p>
                    <p className="text-xs text-secondary italic">
                      Citrus sinensis
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className="bg-secondary-fixed text-on-secondary-fixed-variant">
                      Produce
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        142 Units
                      </span>
                      <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-primary"></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="font-heading font-bold text-foreground">
                      $4.50
                    </span>
                    <span className="text-[10px] text-outline block">/kg</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm">
                        <span className="material-symbols-outlined text-lg">
                          visibility
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {/* Add more rows as needed */}
              </TableBody>
            </Table>
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between">
              <p className="text-xs font-label text-outline uppercase tracking-widest">
                Showing 1 to 10 of 1,284 entries
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </Button>
                <Button className="px-3 py-1 bg-primary text-primary-foreground">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
