"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../cart/CartContext";

type Category = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  categoryId: number;
  price: number | string;
  oldPrice: number | string | null;
  stock: number;
  image: string | null;
  badge: string | null;
  isActive: boolean;
  isFeatured: boolean;
};

function formatPrice(value: number | string | null) {
  if (value === null || value === undefined) {
    return "৳0";
  }

  const numberValue =
    typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numberValue)) {
    return "৳0";
  }

  return `৳${numberValue.toLocaleString("en-BD")}`;
}

export default function ShopPage() {
  const { addToCart, cart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] =
    useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const result = await response.json();

        if (result.success) {
          setProducts(result.products || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Product loading error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const result = await response.json();

        if (result.success) {
          setCategories(result.categories || []);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error(
          "Category loading error:",
          error
        );

        setCategories([]);
      } finally {
        setCategoryLoading(false);
      }
    }

    loadCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const categorySlug =
        product.category?.slug || "";

      const categoryName =
        product.category?.name || "";

      const matchesCategory =
        selectedCategory === "all" ||
        categorySlug === selectedCategory;

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query) ||
        (product.description || "")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [
    products,
    selectedCategory,
    search,
  ]);

  function handleAddToCart(product: Product) {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.image || "",
    });

    setAddedId(product.id);

    window.setTimeout(() => {
      setAddedId((current) =>
        current === product.id ? null : current
      );
    }, 1500);
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#f5f5f2] text-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            Digital Shop
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-neutral-500 transition hover:text-neutral-950"
            >
              Home
            </Link>

            <Link
              href="/cart"
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold transition hover:border-neutral-950"
            >
              Cart
              {cartCount > 0 && (
                <span className="ml-2">
                  ({cartCount})
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            Digital Shop
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            Shop products
            <br />
            you’ll love.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-500">
            Discover our latest products, browse by
            category, and find something perfect for
            your everyday needs.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedCategory("all")
              }
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-neutral-950 text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-950 hover:text-neutral-950"
              }`}
            >
              All Products
            </button>

            {!categoryLoading &&
              categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category.slug)
                  }
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    selectedCategory === category.slug
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-950 hover:text-neutral-950"
                  }`}
                >
                  {category.name}
                </button>
              ))}
          </div>

          {/* Search */}
          <div className="w-full lg:w-80">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products..."
              className="w-full rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-3xl border border-neutral-200 bg-white"
                >
                  <div className="aspect-square animate-pulse bg-neutral-100" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-100" />
                    <div className="h-5 w-24 animate-pulse rounded bg-neutral-100" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-20 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              No products
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              No products found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try another search or choose a different
              category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Showing{" "}
                <span className="font-semibold text-neutral-950">
                  {filteredProducts.length}
                </span>{" "}
                product
                {filteredProducts.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const inCart = cart.some(
                  (item) => item.id === product.id
                );

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="block"
                    >
                      <div className="relative aspect-square overflow-hidden bg-neutral-100">
                        {product.badge && (
                          <span className="absolute left-4 top-4 z-10 rounded-full bg-neutral-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            {product.badge}
                          </span>
                        )}

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-lg">
                              <span className="text-4xl font-black">
                                D
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-5">
                      <p className="text-xs font-medium text-neutral-400">
                        {product.category?.name ||
                          "General"}
                      </p>

                      <Link
                        href={`/products/${product.slug}`}
                      >
                        <h2 className="mt-1 line-clamp-2 min-h-12 font-semibold leading-6 transition hover:text-neutral-500">
                          {product.name}
                        </h2>
                      </Link>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-bold">
                          {formatPrice(product.price)}
                        </span>

                        {product.oldPrice !== null && (
                          <span className="text-sm text-neutral-400 line-through">
                            {formatPrice(
                              product.oldPrice
                            )}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-neutral-400">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </p>

                      <button
                        type="button"
                        disabled={product.stock <= 0}
                        onClick={() =>
                          handleAddToCart(product)
                        }
                        className={`mt-4 w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
                          product.stock <= 0
                            ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                            : addedId === product.id
                              ? "bg-emerald-600 text-white"
                              : "bg-neutral-950 text-white hover:bg-neutral-800"
                        }`}
                      >
                        {product.stock <= 0
                          ? "Out of Stock"
                          : addedId === product.id
                            ? "Added to Cart"
                            : inCart
                              ? "Add Again"
                              : "Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}