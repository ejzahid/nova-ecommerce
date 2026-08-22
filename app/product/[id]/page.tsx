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
  category: string | Category | null;
  categoryId: number;
  price: number | string;
  oldPrice: number | string | null;
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

  const rawId = params?.id;

  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : undefined;

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const productId = id;

    async function loadProduct() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/products?id=${encodeURIComponent(productId)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load product");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.error || "Product not found"
          );
        }

        let foundProduct: Product | null = null;

        if (Array.isArray(result.products)) {
          foundProduct =
            result.products.find(
              (item: Product) =>
                String(item.id) === String(productId)
            ) || null;
        } else if (result.product) {
          foundProduct = result.product as Product;
        }

        setProduct(foundProduct);
      } catch (error) {
        console.error(
          "Product loading error:",
          error
        );

        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  function getCategoryName(
    currentProduct: Product
  ): string {
    if (!currentProduct.category) {
      return "General";
    }

    if (
      typeof currentProduct.category === "string"
    ) {
      return currentProduct.category;
    }

    return currentProduct.category.name;
  }

  function getPrice(
    currentProduct: Product
  ): number {
    return Number(currentProduct.price || 0);
  }

  function getOldPrice(
    currentProduct: Product
  ): number | null {
    if (
      currentProduct.oldPrice === null ||
      currentProduct.oldPrice === undefined
    ) {
      return null;
    }

    return Number(currentProduct.oldPrice);
  }

  function formatPrice(value: number): string {
    return `৳${value.toLocaleString("en-BD")}`;
  }

  function handleAddToCart() {
    if (!product) {
      return;
    }

    if (product.stock <= 0) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: getPrice(product),
      image: product.image || "",
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-400">
            PRODUCT NOT FOUND
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            This product doesn't exist.
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            The product may have been removed
            or is no longer available.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-flex rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const currentProduct = product;

  const alreadyInCart = cart.some(
    (item) =>
      item.id === currentProduct.id
  );

  const categoryName =
    getCategoryName(currentProduct);

  const price = getPrice(currentProduct);

  const oldPrice =
    getOldPrice(currentProduct);

  const image =
    currentProduct.image ||
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=90";

  const inStock =
    currentProduct.stock > 0;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            Digital Shop
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/shop"
              className="text-sm font-semibold text-slate-500 hover:text-slate-950"
            >
              Shop
            </Link>

            <Link
              href="/cart"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-slate-950"
            >
              Cart

              {cart.length > 0 && (
                <span className="ml-2">
                  (
                  {cart.reduce(
                    (total, item) =>
                      total + item.quantity,
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
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <Link
          href="/shop"
          className="text-sm font-medium text-slate-400 transition hover:text-slate-950"
        >
          ← Back to Shop
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-100">
            {currentProduct.badge && (
              <span className="absolute left-5 top-5 z-10 rounded-full bg-black px-4 py-2 text-xs font-bold tracking-wider text-white">
                {currentProduct.badge}
              </span>
            )}

            <div className="aspect-square">
              <img
                src={image}
                alt={currentProduct.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {categoryName}
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              {currentProduct.name}
            </h1>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(price)}
              </span>

              {oldPrice !== null && oldPrice > price && (
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>

            {currentProduct.description && (
              <p className="mt-7 max-w-xl text-base leading-7 text-slate-500">
                {currentProduct.description}
              </p>
            )}

            <div className="mt-8 flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  inStock
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />

              <span
                className={`text-sm font-semibold ${
                  inStock
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {inStock
                  ? `${currentProduct.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`rounded-full px-8 py-4 text-sm font-bold text-white transition ${
                  !inStock
                    ? "cursor-not-allowed bg-slate-300"
                    : added
                      ? "bg-green-600"
                      : "bg-black hover:bg-slate-800"
                }`}
              >
                {!inStock
                  ? "Out of Stock"
                  : added
                    ? "Added to Cart ✓"
                    : alreadyInCart
                      ? "Add Another"
                      : "Add to Cart"}
              </button>

              <Link
                href="/cart"
                className="rounded-full border border-slate-200 px-8 py-4 text-center text-sm font-bold transition hover:border-black"
              >
                View Cart
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-100 pt-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Product
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {currentProduct.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Category
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {categoryName}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Stock
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {currentProduct.stock}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {currentProduct.isActive
                    ? "Active"
                    : "Unavailable"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col justify-between gap-4 text-sm text-slate-400 md:flex-row">
            <p>
              © 2026 Digital Shop. All rights reserved.
            </p>

            <Link
              href="/shop"
              className="font-semibold text-slate-600 hover:text-black"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}