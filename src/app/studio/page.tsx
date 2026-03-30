/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { StudioGenerationMode, StudioJob } from "@/lib/runway/types";

const controls = [
  { label: "Model profile", value: "Elegant, dark hair" },
  { label: "Upload products", value: "Required" },
  { label: "Scene", value: "White background" },
  { label: "Format", value: "9:16" },
];

const concepts = [
  {
    title: "Spring Drop Reel",
    type: "Video",
    prompt: "15s cinematic teaser with dynamic cuts and neon textile closeups.",
    status: "Rendering",
  },
  {
    title: "Editorial Lookbook",
    type: "Image Set",
    prompt: "Ultra-clean monochrome campaign with metallic accents and runway mood.",
    status: "Ready",
  },
  {
    title: "Product Spotlight",
    type: "Image + Motion",
    prompt: "Social-first creative for Arc Cargo Trouser with urban backdrop.",
    status: "Queued",
  },
];

export default function StudioPage() {
  const [mode, setMode] = useState<StudioGenerationMode>("image");
  const [prompt, setPrompt] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState("/assets/tee1.PNG");
  const [jobs, setJobs] = useState<StudioJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);

  const activeJob = useMemo(
    () => jobs.find((job) => job.id === activeJobId) ?? null,
    [jobs, activeJobId],
  );

  async function createGeneration() {
    if (!prompt.trim()) {
      setError("Please add a prompt first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/studio/runway/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode,
          imageUrl: sourceImageUrl || undefined,
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
    }, 1800);

    return () => clearInterval(interval);
  }, [activeJob]);

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900/75 p-4">
        <div className="inline-flex rounded-full border border-white/15 bg-zinc-950 p-1 text-xs">
          <button
            onClick={() => setMode("image")}
            className={`rounded-full px-3 py-1 font-medium ${
              mode === "image" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
            }`}
          >
            Image
          </button>
          <button
            onClick={() => setMode("video")}
            className={`rounded-full px-3 py-1 font-medium ${
              mode === "video" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
            }`}
          >
            Video
          </button>
        </div>

        <p className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
          {mockMode
            ? "Runway API key not set. Studio is running in mock mode."
            : "Runway mode connected. Generations use live API jobs."}
        </p>

        <div className="space-y-2">
          {controls.map((control) => (
            <div
              key={control.label}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-3"
            >
              <p className="text-sm text-zinc-200">{control.label}</p>
              <span className="text-xs text-violet-300">{control.value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/80 p-3">
          <label className="text-xs uppercase tracking-[0.14em] text-zinc-400">Source Image Url</label>
          <input
            value={sourceImageUrl}
            onChange={(event) => setSourceImageUrl(event.target.value)}
            className="w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400"
            placeholder="/assets/tee1.PNG"
          />
        </div>

        <div className="space-y-2 rounded-xl border border-white/10 bg-zinc-950/80 p-3">
          <label className="text-xs uppercase tracking-[0.14em] text-zinc-400">Prompt</label>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="min-h-28 w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-400"
            placeholder="Create a premium fashion campaign visual with dramatic lighting and clean editorial composition."
          />
        </div>

        <button
          onClick={createGeneration}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-violet-900"
        >
          {isSubmitting ? "Submitting..." : `Generate ${mode === "video" ? "Video" : "Image"}`}
        </button>
        {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      </aside>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300">
            All creations
          </div>
          <button className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500">
            Generate in Bulk
          </button>
        </div>

        <article className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10">
          {activeJob?.outputUrl || activeJob?.previewUrl || sourceImageUrl ? (
            <img
              src={activeJob?.outputUrl || activeJob?.previewUrl || sourceImageUrl}
              alt="Selected product preview"
              className="h-[440px] w-full object-contain bg-zinc-950"
            />
          ) : (
            <div className="flex h-[440px] items-center justify-center bg-zinc-950 text-sm text-zinc-400">
              Add a source product image URL to preview it here.
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 via-transparent to-transparent" />
        </article>

        <section className="grid gap-3 md:grid-cols-3">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => setActiveJobId(job.id)}
              className="rounded-xl border border-white/10 bg-zinc-950/80 p-4 text-left hover:border-violet-400/60"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-zinc-100">{job.mode === "video" ? "Runway Video" : "Runway Image"}</h3>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-300">
                  {job.status}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-zinc-300">{job.prompt}</p>
              <p className="mt-2 text-xs text-zinc-500">{job.provider}</p>
            </button>
          ))}
          {concepts.map((concept) => (
            <article key={concept.title} className="rounded-xl border border-white/10 bg-zinc-950/80 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-zinc-100">{concept.title}</h3>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-zinc-300">
                  {concept.status}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{concept.type}</p>
              <p className="mt-2 text-sm text-zinc-300">{concept.prompt}</p>
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
