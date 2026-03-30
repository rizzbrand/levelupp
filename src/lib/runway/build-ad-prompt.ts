import type { WardrobeProduct } from "@/lib/catalog";

export function buildProductAdPrompt(product: WardrobeProduct, extraPrompt: string): string {
  const extra = extraPrompt.trim();
  const extraLine = extra ? ` Creative direction: ${extra}.` : "";

  return (
    `Professional fashion product advertisement for the LevelUp brand. ` +
    `Hero product: @Product — "${product.name}". ` +
    `Garment type: ${product.category}.${extraLine} ` +
    `Style: premium editorial campaign, studio-quality lighting, clean composition with space for headline and price, ` +
    `social feed and e-commerce PDP ready, photorealistic fabric texture, brand-safe.`
  );
}
