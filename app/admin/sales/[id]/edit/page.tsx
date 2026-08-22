"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SaleItem = {
  id: number;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
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

export default function EditSalePage() {
  const params = useParams();
  const router = useRouter();

  const saleId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [sale, setSale] = useState<Sale | null>(null);
  const [orderStatus, setOrderStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] =
    useState("PENDING");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSale() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/sales/${saleId}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Failed to load sale"
          );
        }

        setSale(result.sale);
        setOrderStatus(
          result.sale.orderStatus || "PENDING"
        );
        setPaymentStatus(
          result.sale.paymentStatus || "PENDING"
        );
      } catch (error) {
        console.error("Sale loading error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load sale"
        );
      } finally {
        setLoading(false);
      }
    }

    if (saleId) {
      loadSale();
    }
  }, [saleId]);

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/sales/${saleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus,
            paymentStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to update sale"
        );
      }

      setSale(result.sale);
      setSuccess("Sale updated successfully.");

      setTimeout(() => {
        router.push(`/admin/sales/${saleId}`);
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("Sale update error:", error);

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
              {error || "This sale does not exist."}
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
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-bold">
                  {sale.customerName}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Phone
                </p>

                <p className="mt-1 font-bold">
                  {sale.customerPhone}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Address
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {sale.customerAddress ||
                    "No address provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black">
              Products
            </h2>

            <div className="mt-5 divide-y divide-slate-100">
              {sale.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-bold">
                      {item.productName}
                    </p>

                    {item.sku && (
                      <p className="mt-1 text-xs text-slate-400">
                        SKU: {item.sku}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} × ৳
                      {Number(
                        item.unitPrice
                      ).toLocaleString()}
                    </p>
                  </div>

                  <p className="font-black">
                    ৳
                    {Number(
                      item.total
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
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
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950"
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
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">
                Payment Status
              </h2>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold">
                  Status
                </label>

                <select
                  value={paymentStatus}
                  onChange={(event) =>
                    setPaymentStatus(
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950"
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
                  {Number(
                    sale.subtotal
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Discount
                </span>

                <span className="font-bold">
                  - ৳
                  {Number(
                    sale.discount
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Delivery Fee
                </span>

                <span className="font-bold">
                  ৳
                  {Number(
                    sale.deliveryFee
                  ).toLocaleString()}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span className="font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-black">
                    ৳
                    {Number(
                      sale.total
                    ).toLocaleString()}
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
              disabled={saving}
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