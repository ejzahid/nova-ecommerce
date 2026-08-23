"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../cart/CartContext";

type Category = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  parentId: number | null;
  children?: Category[];
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

function ShopPageContent() {
  const { addToCart, cart } = useCart();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState<number | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);

  /*
   * Read search/category from URL.
   *
   * Examples:
   * /shop?search=iphone
   * /shop?category=smartphone
   */
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory =
      searchParams.get("category") || "all";

    setSearch(urlSearch);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  /*
   * Load products
   */
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const result = await response.json();

        if (
          result.success &&
          Array.isArray(result.products)
        ) {
          setProducts(result.products);
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

  /*
   * Load categories
   */
  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoryLoading(true);

        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const result = await response.json();

        if (
          result.success &&
          Array.isArray(result.categories)
        ) {
          setCategories(result.categories);
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

  /*
   * Parent categories
   */
  const parentCategories = useMemo(() => {
    return categories
      .filter(
        (category) =>
          category.parentId === null &&
          category.isActive
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [categories]);

  /*
   * Find selected category
   */
  const selectedCategoryObject = useMemo(() => {
    if (selectedCategory === "all") {
      return null;
    }

    return (
      categories.find(
        (category) =>
          category.slug === selectedCategory
      ) || null
    );
  }, [categories, selectedCategory]);

  /*
   * Product filtering
   */
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const categorySlug =
        product.category?.slug || "";

      const categoryName =
        product.category?.name || "";

      let matchesCategory = true;

      if (selectedCategory !== "all") {
        matchesCategory =
          categorySlug === selectedCategory;

        if (
          !matchesCategory &&
          selectedCategoryObject?.children
        ) {
          matchesCategory =
            selectedCategoryObject.children.some(
              (child) =>
                child.slug === categorySlug ||
                child.children?.some(
                  (grandChild) =>
                    grandChild.slug === categorySlug
                )
            );
        }
      }

      const matchesSearch =
        !query ||
        product.name
          .toLowerCase()
          .includes(query) ||
        categoryName
          .toLowerCase()
          .includes(query) ||
        (product.description || "")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [
    products,
    selectedCategory,
    selectedCategoryObject,
    search,
  ]);

  function handleCategoryChange(slug: string) {
    setSelectedCategory(slug);
    setCategoryOpen(false);

    const url =
      slug === "all"
        ? "/shop"
        : `/shop?category=${encodeURIComponent(slug)}`;

    window.history.pushState({}, "", url);
  }

  function handleSearch(value: string) {
    setSearch(value);

    const cleanValue = value.trim();

    if (cleanValue) {
      window.history.replaceState(
        {},
        "",
        `/shop?search=${encodeURIComponent(
          cleanValue
        )}`
      );
    } else {
      window.history.replaceState({}, "", "/shop");
    }
  }

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
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f5f2]/95 backdrop-blur">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          {/* TOP ROW */}
          <div className="flex h-[76px] items-center justify-between">
            <Link
              href="/"
              className="text-[28px] font-black tracking-[-0.08em]"
            >
              Digital Shop
              <span className="text-neutral-400">.</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* SEARCH */}
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      handleSearch(event.target.value)
                    }
                    placeholder="Search products..."
                    className="w-[220px] rounded-full border border-black/10 bg-white px-5 py-2.5 pr-10 text-sm outline-none transition focus:border-black"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                    ⌕
                  </span>
                </div>
              </div>

              {/* MOBILE SEARCH BUTTON */}
              <button
                type="button"
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black hover:text-white md:hidden"
                onClick={() => {
                  const input =
                    document.getElementById(
                      "mobile-shop-search"
                    ) as HTMLInputElement | null;

                  input?.focus();
                }}
              >
                ⌕
              </button>

              {/* ACCOUNT */}
              <button
                type="button"
                aria-label="Account"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black hover:text-white sm:flex"
              >
                ◯
              </button>

              {/* CART */}
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black hover:text-white"
              >
                ♡

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* NAVIGATION ROW */}
          <div className="relative flex min-h-[48px] items-center justify-between border-t border-black/5">
            <div className="flex items-center gap-7">
              {/* CATEGORY */}
              <button
                type="button"
                onClick={() =>
                  setCategoryOpen((value) => !value)
                }
                className="flex items-center gap-2 py-3 text-sm font-semibold"
              >
                Category

                <span
                  className={`text-xs transition ${
                    categoryOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              <Link
                href="/"
                className="py-3 text-sm font-medium hover:opacity-50"
              >
                Home
              </Link>

              <Link
                href="/shop"
                className="py-3 text-sm font-medium hover:opacity-50"
              >
                Shop
              </Link>

              <Link
                href="/new-arrivals"
                className="hidden py-3 text-sm font-medium hover:opacity-50 sm:block"
              >
                New Arrivals
              </Link>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/flash-deals"
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Flash Deals
              </Link>

              <Link
                href="/shop"
                className="text-sm font-medium hover:opacity-50"
              >
                All Products
              </Link>

              <Link
                href="/track-order"
                className="text-sm font-medium hover:opacity-50"
              >
                Track Order
              </Link>
            </div>

            {/* CATEGORY MEGA MENU */}
            {categoryOpen && (
              <div className="absolute left-0 top-full z-50 w-full border-x border-b border-black/10 bg-white shadow-2xl">
                <div className="max-h-[70vh] overflow-y-auto p-6 md:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                        Browse
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        Categories
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCategoryChange("all")
                      }
                      className="text-sm font-semibold underline underline-offset-4"
                    >
                      All Products
                    </button>
                  </div>

                  {categoryLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="h-32 animate-pulse rounded-2xl bg-neutral-100"
                        />
                      ))}
                    </div>
                  ) : parentCategories.length === 0 ? (
                    <div className="rounded-2xl bg-neutral-50 p-8 text-center">
                      <p className="text-sm text-neutral-500">
                        No categories available.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {parentCategories.map(
                        (parent) => (
                          <div
                            key={parent.id}
                            className="min-w-0"
                          >
                            {/* PARENT */}
                            <button
                              type="button"
                              onClick={() =>
                                handleCategoryChange(
                                  parent.slug
                                )
                              }
                              className="group flex w-full items-center gap-3 text-left"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm text-white">
                                {parent.icon || "✦"}
                              </span>

                              <span className="text-base font-bold group-hover:underline">
                                {parent.name}
                              </span>
                            </button>

                            {/* SUB CATEGORY */}
                            {parent.children &&
                              parent.children.length >
                                0 && (
                                <div className="mt-4 space-y-4 pl-[52px]">
                                  {[
                                    ...parent.children,
                                  ]
                                    .sort((a, b) =>
                                      a.name.localeCompare(
                                        b.name
                                      )
                                    )
                                    .map((child) => (
                                      <div
                                        key={child.id}
                                      >
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleCategoryChange(
                                              child.slug
                                            )
                                          }
                                          className="text-sm font-semibold text-neutral-700 hover:text-black hover:underline"
                                        >
                                          {child.name}
                                        </button>

                                        {/* CHILD CATEGORY */}
                                        {child.children &&
                                          child.children
                                            .length >
                                            0 && (
                                            <div className="mt-2 space-y-1.5 border-l border-black/10 pl-3">
                                              {[
                                                ...child.children,
                                              ]
                                                .sort(
                                                  (
                                                    a,
                                                    b
                                                  ) =>
                                                    a.name.localeCompare(
                                                      b.name
                                                    )
                                                )
                                                .map(
                                                  (
                                                    grandChild
                                                  ) => (
                                                    <button
                                                      key={
                                                        grandChild.id
                                                      }
                                                      type="button"
                                                      onClick={() =>
                                                        handleCategoryChange(
                                                          grandChild.slug
                                                        )
                                                      }
                                                      className="block text-left text-xs text-neutral-500 hover:text-black hover:underline"
                                                    >
                                                      {
                                                        grandChild.name
                                                      }
                                                    </button>
                                                  )
                                                )}
                                            </div>
                                          )}
                                      </div>
                                    ))}
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH */}
      <section className="border-b border-black/10 bg-white px-5 py-4 md:hidden">
        <input
          id="mobile-shop-search"
          type="search"
          value={search}
          onChange={(event) =>
            handleSearch(event.target.value)
          }
          placeholder="Search products..."
          className="w-full rounded-full border border-black/10 bg-[#f5f5f2] px-5 py-3 text-sm outline-none focus:border-black"
        />
      </section>

      {/* HERO */}
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

      {/* FILTER */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              handleCategoryChange("all")
            }
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              selectedCategory === "all"
                ? "bg-neutral-950 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-950"
            }`}
          >
            All Products
          </button>

          {!categoryLoading &&
            parentCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  handleCategoryChange(
                    category.slug
                  )
                }
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selectedCategory ===
                  category.slug
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-950"
                }`}
              >
                {category.name}
              </button>
            ))}
        </div>
      </section>

      {/* PRODUCTS */}
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
              Try another search or choose a
              different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                handleCategoryChange("all");
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

/*
 * IMPORTANT:
 * useSearchParams() is inside ShopPageContent,
 * and ShopPageContent is wrapped with Suspense.
 *
 * This fixes the Next.js production/Vercel build error:
 *
 * "useSearchParams() should be wrapped in a suspense boundary"
 */
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f5f2] text-neutral-950">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="h-10 w-48 animate-pulse rounded bg-neutral-200" />
            <div className="mt-8 h-16 w-3/4 animate-pulse rounded bg-neutral-200" />

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          </div>
        </main>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}