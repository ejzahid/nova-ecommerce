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
  price: number;
  oldPrice: number | null;
  stock: number;
  image: string | null;
  badge: string | null;
  isFeatured: boolean;
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [productsLoading, setProductsLoading] =
    useState(true);

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

        if (result.success && Array.isArray(result.categories)) {
          setCategories(result.categories);
        }
      } catch (error) {
        console.error("Category loading error:", error);
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

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

        if (result.success && Array.isArray(result.products)) {
          setProducts(result.products);
        }
      } catch (error) {
        console.error("Product loading error:", error);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#111111]">
      {/* Announcement */}
      <div className="bg-black px-4 py-2 text-center text-[11px] font-medium tracking-[0.18em] text-white">
        FREE DELIVERY ON ORDERS OVER ৳2,000
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f5f2]/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-8">
          <Link
            href="/"
            className="text-[28px] font-black tracking-[-0.08em]"
          >
            Digital Shop<span className="text-neutral-400">.</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium hover:opacity-50"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-sm font-medium hover:opacity-50"
            >
              Shop
            </Link>

            <Link
              href="/new-arrivals"
              className="text-sm font-medium hover:opacity-50"
            >
              New Arrivals
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black hover:text-white"
            >
              ⌕
            </button>

            <button
              type="button"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black hover:text-white sm:flex"
            >
              ◯
            </button>

            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black hover:text-white"
            >
              ♡
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] text-white">
                0
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1440px] px-5 pt-6 md:px-8 md:pt-8">
        <div className="relative min-h-[560px] overflow-hidden rounded-[28px] bg-[#deded8]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.9),transparent_38%),linear-gradient(135deg,#d7d7d1,#ededeb)]" />

          <div className="absolute -right-20 top-16 h-[420px] w-[420px] rounded-full border border-black/10 md:right-20 md:h-[500px] md:w-[500px]" />

          <div className="relative flex min-h-[560px] items-center">
            <div className="max-w-2xl px-7 py-16 md:px-16">
              <p className="mb-5 text-xs font-bold tracking-[0.3em] text-neutral-500">
                THE NEW STANDARD
              </p>

              <h1 className="text-[54px] font-black leading-[0.9] tracking-[-0.07em] md:text-[92px]">
                Better
                <br />
                things.
                <br />
                <span className="text-neutral-400">
                  Simply.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-base leading-7 text-neutral-600 md:text-lg">
                Thoughtfully selected products for modern
                Bangladesh. Simple design, useful technology,
                and things you will actually love using.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800"
                >
                  Shop Collection →
                </Link>

                <a
                  href="#categories"
                  className="rounded-full border border-black/20 bg-white/60 px-7 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white"
                >
                  Explore Categories
                </a>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 hidden h-[430px] w-[430px] items-center justify-center md:flex">
              <div className="relative flex h-[360px] w-[360px] items-center justify-center rounded-full bg-black">
                <div className="absolute h-[250px] w-[250px] rounded-full border border-white/20" />

                <div className="relative text-center text-white">
                  <div className="text-8xl font-black tracking-[-0.1em]">
                    D
                  </div>

                  <p className="mt-2 text-[10px] font-medium tracking-[0.4em] text-white/50">
                    DIGITAL SHOP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="mx-auto max-w-[1440px] px-5 py-8 md:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-black/10 bg-white md:grid-cols-4">
          {[
            ["01", "Authentic Products", "100% genuine products"],
            ["02", "Fast Delivery", "Across Bangladesh"],
            ["03", "Easy Returns", "Simple return policy"],
            ["04", "Secure Payment", "Safe & reliable checkout"],
          ].map(([number, title, subtitle]) => (
            <div
              key={number}
              className="border-b border-black/10 p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-400">
                {number}
              </p>

              <p className="mt-3 font-semibold">
                {title}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="mx-auto max-w-[1440px] px-5 py-14 md:px-8 md:py-20"
      >
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-neutral-400">
              DISCOVER
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] md:text-5xl">
              Shop by category
            </h2>
          </div>
        </div>

        {categoriesLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="min-h-[270px] animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-10 text-center">
            <p className="text-sm text-neutral-500">
              No categories available yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative min-h-[270px] overflow-hidden rounded-2xl bg-white p-7 transition hover:-translate-y-1"
              >
                <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-[#f0f0eb] transition group-hover:scale-125" />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-xl text-white">
                    {category.icon || "✦"}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                      {String(index + 1).padStart(2, "0")}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold tracking-tight">
                      {category.name}
                    </h3>

                    {category.subtitle && (
                      <p className="mt-2 max-w-[220px] text-sm leading-6 text-neutral-500">
                        {category.subtitle}
                      </p>
                    )}

                    <span className="mt-5 inline-block text-sm font-semibold">
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-8 md:py-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-neutral-400">
                CURATED FOR YOU
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] md:text-5xl">
                Trending now
              </h2>
            </div>

            <Link
              href="/shop"
              className="hidden text-sm font-semibold underline underline-offset-4 md:block"
            >
              Shop all →
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="aspect-square animate-pulse rounded-2xl bg-[#f0f0ec]"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-[#f5f5f2] p-12 text-center">
              <p className="text-sm text-neutral-500">
                No products available yet.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
              >
                Visit Shop →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f0f0ec]">
                    {product.badge && (
                      <span className="absolute left-4 top-4 z-10 rounded-full bg-black px-3 py-1.5 text-[9px] font-bold tracking-wider text-white">
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
                        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition duration-500 group-hover:scale-110">
                          <div className="text-5xl font-black tracking-[-0.1em] text-neutral-800">
                            D
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <p className="text-xs text-neutral-400">
                      {product.category?.name || "General"}
                    </p>

                    <h3 className="mt-1 font-semibold">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold">
                        ৳{product.price.toLocaleString("en-BD")}
                      </span>

                      {product.oldPrice !== null && (
                        <span className="text-sm text-neutral-400 line-through">
                          ৳{product.oldPrice.toLocaleString("en-BD")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Editorial banner */}
      <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-8 md:py-20">
        <div className="relative overflow-hidden rounded-[28px] bg-black px-7 py-16 text-white md:px-16 md:py-24">
          <div className="absolute right-[-100px] top-[-120px] h-[400px] w-[400px] rounded-full border border-white/10" />

          <div className="absolute bottom-[-180px] right-[180px] h-[400px] w-[400px] rounded-full border border-white/10" />

          <div className="relative max-w-2xl">
            <p className="text-xs font-bold tracking-[0.3em] text-white/40">
              WHY DIGITAL SHOP
            </p>

            <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
              Less noise.
              <br />
              More good stuff.
            </h2>

            <p className="mt-7 max-w-lg text-sm leading-7 text-white/60 md:text-base">
              We believe online shopping should feel simple.
              No endless scrolling. No confusing choices.
              Just products worth bringing home.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-neutral-200"
            >
              Discover Digital Shop
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-black/10">
        <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-neutral-400">
              STAY IN THE LOOP
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">
              Good things, occasionally.
            </h2>

            <p className="mt-4 text-sm leading-6 text-neutral-500">
              New products, exclusive offers and useful things.
              No spam. Promise.
            </p>

            <div className="mx-auto mt-7 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-5 py-3.5 text-sm outline-none focus:border-black"
              />

              <button
                type="button"
                className="rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="text-3xl font-black tracking-[-0.08em]">
                Digital Shop<span className="text-neutral-500">.</span>
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-white/50">
                Modern products for modern living.
                Carefully selected and delivered across Bangladesh.
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold tracking-[0.2em] text-white/40">
                SHOP
              </p>

              <div className="space-y-3 text-sm text-white/70">
                <Link
                  href="/shop"
                  className="block hover:text-white"
                >
                  All Products
                </Link>

                <a
                  href="#categories"
                  className="block hover:text-white"
                >
                  Categories
                </a>

                <Link
                  href="/new-arrivals"
                  className="block hover:text-white"
                >
                  New Arrivals
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-bold tracking-[0.2em] text-white/40">
                HELP
              </p>

              <div className="space-y-3 text-sm text-white/70">
                <Link
                  href="/contact"
                  className="block hover:text-white"
                >
                  Contact
                </Link>

                <Link
                  href="/shipping"
                  className="block hover:text-white"
                >
                  Shipping
                </Link>

                <Link
                  href="/returns"
                  className="block hover:text-white"
                >
                  Returns
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/30 md:flex-row">
            <p>© 2026 Digital Shop. All rights reserved.</p>

            <p>Digitalshop.com.bd</p>
          </div>
        </div>
      </footer>
    </main>
  );
}