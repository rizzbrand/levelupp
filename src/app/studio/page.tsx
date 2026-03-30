/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getWardrobeCategories, WARDROBE_PRODUCTS, type WardrobeProduct } from "@/lib/catalog";
import type { StudioGenerationMode, StudioJob } from "@/lib/runway/types";

export default function StudioPage() {
  const [mode, setMode] = useState<StudioGenerationMode>("image");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedProductId, setSelectedProductId] = useState<string>(WARDROBE_PRODUCTS[0]?.id ?? "");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [jobs, setJobs] = useState<StudioJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);

  const categories = useMemo(() => ["All", ...getWardrobeCategories()], []);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === "All") return WARDROBE_PRODUCTS;
    return WARDROBE_PRODUCTS.filter((p) => p.category === categoryFilter);
  }, [categoryFilter]);

  const selectedProduct: WardrobeProduct | undefined = useMemo(
    () => WARDROBE_PRODUCTS.find((p) => p.id === selectedProductId),
    [selectedProductId],
  );

  const activeJob = useMemo(
    () => jobs.find((job) => job.id === activeJobId) ?? null,
    [jobs, activeJobId],
  );

  const previewSrc =
    activeJob?.outputUrl || activeJob?.previewUrl || selectedProduct?.image || "";

  async function createGeneration() {
    if (!selectedProductId) {
      setError("Select a product from the wardrobe.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/studio/runway/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          mode,
          extraPrompt: extraPrompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Failed to create generation.");
      }

      const payload = (await response.json()) as { job: StudioJob; mockMode?: boolean };
      setJobs((prev) => [payload.job, ...prev]);
      setActiveJobId(payload.job.id);
      setMockMode(Boolean(payload.mockMode));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!activeJob) return;
    if (activeJob.status === "succeeded" || activeJob.status === "failed") return;

    const interval = setInterval(async () => {
      const response = await fetch(`/api/studio/runway/jobs/${activeJob.id}`);
      if (!response.ok) return;

      const payload = (await response.json()) as { job: StudioJob; mockMode?: boolean };
      setJobs((prev) => prev.map((job) => (job.id === payload.job.id ? payload.job : job)));
      setMockMode(Boolean(payload.mockMode));
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob]);

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900/75 p-4">
        <div className="inline-flex rounded-full border border-white/15 bg-zinc-950 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("image")}
            className={`rounded-full px-3 py-1 font-medium ${
              mode === "image" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
            }`}
          >
            Image ad
          </button>
          <button
            type="button"
            onClick={() => setMode("video")}
            className={`rounded-full px-3 py-1 font-medium ${
              mode === "video" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
            }`}
          >
            Video ad
          </button>
        </div>

        <p className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
          {mockMode
            ? "Runway API key not set — mock mode. Add RUNWAY_API_KEY or RUNWAYML_API_SECRET (e.g. in src/.env or .env.local)."
            : "Runway API connected — product ads use your catalog image as @Product."}
        </p>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.14em] text-zinc-400">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              const next = WARDROBE_PRODUCTS.filter(
                (p) => e.target.value === "All" || p.category === e.target.value,
              );
              if (next.length && !next.some((p) => p.id === selectedProductId)) {
                setSelectedProductId(next[0].id);
              }
            }}
            className="w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.14em] text-zinc-400">Product</label>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/80 p-2">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProductId(product.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition ${
                  selectedProductId === product.id
                    ? "bg-violet-600/30 ring-1 ring-violet-400/50"
                    : "hover:bg-zinc-800"
                }`}
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    className="object-contain p-0.5"
                    sizes="48px"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-zinc-100">{product.name}</span>
                  <span className="text-xs text-zinc-500">{product.category}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-white/10 bg-zinc-950/80 p-3">
          <label className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Creative direction (optional)
          </label>
          <textarea
            value={extraPrompt}
            onChange={(e) => setExtraPrompt(e.target.value)}
            className="min-h-20 w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400"
            placeholder="e.g. sunset streetwear vibe, bold headline space, neon accents…"
          />
        </div>

        <button
          type="button"
          onClick={createGeneration}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-violet-900"
        >
          {isSubmitting
            ? "Submitting…"
            : mode === "video"
              ? "Generate video ad (Runway)"
              : "Generate image ad (Runway)"}
        </button>
        {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      </aside>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Preview</p>
            <p className="text-sm text-zinc-300">
              {selectedProduct ? (
                <>
                  <span className="font-medium text-zinc-100">{selectedProduct.name}</span>
                  <span className="text-zinc-500"> · {selectedProduct.price}</span>
                </>
              ) : (
                "Select a product"
              )}
            </p>
          </div>
          {activeJob ? (
            <span className="rounded-full border border-white/15 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
              {activeJob.status}
              {activeJob.productName ? ` · ${activeJob.productName}` : ""}
            </span>
          ) : null}
        </div>

        <article className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
          {activeJob?.mode === "video" && activeJob.outputUrl ? (
            <video
              src={activeJob.outputUrl}
              controls
              playsInline
              className="h-[400px] w-full bg-black object-contain"
            />
          ) : previewSrc ? (
            <img
              src={previewSrc}
              alt={selectedProduct?.name ?? "Preview"}
              className="h-[400px] w-full bg-white object-contain"
            />
          ) : (
            <div className="flex h-[400px] items-center justify-center text-sm text-zinc-500">
              Choose a product to preview its cutout, then generate an ad.
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/15 via-transparent to-transparent" />
        </article>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => setActiveJobId(job.id)}
              className={`rounded-xl border p-4 text-left transition ${
                activeJobId === job.id
                  ? "border-violet-400/60 bg-violet-950/30"
                  : "border-white/10 bg-zinc-950/80 hover:border-violet-400/40"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="truncate font-medium text-zinc-100">
                  {job.productName ?? (job.mode === "video" ? "Video ad" : "Image ad")}
                </h3>
                <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-300">
                  {job.status}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-zinc-500">{job.prompt}</p>
              <p className="mt-2 text-xs text-zinc-600">{job.provider}</p>
            </button>
          ))}
        </section>
      </section>
    </div>
  );
}
