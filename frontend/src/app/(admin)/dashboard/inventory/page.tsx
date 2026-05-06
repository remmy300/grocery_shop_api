"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import {
  AlertTriangle,
  DollarSign,
  ImageIcon,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import { apiRequest, formatCurrency } from "@/lib/api";
import { InventoryResponse } from "@/types";

type ProductFormState = {
  name: string;
  stock: string;
  price: string;
  imageUrl: string;
};

type UploadResult =
  | {
      event: "success";
      info?: {
        secure_url: string;
        public_id: string;
      };
    }
  | {
      event: string;
      info?: unknown;
    };

const EMPTY_FORM: ProductFormState = {
  name: "",
  stock: "",
  price: "",
  imageUrl: "",
};

const toFormState = (
  product: InventoryResponse["products"][number],
): ProductFormState => ({
  name: product.name,
  stock: String(product.stock),
  price: String(product.price),
  imageUrl: product.imageUrl || "",
});

const inferStockTone = (status: string) => {
  if (status === "In Stock") return "default";
  if (status === "Low Stock") return "secondary";
  return "destructive";
};

const InventoryPage = () => {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { openUpload, uploading, ready } = useCloudinaryUpload();

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<InventoryResponse>(
        "/api/admin/inventory",
      );
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredProducts = useMemo(
    () =>
      data?.products.filter((product) => {
        const query = search.toLowerCase();

        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }) || [],
    [data, search],
  );

  const selectedProduct = useMemo(
    () =>
      data?.products.find((product) => product.id === activeProductId) || null,
    [activeProductId, data],
  );

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    if (!isCreating) {
      setForm(toFormState(selectedProduct));
    }
  }, [isCreating, selectedProduct]);

  useEffect(() => {
    if (activeProductId !== null && data) {
      const stillExists = data.products.some(
        (product) => product.id === activeProductId,
      );
      if (!stillExists) {
        setActiveProductId(null);
        setIsCreating(false);
        setForm(EMPTY_FORM);
      }
    }
  }, [activeProductId, data]);

  const openCreatePanel = () => {
    setActiveProductId(null);
    setIsCreating(true);
    setForm(EMPTY_FORM);
  };

  const openEditPanel = (product: InventoryResponse["products"][number]) => {
    setActiveProductId(product.id);
    setIsCreating(false);
    setForm(toFormState(product));
  };

  const validateForm = () => {
    const trimmedName = form.name.trim();
    const trimmedImageUrl = form.imageUrl.trim();
    const stock = Number(form.stock);
    const price = Number(form.price);

    if (!trimmedName) {
      return { success: false, error: "Product name is required." };
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return { success: false, error: "Stock must be a whole number zero or greater." };
    }

    if (!Number.isInteger(price) || price < 0) {
      return { success: false, error: "Price must be a whole number zero or greater." };
    }

    return {
      success: true,
      payload: {
        name: trimmedName,
        stock,
        price,
        imageUrl: trimmedImageUrl,
      },
    };
  };




  
