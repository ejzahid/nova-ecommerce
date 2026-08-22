import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

type CustomerDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailsPage({
  params,
}: CustomerDetailsPageProps) {
  const { id } = await params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    notFound();
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
    include: {
      sales: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: true,
        },
      },
      _count: {
        select: {
          sales: true,
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const totalSpent = customer.sales.reduce(
    (sum, sale) => sum + Number(sale.total),
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
        <div className="mb-8">
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
              {customer._count.sales}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Total Spent
            </p>

            <p className="mt-2 text-2xl font-black">
              ৳{totalSpent.toLocaleString("en-BD", {
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

          <div className="mt-5 grid gap-5 md:grid-cols-2">
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
                        {sale.createdAt.toLocaleDateString("en-BD")}
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
                        {Number(sale.total).toLocaleString("en-BD", {
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