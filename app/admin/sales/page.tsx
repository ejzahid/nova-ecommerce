"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        console.error("Sales loading error:", error);

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
              ৳{totalRevenue.toLocaleString()}
            </p>
          </div>
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
          ) : sales.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm font-semibold text-slate-400">
                NO SALES
              </p>

              <h2 className="mt-2 text-xl font-bold">
                No sales have been created yet.
              </h2>

              <Link
                href="/admin/sales/new"
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Create First Sale
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
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
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-5">
                        <p className="font-bold">
                          #{sale.id}
                        </p>

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
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-5">
                        <span className="text-xs font-bold text-slate-600">
                          {sale.paymentMethod}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          {sale.orderStatus}
                        </span>
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