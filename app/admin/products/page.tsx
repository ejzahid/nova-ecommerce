"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: Category | null;
  categoryId: number;
  price: number | string;
  oldPrice: number | string | null;
  sku: string | null;
  stock: number;
  image: string | null;
  badge: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
};

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined) {
    return "৳0";
  }

  const numberValue =
    typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return "৳0";
  }

  return `৳${numberValue.toLocaleString("en-BD")}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

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
      console.error(
        "Admin products loading error:",
        error
      );

      setProducts([]);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const map = new Map<number, Category>();

    products.forEach((product) => {
      if (product.category) {
        map.set(
          product.category.id,
          product.category
        );
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name
          .toLowerCase()
          .includes(query) ||
        product.slug
          .toLowerCase()
          .includes(query) ||
        (product.sku || "")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        String(product.categoryId) ===
          categoryFilter;

      return (
        matchesSearch && matchesCategory
      );
    });
  }, [
    products,
    search,
    categoryFilter,
  ]);

  async function handleDelete(id: number) {
    const product = products.find(
      (item) => item.id === id
    );

    if (!product) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `/api/products?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Failed to delete product"
        );
      }

      setProducts((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Product delete error:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  }

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total + product.stock,
    0
  );

  const outOfStock = products.filter(
    (product) => product.stock <= 0
  ).length;

  const featuredProducts =
    products.filter(
      (product) => product.isFeatured
    ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-400 transition hover:text-slate-950"
            >
              Admin
            </Link>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Products
            </h1>
          </div>

          <Link
            href="/admin/products/new"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            + Add Product
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProducts}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-black">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Stock
            </p>

            <p className="mt-2 text-3xl font-black">
              {totalStock}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-black text-red-600">
              {outOfStock}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Featured
            </p>

            <p className="mt-2 text-3xl font-black">
              {featuredProducts}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search product, SKU or slug..."
              className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950"
            />

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-slate-950"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={String(category.id)}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

                <p className="mt-3 text-sm font-medium text-slate-500">
                  Loading products...
                </p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm font-semibold text-slate-400">
                NO PRODUCTS FOUND
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {products.length === 0
                  ? "Your product catalog is empty."
                  : "No products match your search."}
              </h2>

              {products.length === 0 && (
                <Link
                  href="/admin/products/new"
                  className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
                >
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Product
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Price
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Stock
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
                  {filteredProducts.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg font-black text-slate-300">
                                  D
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold">
                                {product.name}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                SKU:{" "}
                                {product.sku ||
                                  "N/A"}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {product.slug}
                              </p>

                              {product.isFeatured && (
                                <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {product.category
                            ? product.category.name
                            : "General"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold">
                            {formatPrice(
                              product.price
                            )}
                          </p>

                          {product.oldPrice !==
                            null && (
                            <p className="text-xs text-slate-400 line-through">
                              {formatPrice(
                                product.oldPrice
                              )}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {product.stock > 0 ? (
                            <span className="font-semibold text-emerald-600">
                              {product.stock}
                            </span>
                          ) : (
                            <span className="font-semibold text-red-600">
                              0
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {product.isActive ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold transition hover:border-slate-950"
                            >
                              View
                            </Link>

                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  product.id
                                )
                              }
                              disabled={
                                deletingId ===
                                product.id
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              product.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading &&
          filteredProducts.length > 0 && (
            <p className="mt-4 text-xs font-medium text-slate-400">
              Showing{" "}
              {filteredProducts.length} of{" "}
              {products.length} products
            </p>
          )}
      </section>
    </main>
  );
}