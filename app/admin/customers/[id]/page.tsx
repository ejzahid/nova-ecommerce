"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  totalSales: number;
  totalSpent: number;
  sales: Sale[];
};

type SaleItem = {
  id: number;
  productId: number;
  productName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
};

type Sale = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
};

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = String(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/customers/${customerId}`);

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Failed to load customer"
          );
        }

        const data = result.customer as Customer;

        setCustomer(data);

        setName(data.name);
        setPhone(data.phone);
        setAddress(data.address || "");
        setEmail(data.email || "");
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load customer"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [customerId]);

  async function handleSave() {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError("Customer name is required.");
      return;
    }

    if (!cleanPhone) {
      setError("Customer phone is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/customers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(customerId),
          name: cleanName,
          phone: cleanPhone,
          address: address.trim(),
          email: email.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to update customer"
        );
      }

      const updated = result.customer;

      setCustomer((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          name: updated.name,
          phone: updated.phone,
          address: updated.address,
          email: updated.email,
          updatedAt: updated.updatedAt,
        };
      });

      setName(updated.name);
      setPhone(updated.phone);
      setAddress(updated.address || "");
      setEmail(updated.email || "");

      setEditing(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update customer"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    if (!customer) {
      return;
    }

    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address || "");
    setEmail(customer.email || "");

    setError("");
    setEditing(false);
  }

  async function handleDelete() {
    if (!customer) {
      return;
    }

    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `/api/customers?id=${customer.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to delete customer"
        );
      }

      router.push("/admin/customers");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete customer"
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-500">
            Loading customer...
          </p>
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-950">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-black">
              Customer not found
            </h1>

            {error && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <Link
              href="/admin/customers"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Back to Customers
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Digital Shop
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Customer Details
            </h1>
          </div>

          <Link
            href="/admin/customers"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950"
          >
            Back to Customers
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Customer
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {customer.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Customer ID: #{customer.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setEditing(true);
                }}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Edit Customer
              </button>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Customer"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Phone
            </p>

            <p className="mt-2 text-lg font-black">
              {customer.phone}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Total Orders
            </p>

            <p className="mt-2 text-2xl font-black">
              {customer.totalSales}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Total Spent
            </p>

            <p className="mt-2 text-2xl font-black">
              ৳
              {customer.totalSpent.toLocaleString("en-BD", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black">
            Customer Information
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {editing
              ? "Update the customer's information below."
              : "Customer contact information."}
          </p>

          {editing ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-950 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Phone
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-950 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-950 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Address
                </label>

                <input
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-slate-950 disabled:bg-slate-100"
                />
              </div>

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-semibold">
                  {customer.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email
                </p>

                <p className="mt-1 font-semibold">
                  {customer.email || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Phone
                </p>

                <p className="mt-1 font-semibold">
                  {customer.phone}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Address
                </p>

                <p className="mt-1 font-semibold">
                  {customer.address || "Not provided"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-black">
              Order History
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              All sales associated with this customer.
            </p>
          </div>

          {customer.sales.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                No orders found for this customer.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Sale
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Items
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customer.sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/sales/${sale.id}`}
                          className="font-bold text-slate-950 hover:underline"
                        >
                          #{sale.id}
                        </Link>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {new Date(
                          sale.createdAt
                        ).toLocaleDateString("en-BD")}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                          {sale.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold">
                          {sale.paymentMethod}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {sale.paymentStatus}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                          {sale.orderStatus}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right font-black">
                        ৳
                        {sale.total.toLocaleString("en-BD", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}