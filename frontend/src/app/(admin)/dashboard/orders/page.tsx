"use client";

import { useEffect, useMemo, useReducer } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
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
import { OrdersResponse } from "@/types";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/utils/formatters";
import { CsvExportButton } from "@/components/CsvExportButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type Order = {
  id: string;
  orderId: number;
  customer: string;
  date: string;
  total: number;
  orderStatus: string;
  itemCount: number;
  initials: string;
  statusColor: string;
};

type BackendProduct = {
  id: number;
  name: string;
  price: number | string;
  stock: number;
};

type ManualOrderItem = {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
};

type StatusFilter = "all" | "pending" | "out_for_delivery" | "delivered";
type SortFilter = "newest" | "oldest" | "highest";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

const INITIAL_FORM = { customer: "", phone: "", address: "" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNumber = (value: number | string) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (status: string) => status.trim().toLowerCase();

// ─── Data state (async fetch) ─────────────────────────────────────────────────

type DataState = {
  data: OrdersResponse | null;
  products: BackendProduct[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  productsError: string | null;
};

type DataAction =
  | { type: "fetchStart" }
  | { type: "refreshStart" }
  | { type: "fetchDone"; data: OrdersResponse; products: BackendProduct[] }
  | { type: "fetchError"; error: string }
  | { type: "updateOrder"; orderId: number; orderStatus: string }
  | { type: "deleteOrder"; orderId: number }
  | { type: "productsError"; error: string };

const initialDataState: DataState = {
  data: null,
  products: [],
  loading: true,
  refreshing: false,
  error: null,
  productsError: null,
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "fetchStart":
      return { ...state, loading: true, error: null };
    case "refreshStart":
      return { ...state, refreshing: true };
    case "fetchDone":
      return {
        ...state,
        data: action.data,
        products: action.products,
        loading: false,
        refreshing: false,
        error: null,
        productsError: null,
      };
    case "fetchError":
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: action.error,
      };
    case "productsError":
      return { ...state, products: [], productsError: action.error };
    case "updateOrder":
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          orders: state.data.orders.map((o) =>
            o.orderId === action.orderId
              ? { ...o, orderStatus: action.orderStatus }
              : o,
          ),
        },
      };
    case "deleteOrder":
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          orders: state.data.orders.filter((o) => o.orderId !== action.orderId),
          stats: {
            ...state.data.stats,
            totalOrders: state.data.stats.totalOrders - 1,
          },
        },
      };
    default:
      return state;
  }
}

// ─── Form / sheet state ───────────────────────────────────────────────────────

type SheetMode = "create" | "edit" | "none";

type FormState = {
  sheetMode: SheetMode;
  editTarget: Order | null;
  editStatus: string;
  manualForm: typeof INITIAL_FORM;
  selectedProductId: string;
  selectedQuantity: string;
  manualItems: ManualOrderItem[];
  formError: string | null;
  submitting: boolean;
  deleteTarget: Order | null;
};

type FormAction =
  | { type: "openCreate" }
  | { type: "openEdit"; order: Order }
  | { type: "closeSheet" }
  | { type: "setEditStatus"; value: string }
  | { type: "setManualField"; field: keyof typeof INITIAL_FORM; value: string }
  | { type: "setProductId"; value: string }
  | { type: "setQuantity"; value: string }
  | { type: "addItem"; item: ManualOrderItem }
  | { type: "removeItem"; productId: number }
  | { type: "setFormError"; error: string | null }
  | { type: "setSubmitting"; value: boolean }
  | { type: "openDelete"; order: Order }
  | { type: "closeDelete" };

const initialFormState: FormState = {
  sheetMode: "none",
  editTarget: null,
  editStatus: "",
  manualForm: INITIAL_FORM,
  selectedProductId: "",
  selectedQuantity: "1",
  manualItems: [],
  formError: null,
  submitting: false,
  deleteTarget: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "openCreate":
      return {
        ...initialFormState,
        sheetMode: "create",
        selectedProductId: state.selectedProductId,
      };
    case "openEdit":
      return {
        ...initialFormState,
        sheetMode: "edit",
        editTarget: action.order,
        editStatus: normalizeStatus(action.order.orderStatus),
        selectedProductId: state.selectedProductId,
      };
    case "closeSheet":
      return {
        ...initialFormState,
        selectedProductId: state.selectedProductId,
      };
    case "setEditStatus":
      return { ...state, editStatus: action.value };
    case "setManualField":
      return {
        ...state,
        manualForm: { ...state.manualForm, [action.field]: action.value },
      };
    case "setProductId":
      return { ...state, selectedProductId: action.value };
    case "setQuantity":
      return { ...state, selectedQuantity: action.value };
    case "addItem": {
      const existing = state.manualItems.findIndex(
        (i) => i.productId === action.item.productId,
      );
      if (existing >= 0) {
        return {
          ...state,
          manualItems: state.manualItems.map((i, idx) =>
            idx === existing
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
          formError: null,
        };
      }
      return {
        ...state,
        manualItems: [...state.manualItems, action.item],
        formError: null,
      };
    }
    case "removeItem":
      return {
        ...state,
        manualItems: state.manualItems.filter(
          (i) => i.productId !== action.productId,
        ),
      };
    case "setFormError":
      return { ...state, formError: action.error };
    case "setSubmitting":
      return { ...state, submitting: action.value };
    case "openDelete":
      return { ...state, deleteTarget: action.order };
    case "closeDelete":
      return { ...state, deleteTarget: null };
    default:
      return state;
  }
}

