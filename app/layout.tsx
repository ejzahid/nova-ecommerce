import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./cart/CartContext";

export const metadata: Metadata = {
  title: {
    default: "Digital Shop | Smart Products for Modern Living",
    template: "%s | Digital Shop",
  },
  description:
    "Digital Shop — modern electronics, gadgets, home essentials and lifestyle products delivered across Bangladesh.",
  keywords: [
    "Digital Shop",
    "Digitalshop.com.bd",
    "online shopping Bangladesh",
    "electronics Bangladesh",
    "gadgets Bangladesh",
    "smart products",
  ],
  authors: [{ name: "Digital Shop" }],
  creator: "Digital Shop",
  publisher: "Digital Shop",
  metadataBase: new URL("https://digitalshop.com.bd"),
  openGraph: {
    title: "Digital Shop",
    description:
      "Modern products for modern living. Shop electronics, gadgets, home essentials and lifestyle products in Bangladesh.",
    url: "https://digitalshop.com.bd",
    siteName: "Digital Shop",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Shop",
    description:
      "Modern products for modern living in Bangladesh.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}