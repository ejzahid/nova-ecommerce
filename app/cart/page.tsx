"use client";

import Link from "next/link";
import { useState } from "react";

type CartItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
};

const initialCart: CartItem[] = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    category: "Audio",
    price: 3490,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 2,
    name: "Smart Watch Series 9",
    category: "Smart Wearables",
    price: 5990,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",
  },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const delivery = subtotal >= 5000 ? 0 : 120;
  const total = subtotal + delivery;

  function increase(id: number) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decrease(id: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function remove(id: number) {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-3xl">
            🛒
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Your Selection
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Shopping Cart
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {cart.reduce(
              (total, item) => total + item.quantity,
              0
            )}{" "}
            items in your cart
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex gap-5">
                  {/* Image */}
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-36 sm:w-36">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          {item.category}
                        </p>

                        <h2 className="mt-1 text-lg font-bold">
                          {item.name}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="text-xs font-semibold text-slate-400 transition hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="mt-3 text-lg font-bold">
                      ৳{item.price.toLocaleString("en-BD")}
                    </p>

                    {/* Quantity */}
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex h-10 items-center rounded-full border border-slate-300">
                        <button
                          type="button"
                          onClick={() => decrease(item.id)}
                          className="flex h-full w-10 items-center justify-center text-lg text-slate-500 transition hover:text-slate-950"
                        >
                          −
                        </button>

                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increase(item.id)}
                          className="flex h-full w-10 items-center justify-center text-lg text-slate-500 transition hover:text-slate-950"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-bold">
                        ৳
                        {(item.price * item.quantity).toLocaleString(
                          "en-BD"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/shop"
              className="inline-flex pt-2 text-sm font-semibold underline underline-offset-4"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold">
                  ৳{subtotal.toLocaleString("en-BD")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Delivery
                </span>

                <span className="font-semibold">
                  {delivery === 0
                    ? "FREE"
                    : `৳${delivery.toLocaleString("en-BD")}`}
                </span>
              </div>

              {delivery === 0 && (
                <p className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                  🎉 Free delivery applied!
                </p>
              )}

              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-bold">
                    ৳{total.toLocaleString("en-BD")}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-7 flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Proceed to Checkout
            </Link>

            <div className="mt-5 space-y-2 text-center text-xs text-slate-400">
              <p>🔒 Secure checkout</p>
              <p>🚚 Delivery across Bangladesh</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

