"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadCategories() {
    try {
      setLoading(true);

      const response = await fetch("/api/categories", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to load categories"
        );
      }

      setCategories(
        Array.isArray(result.categories)
          ? result.categories
          : []
      );
    } catch (error) {
      console.error("Categories loading error:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function toggleStatus(category: Category) {
    try {
      setUpdatingId(category.id);

      const response = await fetch(
        `/api/categories/${category.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: category.name,
            subtitle: category.subtitle,
            icon: category.icon,
            sortOrder: category.sortOrder,
            isActive: !category.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to update category"
        );
      }

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? {
                ...item,
                ...result.category,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Category status update error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update category"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(category: Category) {
    const productCount =
      category._count?.products ?? 0;

    const message =
      productCount > 0
        ? `"${category.name}" contains ${productCount} product${
            productCount === 1 ? "" : "s"
          }.\n\nYou cannot delete a category that contains products.`
        : `Delete "${category.name}"?\n\nThis action cannot be undone.`;

    if (productCount > 0) {
      alert(message);
      return;
    }

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);

      const response = await fetch(
        `/api/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to delete category"
        );
      }

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );
    } catch (error) {
      console.error("Category delete error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete category"
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories
      .filter((category) => {
        const matchesSearch =
          !query ||
          category.name
            .toLowerCase()
            .includes(query) ||
          category.slug
            .toLowerCase()
            .includes(query) ||
          (category.subtitle || "")
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" &&
            category.isActive) ||
          (statusFilter === "inactive" &&
            !category.isActive);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }

        return a.name.localeCompare(b.name);
      });
  }, [categories, search, statusFilter]);

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.isActive
  ).length;

  const inactiveCategories =
    totalCategories - activeCategories;

  const totalProducts = categories.reduce(
    (total, category) =>
      total + (category._count?.products ?? 0),
    0
  );

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
              Categories
            </h1>
          </div>

          <Link
            href="/admin/categories/new"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            + Add Category
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Categories
            </p>

            <p className="mt-2 text-3xl font-black">
              {totalCategories}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-600">
              {activeCategories}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-black text-slate-500">
              {inactiveCategories}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Products
            </p>

            <p className="mt-2 text-3xl font-black">
              {totalProducts}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search category, slug or subtitle..."
              className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-slate-950"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              type="button"
              onClick={loadCategories}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold transition hover:border-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

                <p className="mt-3 text-sm font-medium text-slate-500">
                  Loading categories...
                </p>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm font-semibold text-slate-400">
                NO CATEGORIES FOUND
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {categories.length === 0
                  ? "Your category list is empty."
                  : "No categories match your search."}
              </h2>

              {categories.length === 0 && (
                <Link
                  href="/admin/categories/new"
                  className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
                >
                  Add Your First Category
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Slug
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Products
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Sort
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
                  {filteredCategories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                              {category.icon || "◆"}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold">
                                {category.name}
                              </p>

                              {category.subtitle && (
                                <p className="mt-1 max-w-sm truncate text-xs text-slate-400">
                                  {category.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            {category.slug}
                          </code>
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-slate-600">
                          {category._count?.products ?? 0}
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-slate-600">
                          {category.sortOrder}
                        </td>

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              toggleStatus(category)
                            }
                            disabled={
                              updatingId === category.id
                            }
                            className={
                              category.isActive
                                ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                : "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
                            }
                          >
                            {updatingId ===
                            category.id
                              ? "Updating..."
                              : category.isActive
                                ? "Active"
                                : "Inactive"}
                          </button>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/categories/${category.id}/edit`}
                              className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(category)
                              }
                              disabled={
                                deletingId ===
                                category.id
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              category.id
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
          filteredCategories.length > 0 && (
            <p className="mt-4 text-xs font-medium text-slate-400">
              Showing {filteredCategories.length} of{" "}
              {categories.length} categories
            </p>
          )}
      </section>
    </main>
  );
}