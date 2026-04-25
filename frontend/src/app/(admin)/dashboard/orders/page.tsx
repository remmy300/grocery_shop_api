"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiRequest, formatCurrency } from "@/lib/api";
import { CsvExportButton } from "@/components/CsvExportButton";

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

type BackendProduct = {
  id: number;
  name: string;
  price: number | string;
  stock: number;
  imageUrl?: string | null;
};

type ManualOrderItem = {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
};

type ManualOrderForm = {
  customer: string;
  phone: string;
  address: string;
};

type StatusFilter = "all" | "pending" | "shipped" | "delivered";
type SortFilter = "newest" | "oldest" | "highest";

const PAGE_SIZE = 8;

const INITIAL_FORM: ManualOrderForm = {
  customer: "",
  phone: "",
  address: "",
};

const toNumber = (value: number | string) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (status: string) => status.trim().toLowerCase();

const OrdersPage = () => {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortFilter, setSortFilter] = useState<SortFilter>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [manualForm, setManualForm] = useState<ManualOrderForm>(INITIAL_FORM);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [manualItems, setManualItems] = useState<ManualOrderItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const productLookup = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const loadOrders = async (options: { silent?: boolean } = {}) => {
    try {
      if (options.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [ordersResult, productsResult] = await Promise.allSettled([
        apiRequest<OrdersResponse>("/api/admin/orders"),
        apiRequest<BackendProduct[]>("/api/products"),
      ]);

      if (ordersResult.status === "fulfilled") {
        setData(ordersResult.value);
        setError(null);
      } else {
        setError(
          ordersResult.reason instanceof Error
            ? ordersResult.reason.message
            : "Failed to load orders",
        );
      }

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value);
        setProductsError(null);
      } else {
        setProducts([]);
        setProductsError(
          productsResult.reason instanceof Error
            ? productsResult.reason.message
            : "Failed to load products",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortFilter]);

  useEffect(() => {
    if (!products.length) {
      setSelectedProductId("");
      return;
    }

    if (!selectedProductId || !productLookup.has(Number(selectedProductId))) {
      setSelectedProductId(String(products[0].id));
    }
  }, [productLookup, products, selectedProductId]);

  const filteredOrders = useMemo(() => {
    if (!data) {
      return [];
    }

    const search = searchTerm.trim().toLowerCase();
    const filtered = data.orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.id.toLowerCase().includes(search) ||
        order.customer.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        normalizeStatus(order.orderStatus) === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((left, right) => {
      if (sortFilter === "highest") {
        return right.total - left.total;
      }

      if (sortFilter === "oldest") {
        return left.orderId - right.orderId;
      }

      return right.orderId - left.orderId;
    });
  }, [data, searchTerm, sortFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredOrders]);

  const statusCounts = [
    {
      label: "Total",
      value: data?.stats.totalOrders ?? 0,
      tone: "text-primary",
    },
    {
      label: "Pending",
      value: data?.stats.pendingOrders ?? 0,
      tone: "text-amber-600",
    },
    {
      label: "Shipped",
      value: data?.stats.shippedOrders ?? 0,
      tone: "text-blue-600",
    },
    {
      label: "Delivered",
      value: data?.stats.deliveredOrders ?? 0,
      tone: "text-green-600",
    },
  ];

  const openManualOrderSheet = () => {
    setManualForm(INITIAL_FORM);
    setSelectedQuantity("1");
    setManualItems([]);
    setFormError(null);
    setSheetOpen(true);
  };

  const addManualItem = () => {
    const productId = Number(selectedProductId);
    const quantity = Number(selectedQuantity);
    const product = productLookup.get(productId);

    if (!product) {
      setFormError("Please select a product first.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFormError("Quantity must be a whole number greater than zero.");
      return;
    }

    const unitPrice = toNumber(product.price);
    setManualItems((current) => {
      const existingIndex = current.findIndex(
        (item) => item.productId === product.id,
      );

      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice,
        },
      ];
    });

    setFormError(null);
  };

  const removeManualItem = (productId: number) => {
    setManualItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const manualOrderTotal = manualItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const handleSubmitManualOrder = async () => {
    if (
      !manualForm.customer.trim() ||
      !manualForm.phone.trim() ||
      !manualForm.address.trim()
    ) {
      setFormError("Customer, phone, and address are required.");
      return;
    }

    if (manualItems.length === 0) {
      setFormError("Add at least one product to the order.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      await apiRequest("/api/orders", {
        method: "POST",
        json: {
          customer: manualForm.customer.trim(),
          phone: manualForm.phone.trim(),
          address: manualForm.address.trim(),
          items: manualItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      });

      setSheetOpen(false);
      setCurrentPage(1);
      await loadOrders({ silent: true });
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to create order",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          <Button onClick={() => loadOrders()} className="mt-4">
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
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Order Archive
          </h1>
          <p className="font-medium tracking-tight text-secondary-foreground">
            Managing the seasonal harvest transitions.
          </p>
          {productsError ? (
            <p className="mt-2 text-sm text-amber-600">
              Product lookup is unavailable, so manual order creation is
              limited.
            </p>
          ) : null}
        </div>
        <div className="flex gap-3">
          <CsvExportButton
            rows={filteredOrders}
            columns={[
              { header: "Order ID", value: (order) => order.id },
              { header: "Customer", value: (order) => order.customer },
              { header: "Date", value: (order) => order.date },
              { header: "Total", value: (order) => order.total },
              { header: "Status", value: (order) => order.orderStatus },
              { header: "Item Count", value: (order) => order.itemCount },
            ]}
            filename={`orders-${new Date().toISOString().slice(0, 10)}`}
            className="rounded-full bg-surface-container-high px-6 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-95"
            disabled={refreshing}
          >
            Export CSV
          </CsvExportButton>
          <Button
            onClick={openManualOrderSheet}
            className="rounded-full bg-linear-to-br from-primary to-primary-container px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-95"
            disabled={refreshing}
          >
            Create Manual Order
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {statusCounts.map((stat) => (
          <Card
            key={stat.label}
            className="bg-surface-container-lowest shadow-sm"
          >
            <CardContent className="flex flex-col items-center p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-secondary-foreground">
                {stat.label}
              </p>
              <p
                className={`mt-2 text-3xl font-heading font-black ${stat.tone}`}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="flex items-center rounded-xl bg-surface-container-lowest p-1 shadow-sm md:col-span-2">
          <Input
            className="border-none bg-transparent px-4 py-3 text-sm font-body focus:ring-0 focus:border-none"
            placeholder="Search by ID or customer..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="h-auto rounded-xl border-none bg-surface-container-lowest p-1 shadow-sm focus:ring-0">
            <div className="flex items-center justify-between px-4 py-3">
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
        <Select
          value={sortFilter}
          onValueChange={(value) => setSortFilter(value as SortFilter)}
        >
          <SelectTrigger className="h-auto rounded-xl border-none bg-surface-container-lowest p-1 shadow-sm focus:ring-0">
            <div className="flex items-center justify-between px-4 py-3">
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

      <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-surface-container-low">
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Order ID
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Customer Name
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Date
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
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
            {pagedOrders.length ? (
              pagedOrders.map((order) => (
                <TableRow
                  key={order.orderId}
                  className="cursor-pointer transition-colors hover:bg-surface-container-lowest"
                >
                  <TableCell className="px-6 py-5 font-heading text-sm font-bold">
                    {order.id}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-fixed text-xs font-bold text-on-secondary-fixed">
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
                  <TableCell className="px-6 py-5 text-right text-sm font-bold text-foreground">
                    ${formatCurrency(order.total)}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge
                      className={`${order.statusColor} rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide`}
                    >
                      {order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-outline transition-colors hover:text-primary"
                    >
                      <MoreHorizontal className="h-5 w-5 " />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-12 text-center">
                  <p className="font-medium text-foreground">
                    No orders match the current filters.
                  </p>
                  <p className="mt-2 text-sm text-secondary-foreground">
                    Try another search or change the filter selections.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between bg-surface/50 px-6 py-4">
          <p className="text-xs font-medium text-secondary-foreground">
            Showing <span className="font-bold">{pagedOrders.length}</span> of{" "}
            <span className="font-bold">{filteredOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={() =>
                setCurrentPage((current) => Math.max(1, current - 1))
              }
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button className="h-8 w-8 bg-primary text-xs font-bold text-primary-foreground">
              {currentPage}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={() =>
                setCurrentPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setFormError(null);
            setManualItems([]);
            setManualForm(INITIAL_FORM);
            setSelectedQuantity("1");
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Create Manual Order</SheetTitle>
            <SheetDescription>
              Enter the customer details and add one or more products before
              creating the order.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Customer Name
                </p>
                <Input
                  value={manualForm.customer}
                  onChange={(event) =>
                    setManualForm((current) => ({
                      ...current,
                      customer: event.target.value,
                    }))
                  }
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Phone</p>
                <Input
                  value={manualForm.phone}
                  onChange={(event) =>
                    setManualForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Address</p>
              <Input
                value={manualForm.address}
                onChange={(event) =>
                  setManualForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="Delivery address"
              />
            </div>

            <div className="rounded-xl bg-surface-container-low p-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={!products.length}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        products.length
                          ? "Choose a product"
                          : "No products loaded"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(event) => setSelectedQuantity(event.target.value)}
                  placeholder="Qty"
                />

                <Button onClick={addManualItem} disabled={!products.length}>
                  Add item
                </Button>
              </div>

              {productsError ? (
                <p className="mt-3 text-sm text-amber-600">{productsError}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-widest text-secondary-foreground">
                  Order Items
                </h4>
                <span className="text-sm font-semibold text-foreground">
                  ${formatCurrency(manualOrderTotal)}
                </span>
              </div>

              {manualItems.length ? (
                <div className="space-y-3">
                  {manualItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-secondary-foreground">
                          {item.quantity} x ${formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeManualItem(item.productId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Add products to build the order.
                </div>
              )}
            </div>

            {formError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}
          </div>

          <SheetFooter className="border-t border-border">
            <div className="flex gap-3">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setFormError(null);
                    setManualItems([]);
                    setManualForm(INITIAL_FORM);
                  }}
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button
                className="flex-1"
                onClick={handleSubmitManualOrder}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create order"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OrdersPage;
