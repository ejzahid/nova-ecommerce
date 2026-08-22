"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
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
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to create category"
        );
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Category create error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create category"
      );
    } finally {
      setSaving(false);
    }
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
              Add Category
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
              {saving ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}