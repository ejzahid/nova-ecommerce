import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Digital Shop
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Admin Dashboard
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950"
          >
            View Store
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Management
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight">
            Store Management
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage products, categories, customers and sales from here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📦
              </div>

              <span className="text-slate-300 transition group-hover:text-slate-950">
                →
              </span>
            </div>

            <h3 className="mt-6 text-xl font-black">
              Products
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add, edit, delete and manage your store products,
              prices, stock and product details.
            </p>

            <div className="mt-6 text-sm font-bold text-slate-950">
              Manage Products →
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🗂️
              </div>

              <span className="text-slate-300 transition group-hover:text-slate-950">
                →
              </span>
            </div>

            <h3 className="mt-6 text-xl font-black">
              Categories
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create, manage and delete product categories,
              subtitles, icons and sorting order.
            </p>

            <div className="mt-6 text-sm font-bold text-slate-950">
              Manage Categories →
            </div>
          </Link>

          <Link
            href="/admin/customers"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                👥
              </div>

              <span className="text-slate-300 transition group-hover:text-slate-950">
                →
              </span>
            </div>

            <h3 className="mt-6 text-xl font-black">
              Customers
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View customers, contact information and complete
              order history.
            </p>

            <div className="mt-6 text-sm font-bold text-slate-950">
              Manage Customers →
            </div>
          </Link>

          <Link
            href="/admin/sales"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🧾
              </div>

              <span className="text-slate-300 transition group-hover:text-slate-950">
                →
              </span>
            </div>

            <h3 className="mt-6 text-xl font-black">
              Sales
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create new sales, manage customer information,
              payments, orders and sale status.
            </p>

            <div className="mt-6 text-sm font-bold text-slate-950">
              Manage Sales →
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}