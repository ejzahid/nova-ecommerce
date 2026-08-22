"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Sale = {
  id: number;
  customerName: string;
  customerPhone: string;
  total: number | string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: {
    id: number;
    quantity: number;
  }[];
};

function getStatusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    case "SHIPPED":
      return "bg-blue-50 text-blue-700";

    case "PROCESSING":
      return "bg-indigo-50 text-indigo-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

function getPaymentClass(status: string) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";

    case "FAILED":
      return "bg-red-50 text-red-700";

    case "REFUNDED":
      return "bg-purple-50 text-purple-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadSales() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/sales", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Failed to load sales"
          );
        }

        setSales(
          Array.isArray(result.sales)
            ? result.sales
            : []
        );
      } catch (error) {
        console.error(
          "Sales loading error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load sales"
        );
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, []);

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSearchQuery(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setSearchQuery("");
  }

  const filteredSales = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return sales;
    }

    return sales.filter((sale) => {
      const saleId = String(sale.id);

      const customerName =
        sale.customerName.toLowerCase();

      const customerPhone =
        sale.customerPhone.toLowerCase();

      return (
        saleId.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query)
      );
    });
  }, [sales, searchQuery]);

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.total),
    0
  );

  const pendingCount = sales.filter(
    (sale) => sale.orderStatus === "PENDING"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-400 transition hover:text-slate-950"
            >
              Admin
            </Link>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Sales
            </h1>
          </div>

          <Link
            href="/admin/sales/new"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            + New Sale
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Sales
            </p>

            <p className="mt-2 text-3xl font-black">
              {sales.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Orders
            </p>

            <p className="mt-2 text-3xl font-black text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </p>

            <p className="mt-2 text-3xl font-black">
              ৳{totalRevenue.toLocaleString("en-BD")}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 md:flex-row"
          >
            <div className="flex-1">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Search Sales
              </label>

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search by Sale ID, customer name or phone..."
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="h-12 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Search
              </button>

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-slate-950"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {searchQuery && (
            <p className="mt-3 text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-950">
                {filteredSales.length}
              </span>{" "}
              result
              {filteredSales.length !== 1
                ? "s"
                : ""}{" "}
              for{" "}
              <span className="font-bold text-slate-950">
                "{searchQuery}"
              </span>
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

                <p className="mt-3 text-sm font-medium text-slate-500">
                  Loading sales...
                </p>
              </div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm font-semibold text-slate-400">
                {searchQuery
                  ? "NO RESULTS"
                  : "NO SALES"}
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {searchQuery
                  ? "No sales matched your search."
                  : "No sales have been created yet."}
              </h2>

              {searchQuery ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-5 inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  href="/admin/sales/new"
                  className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
                >
                  Create First Sale
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Sale
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Items
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Total
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-5">
                        <Link
                          href={`/admin/sales/${sale.id}`}
                          className="font-bold text-slate-950 hover:underline"
                        >
                          #{sale.id}
                        </Link>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            sale.createdAt
                          ).toLocaleString()}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-bold">
                          {sale.customerName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {sale.customerPhone}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm font-semibold text-slate-600">
                        {sale.items.reduce(
                          (sum, item) =>
                            sum + item.quantity,
                          0
                        )}
                      </td>

                      <td className="px-5 py-5 font-black">
                        ৳
                        {Number(
                          sale.total
                        ).toLocaleString("en-BD")}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getPaymentClass(
                            sale.paymentStatus
                          )}`}
                        >
                          {sale.paymentStatus}
                        </span>

                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {sale.paymentMethod}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                            sale.orderStatus
                          )}`}
                        >
                          {sale.orderStatus}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/sales/${sale.id}`}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold transition hover:border-slate-950"
                          >
                            View
                          </Link>

                          <Link
                            href={`/admin/sales/${sale.id}/edit`}
                            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                          >
                            Edit
                          </Link>
                        </div>
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