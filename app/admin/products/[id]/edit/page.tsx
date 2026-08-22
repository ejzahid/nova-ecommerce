"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  categoryId: number;
  price: number | string;
  oldPrice: number | string | null;
  sku: string | null;
  stock: number;
  image: string | null;
  badge: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: Category | null;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;

  const id = Array.isArray(rawId)
    ? rawId[0]
    : rawId;

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    price: "",
    oldPrice: "",
    sku: "",
    stock: "0",
    image: "",
    badge: "",
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (!id) {
      setError("Invalid product ID.");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          productResponse,
          categoryResponse,
        ] = await Promise.all([
          fetch(
            `/api/products?id=${encodeURIComponent(
              String(id)
            )}`,
            {
              cache: "no-store",
            }
          ),
          fetch("/api/categories", {
            cache: "no-store",
          }),
        ]);

        const productResult =
          await productResponse.json();

        const categoryResult =
          await categoryResponse.json();

        if (
          !productResponse.ok ||
          !productResult.success
        ) {
          throw new Error(
            productResult.error ||
              "Failed to load product"
          );
        }

        if (
          !categoryResponse.ok ||
          !categoryResult.success
        ) {
          throw new Error(
            categoryResult.error ||
              "Failed to load categories"
          );
        }

        let foundProduct: Product | null =
          null;

        if (
          Array.isArray(
            productResult.products
          )
        ) {
          foundProduct =
            productResult.products.find(
              (item: Product) =>
                String(item.id) ===
                String(id)
            ) || null;
        }

        if (
          !foundProduct &&
          productResult.product
        ) {
          foundProduct =
            productResult.product;
        }

        if (!foundProduct) {
          throw new Error(
            "Product not found"
          );
        }

        setProduct(foundProduct);

        setCategories(
          Array.isArray(
            categoryResult.categories
          )
            ? categoryResult.categories
            : []
        );

        setForm({
          name: foundProduct.name || "",
          slug: foundProduct.slug || "",
          description:
            foundProduct.description || "",
          categoryId: String(
            foundProduct.categoryId || ""
          ),
          price: String(
            foundProduct.price ?? ""
          ),
          oldPrice:
            foundProduct.oldPrice ===
              null ||
            foundProduct.oldPrice ===
              undefined
              ? ""
              : String(
                  foundProduct.oldPrice
                ),
          sku: foundProduct.sku || "",
          stock: String(
            foundProduct.stock ?? 0
          ),
          image: foundProduct.image || "",
          badge: foundProduct.badge || "",
          isFeatured:
            Boolean(
              foundProduct.isFeatured
            ),
          isActive:
            Boolean(
              foundProduct.isActive
            ),
        });
      } catch (error) {
        console.error(
          "Edit product loading error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError("Invalid product ID.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/products?id=${encodeURIComponent(
          String(id)
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description:
              form.description,
            categoryId: Number(
              form.categoryId
            ),
            price: Number(form.price),
            oldPrice:
              form.oldPrice === ""
                ? null
                : Number(form.oldPrice),
            sku:
              form.sku.trim() === ""
                ? null
                : form.sku,
            stock: Number(form.stock),
            image:
              form.image.trim() === ""
                ? null
                : form.image,
            badge:
              form.badge.trim() === ""
                ? null
                : form.badge,
            isFeatured:
              form.isFeatured,
            isActive:
              form.isActive,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Failed to update product"
        );
      }

      setSuccess(
        "Product updated successfully."
      );

      if (result.product) {
        setProduct(result.product);
      }

      setTimeout(() => {
        router.push(
          "/admin/products"
        );
      }, 700);
    } catch (error) {
      console.error(
        "Product update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update product"
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
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-red-500">
            PRODUCT NOT FOUND
          </p>

          <h1 className="mt-3 text-3xl font-black">
            This product doesn't exist.
          </h1>

          <Link
            href="/admin/products"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-slate-400 hover:text-slate-950"
            >
              ← Products
            </Link>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Edit Product
            </h1>
          </div>

          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:border-slate-950"
          >
            View Product
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black">
              Basic Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-bold">
                  Product Name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Slug
                </label>

                <input
                  required
                  value={form.slug}
                  onChange={(event) =>
                    updateField(
                      "slug",
                      event.target.value
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  SKU
                </label>

                <input
                  value={form.sku}
                  onChange={(event) =>
                    updateField(
                      "sku",
                      event.target.value
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black">
              Pricing & Inventory
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold">
                  Category
                </label>

                <select
                  required
                  value={form.categoryId}
                  onChange={(event) =>
                    updateField(
                      "categoryId",
                      event.target.value
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-950"
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">
                  Price
                </label>

                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    updateField(
                      "price",
                      event.target.value
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Old Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.oldPrice}
                  onChange={(event) =>
                    updateField(
                      "oldPrice",
                      event.target.value
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Stock
                </label>

                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    updateField(
                      "stock",
                      event.target.value
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-black">
              Image & Display
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="text-sm font-bold">
                  Image URL
                </label>

                <input
                  type="url"
                  value={form.image}
                  onChange={(event) =>
                    updateField(
                      "image",
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  Badge
                </label>

                <input
                  value={form.badge}
                  onChange={(event) =>
                    updateField(
                      "badge",
                      event.target.value
                    )
                  }
                  placeholder="New, Sale, Featured..."
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(event) =>
                      updateField(
                        "isFeatured",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-bold">
                    Featured Product
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      updateField(
                        "isActive",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-bold">
                    Active Product
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-bold transition hover:border-slate-950"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}