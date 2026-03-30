import type { CreateStudioJobInput, StudioJob } from "./types";
import { getJobMeta, rememberJobMeta } from "./job-cache";

const RUNWAY_API_BASE =
  process.env.RUNWAY_API_BASE || "https://api.dev.runwayml.com";
const RUNWAY_API_VERSION =
  process.env.RUNWAY_API_VERSION || "2024-11-06";

function getApiKey() {
  return process.env.RUNWAY_API_KEY || process.env.RUNWAYML_API_SECRET;
}

function runwayHeaders(): HeadersInit {
  const key = getApiKey();
  if (!key) throw new Error("RUNWAY_API_KEY or RUNWAYML_API_SECRET is missing");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "X-Runway-Version": RUNWAY_API_VERSION,
  };
}

type RunwayTaskCreateResponse = {
  id?: string;
  taskId?: string;
};

type RunwayTaskGetResponse = Record<string, unknown>;

function toStudioStatus(raw: unknown): StudioJob["status"] {
  const s = String(raw ?? "").toUpperCase();
  if (s.includes("PENDING") || s.includes("QUEUED") || s === "SUBMITTED") return "queued";
  if (s.includes("RUNNING") || s.includes("PROCESS")) return "processing";
  if (s.includes("SUCCESS") || s.includes("COMPLETE")) return "succeeded";
  if (s.includes("FAIL") || s.includes("ERROR") || s === "CANCELED" || s === "CANCELLED")
    return "failed";
  return "processing";
}

function extractOutputUrl(data: RunwayTaskGetResponse): string | undefined {
  const output = data.output;
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "url" in first && typeof (first as { url: string }).url === "string")
      return (first as { url: string }).url;
  }
  const direct =
    (typeof data.outputUrl === "string" && data.outputUrl) ||
    (typeof data.output_url === "string" && data.output_url) ||
    (typeof data.result === "string" && data.result);
  if (direct) return direct;
  return undefined;
}

function extractTaskId(data: RunwayTaskCreateResponse): string {
  return String(data.id ?? data.taskId ?? "");
}

function extractError(data: RunwayTaskGetResponse): string | undefined {
  const e = data.error ?? data.failureReason ?? data.message;
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: string }).message === "string")
    return (e as { message: string }).message;
  return undefined;
}

export function isRunwayConfigured() {
  return Boolean(getApiKey());
}

export async function createRunwayJob(input: CreateStudioJobInput & { imageDataUri: string }): Promise<StudioJob> {
  const now = new Date().toISOString();

  if (input.mode === "image") {
    const body = {
      model: "gen4_image",
      ratio: process.env.RUNWAY_IMAGE_RATIO || "1920:1080",
      promptText: input.prompt,
      referenceImages: [
        {
          uri: input.imageDataUri,
          tag: "Product",
        },
      ],
    };

    const response = await fetch(`${RUNWAY_API_BASE}/v1/text_to_image`, {
      method: "POST",
      headers: runwayHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Runway text_to_image failed: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as RunwayTaskCreateResponse;
    const id = extractTaskId(data);
    if (!id) throw new Error("Runway response missing task id");

    const job: StudioJob = {
      id,
      mode: "image",
      prompt: input.prompt,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      previewUrl: input.imagePublicPath ?? input.imageUrl,
      provider: "runway",
      productId: input.productId,
      productName: input.productName,
      productCategory: input.productCategory,
    };

    rememberJobMeta(id, job);
    return job;
  }

  const body = {
    model: process.env.RUNWAY_VIDEO_MODEL || "gen4.5",
    promptImage: input.imageDataUri,
    promptText: input.prompt,
    ratio: process.env.RUNWAY_VIDEO_RATIO || "1280:720",
    duration: Number(process.env.RUNWAY_VIDEO_DURATION || 5),
  };

  const response = await fetch(`${RUNWAY_API_BASE}/v1/image_to_video`, {
    method: "POST",
    headers: runwayHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Runway image_to_video failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as RunwayTaskCreateResponse;
  const id = extractTaskId(data);
  if (!id) throw new Error("Runway response missing task id");

  const job: StudioJob = {
    id,
    mode: "video",
    prompt: input.prompt,
    status: "queued",
    createdAt: now,
    updatedAt: now,
    previewUrl: input.imagePublicPath ?? input.imageUrl,
    provider: "runway",
    productId: input.productId,
    productName: input.productName,
    productCategory: input.productCategory,
  };

  rememberJobMeta(id, job);
  return job;
}

export async function getRunwayJob(jobId: string): Promise<StudioJob> {
  const response = await fetch(`${RUNWAY_API_BASE}/v1/tasks/${jobId}`, {
    method: "GET",
    headers: runwayHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Runway task status failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as RunwayTaskGetResponse;
  const meta = getJobMeta(jobId);
  const statusRaw = data.status ?? data.state ?? data.taskStatus;
  const status = toStudioStatus(statusRaw);
  const outputUrl = extractOutputUrl(data);
  const err = extractError(data);

  const now = new Date().toISOString();

  return {
    id: jobId,
    mode: meta?.mode ?? "image",
    prompt: meta?.prompt ?? "",
    status: err ? "failed" : status,
    createdAt: meta?.createdAt ?? now,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : now,
    previewUrl: meta?.previewUrl,
    outputUrl: outputUrl ?? meta?.outputUrl,
    error: err,
    provider: "runway",
    productId: meta?.productId,
    productName: meta?.productName,
    productCategory: meta?.productCategory,
  };
}
