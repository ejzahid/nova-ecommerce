"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../../cart/CartContext";

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
};

export default function ProductPage() {
  const params = useParams();
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const rawSlug = params.slug;

  const slug =
    typeof rawSlug === "string"
      ? rawSlug
      : Array.isArray(rawSlug)
      ? rawSlug[0]
      : undefined;

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const productSlug = slug;

    async function loadProduct() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/products?slug=${encodeURIComponent(productSlug)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load product");
        }

        const result = await response.json();

        if (!result.success) {
          setProduct(null);
          return;
        }

        let foundProduct: Product | null = null;

        if (Array.isArray(result.products)) {
          foundProduct =
            result.products.find(
              (item: Product) => item.slug === productSlug
            ) ?? null;
        } else if (result.product) {
          foundProduct = result.product;
        }

        setProduct(foundProduct);
      } catch (error) {
        console.error("Product loading error:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  function formatPrice(value: number | string | null) {
    if (value === null || value === undefined) {
      return "৳0";
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return "৳0";
    }

    return `৳${numberValue.toLocaleString("en-BD")}`;
  }

  function handleAddToCart() {
    if (!product) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.image || "",
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  const alreadyInCart =
    product !== null &&
    cart.some((item) => item.id === product.id);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f2] text-[#111111]">
        <header className="border-b border-black/10 bg-[#f5f5f2]">
          <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-8">
            <Link
              href="/"
              className="text-[28px] font-black tracking-[-0.08em]"
            >
              Digital Shop
              <span className="text-neutral-400">.</span>
            </Link>

            <Link
              href="/shop"
              className="text-sm font-semibold"
            >
              Back to Shop
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-[1440px] px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="aspect-square animate-pulse rounded-[28px] bg-white" />

            <div className="flex flex-col justify-center">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />

              <div className="mt-5 h-14 w-3/4 animate-pulse rounded bg-neutral-200" />

              <div className="mt-6 h-10 w-40 animate-pulse rounded bg-neutral-200" />

              <div className="mt-7 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-200" />
              </div>

              <div className="mt-8 h-14 w-full animate-pulse rounded-full bg-neutral-200" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f2] px-6 text-[#111111]">
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-neutral-400">
            PRODUCT NOT FOUND
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            This product doesn't exist.
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            The product may have been removed or the link may be incorrect.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

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
            Digital Shop
            <span className="text-neutral-400">.</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="hidden text-sm font-medium hover:opacity-50 sm:block"
            >
              Shop
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold transition hover:bg-black hover:text-white"
            >
              Cart

              {cart.length > 0 && (
                <span className="ml-2">
                  (
                  {cart.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}
                  )
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Product */}
      <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-8 md:py-16">
        <Link
          href="/shop"
          className="text-sm font-medium text-neutral-400 transition hover:text-black"
        >
          ← Back to Shop
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Product Image */}
          <div className="overflow-hidden rounded-[28px] bg-white">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-[#f0f0ec]">
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                  <div className="text-7xl font-black tracking-[-0.1em]">
                    D
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            {product.category && (
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-black"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">
              {product.name}
            </h1>

            {product.badge && (
              <div className="mt-5">
                <span className="inline-flex rounded-full bg-black px-4 py-2 text-[10px] font-bold tracking-[0.15em] text-white">
                  {product.badge}
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-3xl font-black">
                {formatPrice(product.price)}
              </span>

              {product.oldPrice !== null && (
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-7 max-w-xl text-base leading-7 text-neutral-600">
                {product.description}
              </p>
            )}

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-5">
                <p className="text-sm font-bold">
                  Premium Quality
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Carefully selected
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5">
                <p className="text-sm font-bold">
                  Fast Delivery
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Across Bangladesh
                </p>
              </div>
            </div>

            {/* Stock */}
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-black/10 bg-white px-5 py-4">
              <span className="text-sm text-neutral-500">
                Availability
              </span>

              {product.stock > 0 ? (
                <span className="text-sm font-bold text-emerald-600">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-sm font-bold text-red-500">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`mt-6 w-full rounded-full px-7 py-4 text-sm font-bold text-white transition ${
                product.stock <= 0
                  ? "cursor-not-allowed bg-neutral-300"
                  : added
                  ? "bg-emerald-600"
                  : "bg-black hover:bg-neutral-800"
              }`}
            >
              {product.stock <= 0
                ? "Out of Stock"
                : added
                ? "✓ Added to Cart"
                : alreadyInCart
                ? "Add Another to Cart"
                : "Add to Cart"}
            </button>

            {added && (
              <Link
                href="/cart"
                className="mt-3 text-center text-sm font-semibold underline underline-offset-4"
              >
                View Cart →
              </Link>
            )}

            {/* Product Information */}
            <div className="mt-8 border-t border-black/10 pt-5">
              <div className="flex justify-between py-3 text-sm">
                <span className="text-neutral-500">
                  Delivery
                </span>

                <span className="font-semibold">
                  All over Bangladesh
                </span>
              </div>

              <div className="flex justify-between border-t border-black/5 py-3 text-sm">
                <span className="text-neutral-500">
                  Payment
                </span>

                <span className="font-semibold">
                  Cash / bKash / Nagad
                </span>
              </div>

              {product.sku && (
                <div className="flex justify-between border-t border-black/5 py-3 text-sm">
                  <span className="text-neutral-500">
                    SKU
                  </span>

                  <span className="font-semibold">
                    {product.sku}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-black/5 py-3 text-sm">
                <span className="text-neutral-500">
                  Availability
                </span>

                <span
                  className={
                    product.stock > 0
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-red-500"
                  }
                >
                  {product.stock > 0
                    ? "In Stock"
                    : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-8 md:pb-24">
        <div className="overflow-hidden rounded-[28px] bg-black px-7 py-12 text-white md:px-16 md:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.3em] text-white/40">
              DIGITAL SHOP
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">
              Find more things
              <br />
              worth buying.
            </h2>

            <Link
              href="/shop"
              className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}