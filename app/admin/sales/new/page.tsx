"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number | string;
  stock: number;
  sku: string | null;
};

type SaleItem = {
  productId: string;
  quantity: string;
};

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [items, setItems] = useState<SaleItem[]>([
    {
      productId: "",
      quantity: "1",
    },
  ]);

  const [discount, setDiscount] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [note, setNote] = useState("");

  const [lookupMessage, setLookupMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Failed to load products"
          );
        }

        setProducts(
          Array.isArray(result.products)
            ? result.products
            : []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load products"
        );
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  async function lookupCustomer(phone: string) {
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setLookupMessage("");
      setCustomerName("");
      setCustomerAddress("");
      return;
    }

    try {
      setLookupMessage("Looking up customer...");

      const response = await fetch(
        `/api/customers?phone=${encodeURIComponent(cleanPhone)}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Customer lookup failed"
        );
      }

      if (result.customer) {
        setCustomerName(result.customer.name || "");
        setCustomerAddress(
          result.customer.address || ""
        );

        setLookupMessage("Existing customer found.");
      } else {
        setCustomerName("");
        setCustomerAddress("");
        setLookupMessage("New customer.");
      }
    } catch (error) {
      setLookupMessage("");

      console.error(
        "Customer lookup error:",
        error
      );
    }
  }

  function updateItem(
    index: number,
    field: keyof SaleItem,
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
            (_, itemIndex) => itemIndex !== index
          )
    );
  }

  const subtotal = items.reduce(
    (sum, item) => {
      const product = products.find(
        (productItem) =>
          String(productItem.id) === item.productId
      );

      if (!product) {
        return sum;
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        return sum;
      }

      return (
        sum +
        Number(product.price) * quantity
      );
    },
    0
  );

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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
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

      if (discountAmount > subtotal) {
        throw new Error(
          "Discount cannot be greater than subtotal"
        );
      }

      const selectedProductIds = new Set<number>();

      const validItems = items
        .filter((item) => item.productId)
        .map((item) => {
          const productId = Number(item.productId);
          const quantity = Number(item.quantity);

          const product = products.find(
            (productItem) =>
              productItem.id === productId
          );

          if (!product) {
            throw new Error(
              "Selected product was not found"
            );
          }

          if (
            !Number.isInteger(quantity) ||
            quantity <= 0
          ) {
            throw new Error(
              `Invalid quantity for ${product.name}`
            );
          }

          if (selectedProductIds.has(productId)) {
            throw new Error(
              `${product.name} is already added. Please change the quantity instead.`
            );
          }

          selectedProductIds.add(productId);

          if (quantity > product.stock) {
            throw new Error(
              `Only ${product.stock} unit(s) of ${product.name} available in stock`
            );
          }

          return {
            productId,
            quantity,
          };
        });

      if (validItems.length === 0) {
        throw new Error(
          "Add at least one product"
        );
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress:
            customerAddress.trim() || null,
          items: validItems,
          discount: discountAmount,
          deliveryFee: deliveryAmount,
          paymentMethod,
          note: note.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to create sale"
        );
      }

      setSuccess(
        `Sale #${result.sale.id} created successfully.`
      );

      setTimeout(() => {
        window.location.href = "/admin/sales";
      }, 700);
    } catch (error) {
      console.error(
        "Create sale error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create sale"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin/sales"
              className="text-sm font-medium text-slate-400 hover:text-slate-950"
            >
              Sales
            </Link>

            <h1 className="mt-1 text-2xl font-black">
              New Sale
            </h1>
          </div>

          <Link
            href="/admin/sales"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold hover:border-slate-950"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
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
            <h2 className="text-lg font-black">
              Customer
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Phone
                </label>

                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => {
                    setCustomerPhone(
                      event.target.value
                    );
                    setLookupMessage("");
                    setCustomerName("");
                    setCustomerAddress("");
                  }}
                  onBlur={() =>
                    lookupCustomer(customerPhone)
                  }
                  placeholder="01XXXXXXXXX"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />

                {lookupMessage && (
                  <p className="mt-2 text-xs font-semibold text-emerald-600">
                    {lookupMessage}
                  </p>
                )}
              </div>

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
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
              >
                + Add Product
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {items.map((item, index) => {
                const selectedProduct =
                  products.find(
                    (product) =>
                      String(product.id) ===
                      item.productId
                  );

                return (
                  <div
                    key={index}
                    className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_140px_100px]"
                  >
                    <select
                      value={item.productId}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "productId",
                          event.target.value
                        )
                      }
                      disabled={loadingProducts}
                      required
                      className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
                    >
                      <option value="">
                        {loadingProducts
                          ? "Loading products..."
                          : "Select product"}
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                          disabled={product.stock <= 0}
                        >
                          {product.name} — ৳
                          {Number(
                            product.price
                          ).toLocaleString("en-BD")}{" "}
                          ({product.stock} in stock)
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      max={
                        selectedProduct?.stock ||
                        undefined
                      }
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "quantity",
                          event.target.value
                        )
                      }
                      className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(index)
                      }
                      className="h-11 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
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
                        event.target.value
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
                    Note
                  </label>

                  <textarea
                    value={note}
                    onChange={(event) =>
                      setNote(event.target.value)
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
                  />
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
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/sales"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || loadingProducts}
              className="rounded-xl bg-slate-950 px-7 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating Sale..."
                : "Create Sale"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}