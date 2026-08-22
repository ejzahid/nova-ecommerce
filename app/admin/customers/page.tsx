import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          sales: true,
        },
      },
    },
  });

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

          <Link
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Customer Management
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-tight">
                All Customers
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                View customer contact information and order history.
              </p>
            </div>

            <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Customers
              </p>

              <p className="mt-1 text-2xl font-black">
                {customers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {customers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">👥</div>

              <h3 className="mt-4 text-xl font-black">
                No customers yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Customers will appear here after a sale is created.
              </p>

              <Link
                href="/admin/sales/new"
                className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Create New Sale
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Address
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Orders
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-slate-950">
                            {customer.name}
                          </p>

                          {customer.email && (
                            <p className="mt-1 text-sm text-slate-500">
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-700">
                          {customer.phone}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="max-w-xs truncate text-sm text-slate-500">
                          {customer.address || "No address"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                          {customer._count.sales}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {customer.createdAt.toLocaleDateString("en-BD")}
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