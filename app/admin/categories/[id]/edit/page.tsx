"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
};

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;

  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [category, setCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid category ID.");
      setLoading(false);
      return;
    }

    async function loadCategory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/categories/${encodeURIComponent(String(id))}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Failed to load category"
          );
        }

        const foundCategory: Category = result.category;

        setCategory(foundCategory);

        setName(foundCategory.name || "");
        setSubtitle(foundCategory.subtitle || "");
        setIcon(foundCategory.icon || "");
        setSortOrder(String(foundCategory.sortOrder ?? 0));
        setIsActive(Boolean(foundCategory.isActive));
      } catch (error) {
        console.error("Category loading error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load category"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError("Invalid category ID.");
      return;
    }

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/categories/${encodeURIComponent(String(id))}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            subtitle:
              subtitle.trim() === ""
                ? null
                : subtitle.trim(),
            icon:
              icon.trim() === ""
                ? null
                : icon.trim(),
            sortOrder: Number(sortOrder),
            isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to update category"
        );
      }

      setCategory(result.category);

      setSuccess("Category updated successfully.");

      setTimeout(() => {
        router.push("/admin/categories");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Category update error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update category"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading category...
          </p>
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-500">
            CATEGORY NOT FOUND
          </p>

          <h1 className="mt-3 text-3xl font-black">
            This category doesn't exist.
          </h1>

          <Link
            href="/admin/categories"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white"
          >
            Back to Categories
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin/categories"
              className="text-sm font-medium text-slate-400 transition hover:text-slate-950"
            >
              Categories
            </Link>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Edit Category
            </h1>
          </div>

          <Link
            href="/admin/categories"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          <div className="grid gap-6">
            <div>
              <label className="mb-2 block text-sm font-bold">
                Category Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Audio"
                required
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950"
              />

              <p className="mt-2 text-xs text-slate-400">
                Slug will be generated automatically from the
                category name.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Subtitle
              </label>

              <input
                type="text"
                value={subtitle}
                onChange={(event) =>
                  setSubtitle(event.target.value)
                }
                placeholder="Short category description"
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Icon
                </label>

                <input
                  type="text"
                  value={icon}
                  onChange={(event) =>
                    setIcon(event.target.value)
                  }
                  placeholder="🎧"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Sort Order
                </label>

                <input
                  type="number"
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value)
                  }
                  min="0"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-950"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">
                    Category Status
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Inactive categories can remain in the
                    database but can be hidden from active
                    listings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsActive((current) => !current)
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    isActive
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                  aria-label="Toggle category status"
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      isActive
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-3">
                {isActive ? (
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <Link
              href="/admin/categories"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:border-slate-950"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}