const handleSaveProduct = async () => {
  const validated = validateForm();

  if (!validated.success) {
    toast.error(validated.error);
    return;
  }

  try {
    setSaving(true);

    const endpoint = isCreating
      ? "/api/products"
      : `/api/products/${activeProductId}`;

    const method = isCreating ? "POST" : "PUT";

    const savedProduct = await apiRequest<
      InventoryResponse["products"][number]
    >(endpoint, {
      method,
      json: validated.payload,
    });

    toast.success(isCreating ? "Product created." : "Product updated.");

    setIsCreating(false);
    setActiveProductId(savedProduct.id);
    setForm(toFormState(savedProduct));

    await loadInventory();
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : "Failed to save product",
    );
  } finally {
    setSaving(false);
  }
};
  const handleDeleteProduct = async (
    productToDelete?: InventoryResponse["products"][number] | null,
  ) => {
    const target = productToDelete ?? selectedProduct;

    if (!target) {
      toast.error("Select a product before archiving.");
      return;
    }

    const confirmed = window.confirm(
      `Archive ${target.name}? It will be hidden from inventory but kept in order history.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      await apiRequest(`/api/products/${target.id}`, { method: "DELETE" });
      toast.success("Product archived.");
      if (target.id === activeProductId) {
        setActiveProductId(null);
        setIsCreating(false);
        setForm(EMPTY_FORM);
      }
      await loadInventory();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to archive product",
      );
    } finally {
      setSaving(false);
    }
  };


const handleUploadImage = () => {
  openUpload((result: unknown) => {
    const res = result as UploadResult;

    if (res.event === "success" && res.info) {
      const info = res.info as { secure_url: string; public_id: string };
      setForm((current) => ({
        ...current,
        imageUrl: info.secure_url,
      }));
    }
  });
};

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-secondary-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || "Unable to load inventory"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { stats } = data;
  const hasActiveProduct = Boolean(selectedProduct) || isCreating;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Inventory Management
          </h1>
          <p className="text-secondary-foreground font-medium tracking-tight">
            Track and manage your product stock levels.
          </p>
        </div>
        <Button
          onClick={openCreatePanel}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Product
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="flex flex-col items-center p-5 text-center">
            <div className="mb-4 flex items-center justify-center rounded-lg bg-blue-500/10 p-2 text-blue-600">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Total Products
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {stats.totalProducts}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="flex flex-col items-center p-5 text-center">
            <div className="mb-4 flex items-center justify-center rounded-lg bg-orange-500/10 p-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Low Stock Items
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              {stats.lowStockItems}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="flex flex-col items-center p-5 text-center">
            <div className="mb-4 flex items-center justify-center rounded-lg bg-green-500/10 p-2 text-green-600">
              <DollarSign className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-xs uppercase tracking-widest text-secondary-foreground">
              Inventory Value
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              ${formatCurrency(stats.inventoryValue)}
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground">
                  Product Inventory
                </h3>
                <p className="text-secondary-foreground text-sm">
                  Manage your product stock and pricing
                </p>
              </div>
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-72 !focus-visible:border-transparent !focus-visible:ring-0 !focus-visible:ring-offset-0"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pr-10">Product</TableHead>
                  <TableHead className="pl-10">Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length ? (
                  filteredProducts.map((product) => {
                    const isActive = product.id === activeProductId;

                    return (
                      <TableRow
                        key={product.id}
                        className={`cursor-pointer transition-colors hover:bg-surface-container-low ${
                          isActive ? "bg-surface-container-low" : ""
                        }`}
                        onClick={() => openEditPanel(product)}
                      >
                        <TableCell className="pr-10">
                          <div className="flex items-center gap-3 ">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={44}
                                height={44}
                                className="h-11 w-11 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded bg-surface-container text-muted-foreground">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                            <div className="pr-2">
                              <p className="font-medium text-foreground">
                                {product.name}
                              </p>
                              <p className="text-sm text-secondary-foreground">
                                {product.sku}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="pl-10">
                          {product.category}
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>${formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <Badge variant={inferStockTone(product.stockStatus)}>
                            {product.stockStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditPanel(product);
                              }}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={async (event) => {
                                event.stopPropagation();
                                await handleDeleteProduct(product);
                              }}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <p className="font-medium text-foreground">
                        No products match your search.
                      </p>
                      <p className="mt-2 text-sm text-secondary-foreground">
                        Try a different term or add a new product.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest shadow-sm lg:sticky lg:top-6 lg:self-start">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary-foreground">
                  {isCreating
                    ? "Create New"
                    : hasActiveProduct
                      ? "Selected Product"
                      : "Inventory Detail"}
                </p>
                <h3 className="mt-1 text-xl font-heading font-bold text-foreground">
                  {isCreating
                    ? "Add Product"
                    : selectedProduct
                      ? selectedProduct.name
                      : "Pick a product"}
                </h3>
              </div>
              {selectedProduct ? (
                <Badge variant={inferStockTone(selectedProduct.stockStatus)}>
                  {selectedProduct.stockStatus}
                </Badge>
              ) : null}
            </div>

            {selectedProduct || isCreating ? (
              <>
                {selectedProduct ? (
                  <div className="overflow-hidden rounded-2xl border border-border bg-surface-container-low">
                    {selectedProduct.imageUrl ? (
                      <Image
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        width={800}
                        height={400}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center bg-surface-container text-muted-foreground">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-secondary-foreground">
                          SKU
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {selectedProduct.sku}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-secondary-foreground">
                          Category
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {selectedProduct.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-secondary-foreground">
                          Stock
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {selectedProduct.stock}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-secondary-foreground">
                          Price
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          ${formatCurrency(selectedProduct.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Product Name
                    </label>
                    <Input
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="e.g. Fresh Apples"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Stock
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            stock: event.target.value,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Price
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            price: event.target.value,
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Image URL
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        value={form.imageUrl}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            imageUrl: event.target.value,
                          }))
                        }
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUploadImage}
                        disabled={saving || uploading || !ready}
                      >
                        {uploading ? "Uploading..." : "Upload Image"}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-secondary-foreground">
                      Upload from Cloudinary or paste a direct image URL.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={handleSaveProduct}
                    disabled={saving}
                  >
                    <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                    {saving
                      ? "Saving..."
                      : isCreating
                        ? "Create Product"
                        : "Save Changes"}
                  </Button>
                  {!isCreating ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDeleteProduct(selectedProduct)}
                      disabled={saving}
                    >
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Archive
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsCreating(false);
                        setActiveProductId(null);
                        setForm(EMPTY_FORM);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-secondary-foreground">
                <p className="font-medium text-foreground">
                  Select a product to edit it, or add a new one.
                </p>
                <p className="mt-2">
                  The product details panel will appear here once you choose a
                  row from the inventory table.
                </p>
                <Button className="mt-4 w-full" onClick={openCreatePanel}>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryPage;