// ─── Filter state ─────────────────────────────────────────────────────────────

type FilterState = {
  search: string;
  status: StatusFilter;
  sort: SortFilter;
  page: number;
};

function useFilterState() {
  return useReducer(
    (
      prev: FilterState,
      next: FilterState | ((prev: FilterState) => FilterState),
    ): FilterState => (typeof next === "function" ? next(prev) : next),
    { search: "", status: "all", sort: "newest", page: 1 },
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const OrdersPage = () => {
  const [ds, dispatchData] = useReducer(dataReducer, initialDataState);
  const [fs, dispatchForm] = useReducer(formReducer, initialFormState);
  const [filters, setFilters] = useFilterState();

  const productLookup = useMemo(
    () => new Map(ds.products.map((p) => [p.id, p])),
    [ds.products],
  );

  // ── data loading ──────────────────────────────────────────────────

  const loadOrders = async (silent = false) => {
    silent
      ? dispatchData({ type: "refreshStart" })
      : dispatchData({ type: "fetchStart" });

    const [ordersResult, productsResult] = await Promise.allSettled([
      apiRequest<OrdersResponse>("/api/admin/orders"),
      apiRequest<BackendProduct[]>("/api/products"),
    ]);

    if (
      ordersResult.status === "fulfilled" &&
      productsResult.status === "fulfilled"
    ) {
      dispatchData({
        type: "fetchDone",
        data: ordersResult.value,
        products: productsResult.value,
      });
    } else {
      if (ordersResult.status === "rejected") {
        dispatchData({
          type: "fetchError",
          error:
            ordersResult.reason instanceof Error
              ? ordersResult.reason.message
              : "Failed to load orders",
        });
      }
      if (productsResult.status === "rejected") {
        dispatchData({
          type: "productsError",
          error:
            productsResult.reason instanceof Error
              ? productsResult.reason.message
              : "Failed to load products",
        });
      }
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      ds.products.length &&
      !productLookup.has(Number(fs.selectedProductId))
    ) {
      dispatchForm({ type: "setProductId", value: String(ds.products[0].id) });
    }
  }, [ds.products, fs.selectedProductId, productLookup]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.sort]);

  // ── derived data ──────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    if (!ds.data) return [];
    const search = filters.search.trim().toLowerCase();
    return ds.data.orders
      .filter((order) => {
        const matchesSearch =
          !search ||
          order.id.toLowerCase().includes(search) ||
          order.customer.toLowerCase().includes(search);
        const matchesStatus =
          filters.status === "all" ||
          normalizeStatus(order.orderStatus) === filters.status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (filters.sort === "highest") return b.total - a.total;
        if (filters.sort === "oldest") return a.orderId - b.orderId;
        return b.orderId - a.orderId;
      });
  }, [ds.data, filters.search, filters.status, filters.sort]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(filters.page, totalPages);

  const pagedOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [safePage, filteredOrders]);

  const manualOrderTotal = fs.manualItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const statusCounts = [
    {
      label: "Total",
      value: ds.data?.stats.totalOrders ?? 0,
      tone: "text-primary",
    },
    {
      label: "Pending",
      value: ds.data?.stats.pendingOrders ?? 0,
      tone: "text-amber-600",
    },
    {
      label: "Out for Delivery",
      value: ds.data?.stats.shippedOrders ?? 0,
      tone: "text-blue-600",
    },
    {
      label: "Delivered",
      value: ds.data?.stats.deliveredOrders ?? 0,
      tone: "text-green-600",
    },
  ];

  // ── action handlers ───────────────────────────────────────────────

  const addManualItem = () => {
    const productId = Number(fs.selectedProductId);
    const quantity = Number(fs.selectedQuantity);
    const product = productLookup.get(productId);

    if (!product) {
      dispatchForm({
        type: "setFormError",
        error: "Please select a product first.",
      });
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      dispatchForm({
        type: "setFormError",
        error: "Quantity must be a whole number greater than zero.",
      });
      return;
    }
    dispatchForm({
      type: "addItem",
      item: {
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: toNumber(product.price),
      },
    });
  };

  const handleSubmitManualOrder = async () => {
    if (
      !fs.manualForm.customer.trim() ||
      !fs.manualForm.phone.trim() ||
      !fs.manualForm.address.trim()
    ) {
      dispatchForm({
        type: "setFormError",
        error: "Customer, phone, and address are required.",
      });
      return;
    }
    if (fs.manualItems.length === 0) {
      dispatchForm({
        type: "setFormError",
        error: "Add at least one product to the order.",
      });
      return;
    }

    dispatchForm({ type: "setSubmitting", value: true });
    try {
      await apiRequest("/api/orders", {
        method: "POST",
        json: {
          customer: fs.manualForm.customer.trim(),
          phone: fs.manualForm.phone.trim(),
          address: fs.manualForm.address.trim(),
          items: fs.manualItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      });
      dispatchForm({ type: "closeSheet" });
      setFilters((prev) => ({ ...prev, page: 1 }));
      await loadOrders(true);
    } catch (err) {
      dispatchForm({
        type: "setFormError",
        error: err instanceof Error ? err.message : "Failed to create order",
      });
    } finally {
      dispatchForm({ type: "setSubmitting", value: false });
    }
  };

  const handleEditStatus = async () => {
    if (!fs.editTarget) return;
    dispatchForm({ type: "setSubmitting", value: true });
    try {
      await apiRequest(`/api/orders/${fs.editTarget.orderId}/orderStatus`, {
        method: "PATCH",
        json: { orderStatus: fs.editStatus },
      });
      dispatchData({
        type: "updateOrder",
        orderId: fs.editTarget.orderId,
        orderStatus: fs.editStatus,
      });
      dispatchForm({ type: "closeSheet" });
    } catch (err) {
      dispatchForm({
        type: "setFormError",
        error: err instanceof Error ? err.message : "Failed to update order",
      });
    } finally {
      dispatchForm({ type: "setSubmitting", value: false });
    }
  };

  const handleDeleteOrder = async () => {
    if (!fs.deleteTarget) return;
    try {
      await apiRequest(`/api/orders/${fs.deleteTarget.orderId}`, {
        method: "DELETE",
      });
      dispatchData({ type: "deleteOrder", orderId: fs.deleteTarget.orderId });
      dispatchForm({ type: "closeDelete" });
    } catch (err) {
      dispatchForm({ type: "closeDelete" });
      dispatchData({
        type: "fetchError",
        error: err instanceof Error ? err.message : "Failed to delete order",
      });
    }
  };

  // ── render guards ─────────────────────────────────────────────────

  if (ds.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (ds.error || !ds.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{ds.error || "Unable to load orders"}</p>
          <Button onClick={() => loadOrders()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ── page ──────────────────────────────────────────────────────────

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
          {ds.productsError ? (
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
              { header: "Order ID", value: (o) => o.id },
              { header: "Customer", value: (o) => o.customer },
              { header: "Date", value: (o) => o.date },
              { header: "Total", value: (o) => o.total },
              { header: "Status", value: (o) => o.orderStatus },
              { header: "Item Count", value: (o) => o.itemCount },
            ]}
            filename={`orders-${new Date().toISOString().slice(0, 10)}`}
            className="rounded-full bg-surface-container-high px-6 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-95"
            disabled={ds.refreshing}
          >
            Export CSV
          </CsvExportButton>
          <Button
            onClick={() => dispatchForm({ type: "openCreate" })}
            className="rounded-full bg-linear-to-br from-primary to-primary-container px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-95"
            disabled={ds.refreshing}
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
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value as StatusFilter }))
          }
        >
          <SelectTrigger className="h-auto rounded-xl border-none bg-surface-container-lowest p-1 shadow-sm focus:ring-0">
            <div className="flex items-center justify-between px-4 py-3">
              <SelectValue placeholder="All Orders" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sort}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, sort: value as SortFilter }))
          }
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

      {/* ── Mobile cards ────────────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {pagedOrders.length ? (
          pagedOrders.map((order) => (
            <Card
              key={order.orderId}
              className="rounded-2xl bg-surface-container-lowest shadow-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-xs font-bold text-on-secondary-fixed">
                      {order.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {order.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.id}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${order.statusColor} shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide`}
                  >
                    {order.orderStatus}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {order.date}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      KES {formatCurrency(order.total)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-outline hover:text-primary"
                      onClick={() => dispatchForm({ type: "openEdit", order })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-outline hover:text-destructive"
                      onClick={() =>
                        dispatchForm({ type: "openDelete", order })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-medium text-foreground">
              No orders match the current filters.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another search or change the filter selections.
            </p>
          </div>
        )}
      </div>

      {/* ── Desktop table ────────────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm md:block">
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
                  className="transition-colors hover:bg-surface-container-lowest"
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
                    KES {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge
                      className={`${order.statusColor} rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide`}
                    >
                      {order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-outline transition-colors hover:text-primary"
                        onClick={() =>
                          dispatchForm({ type: "openEdit", order })
                        }
                        title="Edit status"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-outline transition-colors hover:text-destructive"
                        onClick={() =>
                          dispatchForm({ type: "openDelete", order })
                        }
                        title="Delete order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
      </div>

      {/* ── Pagination (shared) ──────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-3 shadow-sm md:px-6 md:py-4">
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
              setFilters((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={safePage <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button className="h-8 w-8 bg-primary text-xs font-bold text-primary-foreground">
            {safePage}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: Math.min(totalPages, prev.page + 1),
              }))
            }
            disabled={safePage >= totalPages}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ── Create / Edit Sheet ─────────────────────────────────────── */}
      <Sheet
        open={fs.sheetMode !== "none"}
        onOpenChange={(open) => {
          if (!open) dispatchForm({ type: "closeSheet" });
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          {fs.sheetMode === "edit" ? (
            <>
              <SheetHeader>
                <SheetTitle>Edit Order Status</SheetTitle>
                <SheetDescription>
                  Update the fulfilment status for {fs.editTarget?.id}.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4 pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Order Status
                  </p>
                  <Select
                    value={fs.editStatus}
                    onValueChange={(value) =>
                      dispatchForm({ type: "setEditStatus", value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s === "out_for_delivery"
                            ? "Out for Delivery"
                            : s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {fs.formError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {fs.formError}
                  </div>
                ) : null}
              </div>
              <SheetFooter className="border-t border-border">
                <div className="flex gap-3">
                  <SheetClose asChild>
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button
                    className="flex-1"
                    onClick={handleEditStatus}
                    disabled={fs.submitting}
                  >
                    {fs.submitting ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </SheetFooter>
            </>
          ) : (
            <>
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
                      value={fs.manualForm.customer}
                      onChange={(e) =>
                        dispatchForm({
                          type: "setManualField",
                          field: "customer",
                          value: e.target.value,
                        })
                      }
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Phone</p>
                    <Input
                      value={fs.manualForm.phone}
                      onChange={(e) =>
                        dispatchForm({
                          type: "setManualField",
                          field: "phone",
                          value: e.target.value,
                        })
                      }
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Address</p>
                  <Input
                    value={fs.manualForm.address}
                    onChange={(e) =>
                      dispatchForm({
                        type: "setManualField",
                        field: "address",
                        value: e.target.value,
                      })
                    }
                    placeholder="Delivery address"
                  />
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
                    <Select
                      value={fs.selectedProductId}
                      onValueChange={(value) =>
                        dispatchForm({ type: "setProductId", value })
                      }
                      disabled={!ds.products.length}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            ds.products.length
                              ? "Choose a product"
                              : "No products loaded"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {ds.products.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={String(product.id)}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={fs.selectedQuantity}
                      onChange={(e) =>
                        dispatchForm({
                          type: "setQuantity",
                          value: e.target.value,
                        })
                      }
                      placeholder="Qty"
                    />
                    <Button
                      onClick={addManualItem}
                      disabled={!ds.products.length}
                    >
                      Add item
                    </Button>
                  </div>
                  {ds.productsError ? (
                    <p className="mt-3 text-sm text-amber-600">
                      {ds.productsError}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-secondary-foreground">
                      Order Items
                    </h4>
                    <span className="text-sm font-semibold text-foreground">
                      KES {formatCurrency(manualOrderTotal)}
                    </span>
                  </div>
                  {fs.manualItems.length ? (
                    <div className="space-y-3">
                      {fs.manualItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {item.name}
                            </p>
                            <p className="text-xs text-secondary-foreground">
                              {item.quantity} x KES{" "}
                              {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() =>
                              dispatchForm({
                                type: "removeItem",
                                productId: item.productId,
                              })
                            }
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
                {fs.formError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {fs.formError}
                  </div>
                ) : null}
              </div>
              <SheetFooter className="border-t border-border">
                <div className="flex gap-3">
                  <SheetClose asChild>
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button
                    className="flex-1"
                    onClick={handleSubmitManualOrder}
                    disabled={fs.submitting}
                  >
                    {fs.submitting ? "Creating..." : "Create order"}
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirmation ─────────────────────────────────────── */}
      <AlertDialog
        open={!!fs.deleteTarget}
        onOpenChange={(open) => {
          if (!open) dispatchForm({ type: "closeDelete" });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">{fs.deleteTarget?.id}</span> for{" "}
              <span className="font-semibold">{fs.deleteTarget?.customer}</span>
              . Paid orders cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteOrder}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPage;
