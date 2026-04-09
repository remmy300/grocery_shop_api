import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrdersPage = () => {
  // Sample orders data
  const orders = [
    {
      id: "#ARC-8942",
      customer: "Evelyn Montgomery",
      avatar: "",
      initials: "EM",
      date: "Oct 24, 2024",
      total: "$142.50",
      status: "Pending",
      statusColor: "bg-secondary-fixed text-on-secondary-fixed-variant",
    },
    {
      id: "#ARC-8931",
      customer: "Julian Thorne",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBNxVnQ6xt0vb8DPGcDsB1Es1flEWOmUruXH8-GQESnkCbge1cN2z2k3cRdEA0Yow6bFwIuXr4mmnm799spGXP1F0sCw75xPZMYkF1mm7Nwy_pWbZeMechq8ho84iO1dzoThU_9wEJABY5mqyBuKqLaPV3shrZKah4TjMnyuSFvm-_HWNhqdcvQQqOEorfa4BqQPm7zzcSRzaGpsu0GqJr3U_tW4XmzYC64ytXf8Vvx302fOoNLH4gPq14svpX95F6amDS_zhcjSkY",
      date: "Oct 23, 2024",
      total: "$89.20",
      status: "Shipped",
      statusColor: "bg-primary-fixed text-on-primary-fixed-variant",
    },
    {
      id: "#ARC-8910",
      customer: "Clara Rivera",
      avatar: "",
      initials: "CR",
      date: "Oct 22, 2024",
      total: "$215.00",
      status: "Delivered",
      statusColor: "bg-surface-container-highest text-on-surface-variant",
    },
    {
      id: "#ARC-8905",
      customer: "Sarah Jenkins",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAbrYFCEwO7KxzzL858suhOiXwGXRfvZOkaceOSb_TPxsEQXohaNjLUjDX8sF8yWYaaFAFYFrZahPV5xbjLpafY48Wsr5brcVJFuXsXaE_5D9DLbJD--eGX6aLDQxaeMKRtFFwJi8Y3NOrew4clH6Y5xO1URtTGElVnpljoPDPquMc7-uyBzN1rJh-4P1yMcnJ5UnwqLXbEh7phJwR2WB5wia6T-I1sCSb7NfYFsQXdp9O8U94uHn1mpzJpOblSE9Esi_XwtiSmvhc",
      date: "Oct 22, 2024",
      total: "$54.10",
      status: "Pending",
      statusColor: "bg-secondary-fixed text-on-secondary-fixed-variant",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Order Archive
          </h1>
          <p className="text-secondary-foreground font-medium tracking-tight">
            Managing the seasonal harvest transitions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-surface-container-high text-primary px-6 py-2.5 rounded-full font-semibold text-sm hover:scale-95 transition-transform">
            Export CSV
          </Button>
          <Button className="bg-linear-to-br from-primary to-primary-container text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:scale-95 transition-transform">
            Create Manual Order
          </Button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-surface-container-lowest p-1 rounded-xl shadow-sm flex items-center">
          <span className="material-symbols-outlined text-outline ml-4">
            search
          </span>
          <Input
            className="bg-transparent border-none focus:ring-0 text-sm font-body py-3 px-4"
            placeholder="Search by ID or customer..."
          />
        </div>
        <Select>
          <SelectTrigger className="bg-surface-container-lowest p-1 rounded-xl shadow-sm h-auto border-none focus:ring-0">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-widest text-outline">
                Status
              </span>
              <SelectValue placeholder="All Orders" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="bg-surface-container-lowest p-1 rounded-xl shadow-sm h-auto border-none focus:ring-0">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-widest text-outline">
                Sort
              </span>
              <SelectValue placeholder="Newest First" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low border-none">
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Order ID
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Customer Name
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Date
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label text-right">
                Total Amount
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-surface-container-lowest transition-colors"
              >
                <TableCell className="px-6 py-5 font-heading font-bold text-sm">
                  {order.id}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed text-xs font-bold">
                      {order.avatar ? (
                        <img
                          src={order.avatar}
                          alt={order.customer}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        order.initials
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {order.customer}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-sm text-secondary-foreground">
                  {order.date}
                </TableCell>
                <TableCell className="px-6 py-5 text-sm font-bold text-foreground text-right">
                  {order.total}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <Badge
                    className={`${order.statusColor} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      more_horiz
                    </span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between bg-surface/50">
          <p className="text-xs text-secondary-foreground font-medium">
            Showing <span className="font-bold">1-10</span> of 124 archives
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </Button>
            <Button className="w-8 h-8 bg-primary text-primary-foreground text-xs font-bold">
              1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-xs font-medium"
            >
              2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-xs font-medium"
            >
              3
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </Button>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full py-12 mt-20 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto font-label text-xs uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
        <p className="text-secondary-foreground mb-6 md:mb-0">
          © {new Date().getFullYear()} Corner Store. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default OrdersPage;
