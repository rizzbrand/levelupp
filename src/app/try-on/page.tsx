import Image from "next/image";

const modules = [
  { label: "Upload Model", value: "Required" },
  { label: "Upload Product", value: "Required" },
  { label: "Scene", value: "White Studio" },
  { label: "Format", value: "Match Image Ratio" },
];

const outputs = [
  { name: "Campaign Hero", status: "Generated", score: "Photorealism 94%" },
  { name: "Ecom PDP Fit", status: "Queued", score: "Body Alignment 91%" },
  { name: "Story Crop", status: "Generated", score: "Fabric Detail 96%" },
];

export default function TryOnPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900/75 p-4">
        <div className="inline-flex rounded-full border border-white/15 bg-zinc-950 p-1 text-xs">
          <button className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-900">Transform</button>
          <button className="rounded-full px-3 py-1 text-zinc-400">Animate</button>
        </div>

        <button className="w-full rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white">
          Try On Products
        </button>

        <div className="space-y-2">
          {modules.map((module) => (
            <div
              key={module.label}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-3"
            >
              <p className="text-sm text-zinc-200">{module.label}</p>
              <span className="text-xs text-violet-300">{module.value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3 text-xs text-zinc-400">
          Upload a model and product, then generate realistic try-on outputs with preserved pose,
          lighting, and material texture.
        </div>

        <button className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-500">
          Upload model and product
        </button>
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

        <article className="relative overflow-hidden rounded-2xl border border-white/10">
          <Image
            src="/assets/tryon-reference.png"
            alt="Virtual try-on workspace preview"
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/65 via-zinc-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 max-w-md">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-300">Studio 03</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">AI Virtual Try-On Clothes</h2>
            <p className="mt-2 text-sm text-zinc-200">
              Place products on your chosen model images and generate campaign-ready variants in
              seconds.
            </p>
          </div>
        </article>

        <div className="grid gap-3 md:grid-cols-3">
          {outputs.map((output) => (
            <article key={output.name} className="rounded-xl border border-white/10 bg-zinc-950/80 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-zinc-100">{output.name}</p>
                <span className="text-xs text-zinc-400">{output.status}</span>
              </div>
              <p className="text-xs text-emerald-300">{output.score}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
