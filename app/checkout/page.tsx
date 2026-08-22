"use client";

import Link from "next/link";
import { useState } from "react";

export default function CheckoutPage() {
  const [payment, setPayment] = useState("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = 9480;
  const delivery = 120;
  const total = subtotal + delivery;

  function placeOrder() {
    setOrderPlaced(true);
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl">
            ✓
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
            Order Confirmed
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Thank you!
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Your order has been placed successfully. We will contact
            you shortly to confirm your order.
          </p>

          <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">
                Order Number
              </span>

              <span className="font-bold">
                Digital Shop-2026-001
              </span>
            </div>

            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="text-slate-500">
                Total
              </span>

              <span className="font-bold">
                ৳{total.toLocaleString("en-BD")}
              </span>
            </div>
          </div>

          <Link
            href="/shop"
            className="mt-7 inline-flex rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
          <Link
            href="/cart"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            ← Back to Cart
          </Link>

          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            Checkout
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Complete your information to place the order.
          </p>
        </div>
      </section>

      {/* Checkout */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  01
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Customer Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your delivery information.
                </p>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-950"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-950"
                  />
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  02
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Delivery Address
                </h2>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Address
                  </label>

                  <textarea
                    rows={3}
                    placeholder="House / Road / Area"
                    className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-950"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      City
                    </label>

                    <input
                      type="text"
                      placeholder="Dhaka"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-950"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Area / District
                    </label>

                    <input
                      type="text"
                      placeholder="Your area"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Order Note
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    rows={2}
                    placeholder="Any special instruction?"
                    className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition focus:border-slate-950"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  03
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Payment Method
                </h2>
              </div>

              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={() => setPayment("cod")}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    payment === "cod"
                      ? "border-slate-950 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        payment === "cod"
                          ? "border-slate-950"
                          : "border-slate-300"
                      }`}
                    >
                      {payment === "cod" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPayment("bkash")}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    payment === "bkash"
                      ? "border-slate-950 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        payment === "bkash"
                          ? "border-slate-950"
                          : "border-slate-300"
                      }`}
                    >
                      {payment === "bkash" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        bKash
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pay securely using bKash.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPayment("nagad")}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    payment === "nagad"
                      ? "border-slate-950 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        payment === "nagad"
                          ? "border-slate-950"
                          : "border-slate-300"
                      }`}
                    >
                      {payment === "nagad" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Nagad
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pay securely using Nagad.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold">
              Your Order
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold">
                    Wireless Headphones Pro
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Qty: 1
                  </p>
                </div>

                <span className="font-semibold">
                  ৳3,490
                </span>
              </div>

              <div className="flex justify-between gap-4 border-t border-slate-100 pt-4 text-sm">
                <div>
                  <p className="font-semibold">
                    Smart Watch Series 9
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Qty: 1
                  </p>
                </div>

                <span className="font-semibold">
                  ৳5,990
                </span>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold">
                  ৳{subtotal.toLocaleString("en-BD")}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">
                  Delivery
                </span>

                <span className="font-semibold">
                  ৳{delivery.toLocaleString("en-BD")}
                </span>
              </div>

              <div className="mt-5 flex justify-between border-t border-slate-200 pt-5">
                <span className="font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ৳{total.toLocaleString("en-BD")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              className="mt-7 w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Place Order
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              By placing your order, you agree to our terms and
              conditions.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
