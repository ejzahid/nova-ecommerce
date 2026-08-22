"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
};

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("0");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        const result = await response.json();

        if (result.success) {
          setCategories(result.categories || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!slug) {
      setSlug(makeSlug(value));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          categoryId: Number(categoryId),
          price: Number(price),
          oldPrice: oldPrice
            ? Number(oldPrice)
            : null,
          sku: sku || null,
          stock: Number(stock),
          image: image || null,
          badge: badge || null,
          isFeatured,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to create product"
        );
      }

      setMessage("Product added successfully.");

      setName("");
      setSlug("");
      setDescription("");
      setCategoryId("");
      setPrice("");
      setOldPrice("");
      setSku("");
      setStock("0");
      setImage("");
      setBadge("");
      setIsFeatured(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Digital Shop
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Add Product
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:border-slate-950"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-sm md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Product Name *
              </label>

              <input
                value={name}
                onChange={(event) =>
                  handleNameChange(event.target.value)
                }
                required
                placeholder="Example: Xiaomi Wireless Keyboard"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Slug *
              </label>

              <input
                value={slug}
                onChange={(event) =>
                  setSlug(makeSlug(event.target.value))
                }
                required
                placeholder="xiaomi-wireless-keyboard"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category *
              </label>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                required
                disabled={loadingCategories}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-950"
              >
                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {categories
                  .filter((category) => category.isActive)
                  .map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Price *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                required
                placeholder="3490"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* Old Price */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Old Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={oldPrice}
                onChange={(event) =>
                  setOldPrice(event.target.value)
                }
                placeholder="4290"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                SKU
              </label>

              <input
                value={sku}
                onChange={(event) =>
                  setSku(event.target.value)
                }
                placeholder="DS-001"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Badge
              </label>

              <input
                value={badge}
                onChange={(event) =>
                  setBadge(event.target.value)
                }
                placeholder="NEW / HOT / BESTSELLER"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Image URL
              </label>

              <input
                type="url"
                value={image}
                onChange={(event) =>
                  setImage(event.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={5}
                placeholder="Product description..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            {/* Featured */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(event) =>
                    setIsFeatured(event.target.checked)
                  }
                  className="h-4 w-4"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Featured Product
                  </p>

                  <p className="text-xs text-slate-500">
                    Featured products will appear first on
                    the Home Page.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </section>
    </main>
  );
}