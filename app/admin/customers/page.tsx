"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customers");

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load customers");
      }

      setCustomers(result.customers || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        (customer.address || "").toLowerCase().includes(query) ||
        (customer.email || "").toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const totalCustomers = customers.length;

  const totalSales = customers.reduce(
    (sum, customer) => sum + customer.totalSales,
    0
  );

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Digital Shop
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Customers
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950"
            >
              Admin
            </Link>

            <Link
              href="/admin/sales/new"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              + New Sale
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Customer Management
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight">
            All Customers
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            View customer information and purchase history.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Total Customers
            </p>

            <p className="mt-2 text-3xl font-black">
              {totalCustomers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Total Sales
            </p>

            <p className="mt-2 text-3xl font-black">
              {totalSales}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Customer Revenue
            </p>

            <p className="mt-2 text-3xl font-black">
              ৳{totalRevenue.toLocaleString("en-BD")}
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, phone, address or email..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950"
          />
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                    Address
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                    Sales
                  </th>

                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">
                    Total Spent
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm font-semibold text-slate-400"
                    >
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <p className="text-sm font-bold text-slate-500">
                        No customers found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Customers will appear here after sales are created.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-slate-950">
                            {customer.name}
                          </p>

                          {customer.email && (
                            <p className="mt-1 text-xs text-slate-400">
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-semibold text-slate-700">
                          {customer.phone}
                        </span>
                      </td>

                      <td className="max-w-xs px-6 py-5">
                        <p className="truncate text-sm text-slate-500">
                          {customer.address || "No address"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          {customer.totalSales}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-black">
                          ৳{customer.totalSpent.toLocaleString("en-BD")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && filteredCustomers.length > 0 && (
          <p className="mt-4 text-sm font-medium text-slate-400">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        )}
      </section>
    </main>
  );
}