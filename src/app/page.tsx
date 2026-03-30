import Image from "next/image";
import { WARDROBE_PRODUCTS } from "@/lib/catalog";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Wardrobe</p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">
            Curated pieces built for modern fashion drops.
          </h2>
          <p className="max-w-2xl text-zinc-300">
            Explore the LevelUp collection, monitor inventory status, and prepare each piece for
            virtual styling and campaign production.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WARDROBE_PRODUCTS.map((product, index) => (
          <article
            key={product.id}
            className="group rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="relative mb-4 flex h-72 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-zinc-200">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-contain p-2"
                priority={index === 0}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{product.category}</p>
              <h3 className="text-lg font-semibold text-zinc-50">{product.name}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-100">{product.price}</span>
                <span className="text-zinc-400">{product.stock}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
