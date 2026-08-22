"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

      setCategories(result.categories || []);
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

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nThis action cannot be undone.`
    );

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
        current.filter((item) => item.id !== category.id)
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

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Categories
            </p>

            <p className="mt-2 text-3xl font-black">
              {categories.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-600">
              {
                categories.filter(
                  (category) => category.isActive
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-black text-slate-500">
              {
                categories.filter(
                  (category) => !category.isActive
                ).length
              }
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

                <p className="mt-3 text-sm font-medium text-slate-500">
                  Loading categories...
                </p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm font-semibold text-slate-400">
                NO CATEGORIES
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Your category list is empty.
              </h2>

              <Link
                href="/admin/categories/new"
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Add Your First Category
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Slug
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Sort Order
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
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                            {category.icon || "▦"}
                          </div>

                          <div>
                            <p className="font-bold">
                              {category.name}
                            </p>

                            {category.subtitle && (
                              <p className="mt-1 text-xs text-slate-400">
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
                        {category.sortOrder}
                      </td>

                      <td className="px-5 py-5">
                        {category.isActive ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            href="/admin/categories"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold transition hover:border-slate-950"
                          >
                            Manage
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            disabled={
                              deletingId === category.id
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === category.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
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