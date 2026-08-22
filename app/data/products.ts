export type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  isActive: boolean;
  isFeatured: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Smart Wireless Headphones",
    slug: "smart-wireless-headphones",
    category: "Audio",
    categorySlug: "electronics",
    price: 3490,
    oldPrice: 4200,
    badge: "BESTSELLER",
    isActive: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Minimal Smart Watch",
    slug: "minimal-smart-watch",
    category: "Wearables",
    categorySlug: "electronics",
    price: 2990,
    oldPrice: 3590,
    badge: "NEW",
    isActive: true,
    isFeatured: true,
  },
  {
    id: 3,
    name: "Portable Bluetooth Speaker",
    slug: "portable-bluetooth-speaker",
    category: "Audio",
    categorySlug: "electronics",
    price: 2490,
    oldPrice: 2990,
    badge: "HOT",
    isActive: true,
    isFeatured: true,
  },
  {
    id: 4,
    name: "Wireless Mechanical Keyboard",
    slug: "wireless-mechanical-keyboard",
    category: "Accessories",
    categorySlug: "gadgets",
    price: 4290,
    oldPrice: 4990,
    badge: "NEW",
    isActive: true,
    isFeatured: true,
  },
];