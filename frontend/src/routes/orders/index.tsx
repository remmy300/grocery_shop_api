import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { apiRequest, formatCurrency } from "@/lib/api";

type OrdersResponse = {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
  };
  orders: Array<{
    id: string;
    orderId: number;
    customer: string;
    date: string;
    total: number;
    orderStatus: string;
    itemCount: number;
    initials: string;
    statusColor: string;
  }>;
};

const OrdersPage = () => {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<OrdersResponse>("/api/admin/orders");
        if (!active) return;
        setData(response);
        setError(null);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load orders",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || "Unable to load orders"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const statusCounts = [
    { label: "Total", value: data.stats.totalOrders, tone: "text-primary" },
    { label: "Pending", value: data.stats.pendingOrders, tone: "text-amber-600" },
    { label: "Shipped", value: data.stats.shippedOrders, tone: "text-blue-600" },
    { label: "Delivered", value: data.stats.deliveredOrders, tone: "text-green-600" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
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

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {statusCounts.map((stat) => (
          <Card key={stat.label} className="bg-surface-container-lowest shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-widest text-secondary-foreground">
                {stat.label}
              </p>
              <p className={`mt-2 text-3xl font-heading font-black ${stat.tone}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="md:col-span-2 bg-surface-container-lowest p-1 rounded-xl shadow-sm flex items-center">
          <span className="material-symbols-outlined text-outline ml-4">search</span>
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
            {data.orders.map((order) => (
              <TableRow
                key={order.orderId}
                className="hover:bg-surface-container-lowest transition-colors"
              >
                <TableCell className="px-6 py-5 font-heading font-bold text-sm">
                  {order.id}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed text-xs font-bold">
                      {order.initials}
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
                  ${formatCurrency(order.total)}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <Badge
                    className={`${order.statusColor} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}
                  >
                    {order.orderStatus}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">more_horiz</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="bg-surface/50 px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-secondary-foreground font-medium">
            Showing <span className="font-bold">{data.orders.length}</span> orders
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
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
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

export default OrdersPage;
