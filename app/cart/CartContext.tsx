"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
};

type CartProductInput = {
  id: number;
  name: string;
  slug: string;
  category?: string | { id?: number; name?: string; slug?: string } | null;
  price: number | string;
  image?: string | null;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: CartProductInput) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

function normalizeCartItem(product: CartProductInput): Omit<CartItem, "quantity"> {
  let category = "General";

  if (typeof product.category === "string") {
    category = product.category;
  } else if (
    product.category &&
    typeof product.category === "object" &&
    typeof product.category.name === "string"
  ) {
    category = product.category.name;
  }

  return {
    id: Number(product.id),
    name: product.name,
    slug: product.slug,
    category,
    price:
      typeof product.price === "string"
        ? Number(product.price)
        : product.price,
    image: product.image || "",
  };
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("nova-cart");

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item) =>
            normalizeCartItem(item)
          );

          setCart(
            normalized.map((item) => ({
              ...item,
              quantity: Number(
                parsed.find(
                  (saved: CartItem) => saved.id === item.id
                )?.quantity || 1
              ),
            }))
          );
        }
      } catch {
        localStorage.removeItem("nova-cart");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nova-cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product: CartProductInput) {
    const normalizedProduct = normalizeCartItem(product);

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === normalizedProduct.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === normalizedProduct.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...normalizedProduct,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(id: number) {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function increaseQuantity(id: number) {
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

  function decreaseQuantity(id: number) {
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

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}