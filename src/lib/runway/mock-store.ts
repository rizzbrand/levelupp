import type { CreateStudioJobInput, StudioJob } from "./types";

const mockJobs = new Map<string, StudioJob>();

function nowIso() {
  return new Date().toISOString();
}

export function createMockJob(input: CreateStudioJobInput): StudioJob {
  const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = nowIso();

  const job: StudioJob = {
    id,
    mode: input.mode,
    prompt: input.prompt,
    status: "queued",
    createdAt: now,
    updatedAt: now,
    previewUrl: input.imagePublicPath ?? input.imageUrl,
    provider: "mock",
    productId: input.productId,
    productName: input.productName,
    productCategory: input.productCategory,
  };

  mockJobs.set(id, job);

  setTimeout(() => {
    const current = mockJobs.get(id);
    if (!current) return;
    mockJobs.set(id, { ...current, status: "processing", updatedAt: nowIso() });
  }, 1200);

  setTimeout(() => {
    const current = mockJobs.get(id);
    if (!current) return;
    mockJobs.set(id, {
      ...current,
      status: "succeeded",
      updatedAt: nowIso(),
      outputUrl: current.previewUrl,
    });
  }, 3800);

  return job;
}

export function getMockJob(id: string): StudioJob | null {
  return mockJobs.get(id) ?? null;
}
