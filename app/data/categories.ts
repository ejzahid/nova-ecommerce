export type Category = {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  icon: string;
  isActive: boolean;
};

export const categories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    subtitle: "Smart tech for everyday life",
    icon: "⌁",
    isActive: true,
  },
  {
    id: 2,
    name: "Gadgets",
    slug: "gadgets",
    subtitle: "Small things. Big difference.",
    icon: "✦",
    isActive: true,
  },
  {
    id: 3,
    name: "Home & Living",
    slug: "home-living",
    subtitle: "Upgrade your everyday space",
    icon: "⌂",
    isActive: true,
  },
  {
    id: 4,
    name: "Lifestyle",
    slug: "lifestyle",
    subtitle: "Made for your way of life",
    icon: "◌",
    isActive: true,
  },
];