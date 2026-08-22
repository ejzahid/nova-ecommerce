"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number | string;
  stock: number;
  sku: string | null;
};

type SaleItem = {
  id: number;
  productId: number;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
};

type ApiSaleItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
  product: {
    id: number;
    name: string;
    sku: string | null;
  } | null;
};

type Sale = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  subtotal: number | string;
  discount: number | string;
  deliveryFee: number | string;
  total: number | string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  note: string | null;
  createdAt: string;
  items: SaleItem[];
};

type ApiSale = Omit<Sale, "items"> & {
  items: ApiSaleItem[];
};

type EditItem = {
  productId: string;
  quantity: string;
};

function normalizeSale(sale: ApiSale): Sale {
  return {
    ...sale,
    items: sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName:
        item.product?.name ||
        "Product unavailable",
      sku: item.product?.sku || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
  };
}

export default function EditSalePage() {
  const params = useParams();
  const router = useRouter();

  const saleId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [sale, setSale] = useState<Sale | null>(
    null
  );

  const [products, setProducts] = useState<
    Product[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] =
    useState(true);
  const [saving, setSaving] = useState(false);

  const [customerName, setCustomerName] =
    useState("");
  const [customerPhone, setCustomerPhone] =
    useState("");
  const [customerAddress, setCustomerAddress] =
    useState("");

  const [items, setItems] = useState<EditItem[]>(
    []
  );

  const [discount, setDiscount] = useState("0");
  const [deliveryFee, setDeliveryFee] =
    useState("0");
  const [paymentMethod, setPaymentMethod] =
    useState("COD");
  const [paymentStatus, setPaymentStatus] =
    useState("PENDING");
  const [orderStatus, setOrderStatus] =
    useState("PENDING");
  const [note, setNote] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [saleResponse, productsResponse] =
          await Promise.all([
            fetch(`/api/sales/${saleId}`, {
              cache: "no-store",
            }),
            fetch("/api/products", {
              cache: "no-store",
            }),
          ]);

        const saleResult =
          await saleResponse.json();

        const productsResult =
          await productsResponse.json();

        if (
          !saleResponse.ok ||
          !saleResult.success
        ) {
          throw new Error(
            saleResult.error ||
              "Failed to load sale"
          );
        }

        if (
          !productsResponse.ok ||
          !productsResult.success
        ) {
          throw new Error(
            productsResult.error ||
              "Failed to load products"
          );
        }

        const normalizedSale =
          normalizeSale(saleResult.sale);

        setSale(normalizedSale);

        setProducts(
          Array.isArray(
            productsResult.products
          )
            ? productsResult.products
            : []
        );

        setCustomerName(
          normalizedSale.customerName
        );

        setCustomerPhone(
          normalizedSale.customerPhone
        );

        setCustomerAddress(
          normalizedSale.customerAddress || ""
        );

        setItems(
          normalizedSale.items.map((item) => ({
            productId: String(
              item.productId
            ),
            quantity: String(
              item.quantity
            ),
          }))
        );

        setDiscount(
          String(
            Number(normalizedSale.discount)
          )
        );

        setDeliveryFee(
          String(
            Number(
              normalizedSale.deliveryFee
            )
          )
        );

        setPaymentMethod(
          normalizedSale.paymentMethod || "COD"
        );

        setPaymentStatus(
          normalizedSale.paymentStatus ||
            "PENDING"
        );

        setOrderStatus(
          normalizedSale.orderStatus ||
            "PENDING"
        );

        setNote(normalizedSale.note || "");
      } catch (error) {
        console.error(
          "Edit sale loading error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load sale"
        );
      } finally {
        setLoading(false);
        setLoadingProducts(false);
      }
    }

    if (saleId) {
      loadData();
    }
  }, [saleId]);

  function updateItem(
    index: number,
    field: keyof EditItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        productId: "",
        quantity: "1",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter(
            (_, itemIndex) =>
              itemIndex !== index
          )
    );
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find(
        (productItem) =>
          String(productItem.id) ===
          item.productId
      );

      if (!product) {
        return sum;
      }

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return sum;
      }

      return (
        sum +
        Number(product.price) * quantity
      );
    }, 0);
  }, [items, products]);

  const discountAmount = Math.max(
    0,
    Number(discount || 0)
  );

  const deliveryAmount = Math.max(
    0,
    Number(deliveryFee || 0)
  );

  const total = Math.max(
    0,
    subtotal -
      discountAmount +
      deliveryAmount
  );

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!customerName.trim()) {
        throw new Error(
          "Customer name is required"
        );
      }

      if (!customerPhone.trim()) {
        throw new Error(
          "Customer phone is required"
        );
      }

      if (
        !Number.isFinite(
          discountAmount
        ) ||
        discountAmount < 0
      ) {
        throw new Error(
          "Invalid discount"
        );
      }

      if (discountAmount > subtotal) {
        throw new Error(
          "Discount cannot be greater than subtotal"
        );
      }

      if (
        !Number.isFinite(
          deliveryAmount
        ) ||
        deliveryAmount < 0
      ) {
        throw new Error(
          "Invalid delivery fee"
        );
      }

      if (items.length === 0) {
        throw new Error(
          "At least one product is required"
        );
      }

      const selectedProductIds =
        new Set<number>();

      const validItems = items.map(
        (item) => {
          if (!item.productId) {
            throw new Error(
              "Please select a product"
            );
          }

          const productId = Number(
            item.productId
          );

          const quantity = Number(
            item.quantity
          );

          const product = products.find(
            (productItem) =>
              productItem.id ===
              productId
          );

          if (!product) {
            throw new Error(
              "Selected product was not found"
            );
          }

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <= 0
          ) {
            throw new Error(
              `Invalid quantity for ${product.name}`
            );
          }

          if (
            selectedProductIds.has(
              productId
            )
          ) {
            throw new Error(
              `${product.name} is already added. Please change the quantity instead.`
            );
          }

          selectedProductIds.add(
            productId
          );

          return {
            productId,
            quantity,
          };
        }
      );

      const response = await fetch(
        `/api/sales/${saleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            customerName:
              customerName.trim(),
            customerPhone:
              customerPhone.trim(),
            customerAddress:
              customerAddress.trim() ||
              null,
            items: validItems,
            discount:
              discountAmount,
            deliveryFee:
              deliveryAmount,
            paymentMethod,
            paymentStatus,
            orderStatus,
            note:
              note.trim() || null,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Failed to update sale"
        );
      }

      const normalizedSale =
        normalizeSale(result.sale);

      setSale(normalizedSale);

      setSuccess(
        "Sale updated successfully."
      );

      setTimeout(() => {
        router.push(
          `/admin/sales/${saleId}`
        );
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Sale update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update sale"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-950">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading sale...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!sale) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-950">
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="text-2xl font-black">
              Sale Not Found
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "This sale does not exist."}
            </p>

            <Link
              href="/admin/sales"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              Back to Sales
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href={`/admin/sales/${sale.id}`}
              className="text-sm font-medium text-slate-400 transition hover:text-slate-950"
            >
              Sale #{sale.id}
            </Link>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Edit Sale
            </h1>
          </div>

          <Link
            href={`/admin/sales/${sale.id}`}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950"
          >
            Cancel
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <form
          onSubmit={handleSave}
          className="space-y-6"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sale
            </p>

            <h2 className="mt-1 text-2xl font-black">
              #{sale.id}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {new Date(
                sale.createdAt
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">
              Customer
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Customer Name
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value
                    )
                  }
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Phone
                </label>

                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) =>
                    setCustomerPhone(
                      event.target.value
                    )
                  }
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold">
                  Address
                </label>

                <textarea
                  value={customerAddress}
                  onChange={(event) =>
                    setCustomerAddress(
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">
                Products
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                + Add Product
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {items.map(
                (item, index) => {
                  const selectedProduct =
                    products.find(
                      (product) =>
                        String(
                          product.id
                        ) ===
                        item.productId
                    );

                  return (
                    <div
                      key={index}
                      className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_140px_100px]"
                    >
                      <select
                        value={
                          item.productId
                        }
                        onChange={(event) =>
                          updateItem(
                            index,
                            "productId",
                            event.target
                              .value
                          )
                        }
                        disabled={
                          loadingProducts
                        }
                        required
                        className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
                      >
                        <option value="">
                          {loadingProducts
                            ? "Loading products..."
                            : "Select product"}
                        </option>

                        {products.map(
                          (product) => {
                            const isCurrent =
                              String(
                                product.id
                              ) ===
                              item.productId;

                            return (
                              <option
                                key={
                                  product.id
                                }
                                value={
                                  product.id
                                }
                                disabled={
                                  product.stock <=
                                    0 &&
                                  !isCurrent
                                }
                              >
                                {
                                  product.name
                                }{" "}
                                — ৳
                                {Number(
                                  product.price
                                ).toLocaleString(
                                  "en-BD"
                                )}{" "}
                                (
                                {
                                  product.stock
                                }{" "}
                                in stock)
                              </option>
                            );
                          }
                        )}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={
                          item.quantity
                        }
                        onChange={(event) =>
                          updateItem(
                            index,
                            "quantity",
                            event.target
                              .value
                          )
                        }
                        className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        className="h-11 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>

                      {selectedProduct && (
                        <div className="md:col-span-3 -mt-1 text-xs text-slate-400">
                          SKU:{" "}
                          {selectedProduct.sku ||
                            "N/A"}{" "}
                          · Current stock:{" "}
                          {
                            selectedProduct.stock
                          }
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">
                Payment
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target
                          .value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                  >
                    <option value="COD">
                      Cash on Delivery
                    </option>

                    <option value="CASH">
                      Cash
                    </option>

                    <option value="BKASH">
                      bKash
                    </option>

                    <option value="NAGAD">
                      Nagad
                    </option>

                    <option value="CARD">
                      Card
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Payment Status
                  </label>

                  <select
                    value={paymentStatus}
                    onChange={(event) =>
                      setPaymentStatus(
                        event.target
                          .value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                  >
                    <option value="PENDING">
                      Pending
                    </option>

                    <option value="PAID">
                      Paid
                    </option>

                    <option value="FAILED">
                      Failed
                    </option>

                    <option value="REFUNDED">
                      Refunded
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Note
                  </label>

                  <textarea
                    value={note}
                    onChange={(event) =>
                      setNote(
                        event.target.value
                      )
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">
                Order Status
              </h2>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold">
                  Status
                </label>

                <select
                  value={orderStatus}
                  onChange={(event) =>
                    setOrderStatus(
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                >
                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="PROCESSING">
                    Processing
                  </option>

                  <option value="SHIPPED">
                    Shipped
                  </option>

                  <option value="DELIVERED">
                    Delivered
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-black">
                  Current Sale
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Sale #{sale.id}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">
              Summary
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-bold">
                  ৳
                  {subtotal.toLocaleString(
                    "en-BD",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Discount
                </label>

                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Delivery Fee
                </label>

                <input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(event) =>
                    setDeliveryFee(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-black">
                    ৳
                    {total.toLocaleString(
                      "en-BD",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={`/admin/sales/${sale.id}`}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold transition hover:border-slate-950"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                loadingProducts
              }
              className="rounded-xl bg-slate-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}