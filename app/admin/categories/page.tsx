"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number | string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  category?: {
    name: string;
  } | null;
};

type Category = {
  id: number;
  name: string;
  isActive: boolean;
};

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch("/api/products", {
              cache: "no-store",
            }),
            fetch("/api/categories", {
              cache: "no-store",
            }),
          ]);

        const productsResult =
          await productsResponse.json();

        const categoriesResult =
          await categoriesResponse.json();

        if (
          productsResponse.ok &&
          productsResult.success
        ) {
          setProducts(
            Array.isArray(productsResult.products)
              ? productsResult.products
              : []
          );
        }

        if (
          categoriesResponse.ok &&
          categoriesResult.success
        ) {
          setCategories(
            Array.isArray(categoriesResult.categories)
              ? categoriesResult.categories
              : []
          );
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const activeProducts = products.filter(
    (product) => product.isActive
  ).length;

  const outOfStock = products.filter(
    (product) => Number(product.stock) <= 0
  ).length;

  const featuredProducts = products.filter(
    (product) => product.isFeatured
  ).length;

  const activeCategories = categories.filter(
    (category) => category.isActive
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Digital Shop
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight">
              Admin Dashboard
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-slate-950"
          >
            View Store
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Products
            </p>

            <p className="mt-3 text-4xl font-black">
              {loading ? "—" : products.length}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-400">
              {activeProducts} active products
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Categories
            </p>

            <p className="mt-3 text-4xl font-black">
              {loading ? "—" : categories.length}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-400">
              {activeCategories} active categories
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Out of Stock
            </p>

            <p className="mt-3 text-4xl font-black text-red-600">
              {loading ? "—" : outOfStock}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-400">
              Products needing restock
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Featured
            </p>

            <p className="mt-3 text-4xl font-black text-amber-500">
              {loading ? "—" : featuredProducts}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-400">
              Featured products
            </p>
          </div>
        </div>

        {/* Management */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Product Management
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Manage Products
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add, edit, delete and manage your
                  store products.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                📦
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/products"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                View Products
              </Link>

              <Link
                href="/admin/products/new"
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:border-slate-950"
              >
                + Add Product
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Category Management
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Manage Categories
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Organize your products with categories
                  and manage their status.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                🗂️
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/categories"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                View Categories
              </Link>

              <Link
                href="/admin/categories/new"
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:border-slate-950"
              >
                + Add Category
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Overview
            </p>

            <h2 className="mt-1 text-xl font-black">
              Store Status
            </h2>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Products
              </p>

              <p className="mt-2 text-lg font-black">
                {loading
                  ? "Loading..."
                  : `${products.length} total`}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active
              </p>

              <p className="mt-2 text-lg font-black text-emerald-600">
                {loading
                  ? "Loading..."
                  : `${activeProducts} products`}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Stock Alert
              </p>

              <p className="mt-2 text-lg font-black text-red-600">
                {loading
                  ? "Loading..."
                  : `${outOfStock} out of stock`}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Categories
              </p>

              <p className="mt-2 text-lg font-black">
                {loading
                  ? "Loading..."
                  : `${categories.length} total`}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-black">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/products/new"
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-950 hover:shadow-sm"
            >
              <p className="text-2xl">➕</p>

              <p className="mt-3 font-black">
                Add Product
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Create a new product
              </p>
            </Link>

            <Link
              href="/admin/categories/new"
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-950 hover:shadow-sm"
            >
              <p className="text-2xl">🗂️</p>

              <p className="mt-3 font-black">
                Add Category
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Create a new category
              </p>
            </Link>

            <Link
              href="/admin/products"
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-950 hover:shadow-sm"
            >
              <p className="text-2xl">📦</p>

              <p className="mt-3 font-black">
                Products
              </p>

              <p className="mt-1 text-sm text-slate-400">
                View all products
              </p>
            </Link>

            <Link
              href="/admin/categories"
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-950 hover:shadow-sm"
            >
              <p className="text-2xl">📋</p>

              <p className="mt-3 font-black">
                Categories
              </p>

              <p className="mt-1 text-sm text-slate-400">
                View all categories
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}