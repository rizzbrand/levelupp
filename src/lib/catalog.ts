export type WardrobeProduct = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  image: string;
};

export const WARDROBE_PRODUCTS: WardrobeProduct[] = [
  {
    id: "afro-tee",
    name: "Afro Tee",
    category: "Outerwear",
    price: "GH₵600",
    stock: "Low stock",
    image: "/assets/tee1.PNG",
  },
  {
    id: "essentially-short-green",
    name: "Essentially short - Green",
    category: "Shorts",
    price: "GH₵500",
    stock: "In stock",
    image: "/assets/short1.PNG",
  },
  {
    id: "see-no-limits-shirt",
    name: "See No Limits shirt",
    category: "Shirts",
    price: "GH₵700",
    stock: "In stock",
    image: "/assets/tee2.PNG",
  },
  {
    id: "prime-leather-shorts",
    name: "Prime Leather Shorts",
    category: "Shorts",
    price: "GH₵700",
    stock: "Backorder",
    image: "/assets/short2.PNG",
  },
  {
    id: "stay-unbothered-shirt",
    name: "Stay Unbothered shirt",
    category: "Tops",
    price: "GH₵600",
    stock: "In stock",
    image: "/assets/tee3.PNG",
  },
  {
    id: "classic-shirt",
    name: "Classic Shirt",
    category: "Shirts",
    price: "GH₵600",
    stock: "Limited",
    image: "/assets/tee4.PNG",
  },
];

export function getProductById(id: string): WardrobeProduct | undefined {
  return WARDROBE_PRODUCTS.find((p) => p.id === id);
}

export function getWardrobeCategories(): string[] {
  return Array.from(new Set(WARDROBE_PRODUCTS.map((p) => p.category))).sort();
}
