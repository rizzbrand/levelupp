import type { CreateStudioJobInput, StudioJob } from "./types";

const RUNWAY_BASE_URL = process.env.RUNWAY_BASE_URL || "https://api.runwayml.com";

function getApiKey() {
  return process.env.RUNWAY_API_KEY;
}

type RunwayCreateResponse = {
  id?: string;
  status?: string;
  output_url?: string;
  created_at?: string;
  error?: string;
};

type RunwayStatusResponse = {
  id?: string;
  status?: string;
  output_url?: string;
  updated_at?: string;
  error?: string;
};

function toStudioStatus(status?: string): StudioJob["status"] {
  switch (status) {
    case "queued":
    case "pending":
      return "queued";
    case "processing":
    case "running":
      return "processing";
    case "succeeded":
    case "completed":
      return "succeeded";
    case "failed":
      return "failed";
    default:
      return "processing";
  }
}

export function isRunwayConfigured() {
  return Boolean(getApiKey());
}

export async function createRunwayJob(input: CreateStudioJobInput): Promise<StudioJob> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("RUNWAY_API_KEY is missing");
  }

  // The endpoint shape can vary by Runway API version/model.
  // Keep payload isolated here so only this file changes when wiring final model IDs.
  const response = await fetch(`${RUNWAY_BASE_URL}/v1/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taskType: input.mode === "video" ? "video_generation" : "image_generation",
      promptText: input.prompt,
      sourceImage: input.imageUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Runway create failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as RunwayCreateResponse;
  const now = new Date().toISOString();

  return {
    id: data.id || `runway_${Date.now()}`,
    mode: input.mode,
    prompt: input.prompt,
    status: toStudioStatus(data.status),
    createdAt: data.created_at || now,
    updatedAt: now,
    outputUrl: data.output_url,
    provider: "runway",
  };
}

export async function getRunwayJob(jobId: string, fallbackPrompt = ""): Promise<StudioJob> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("RUNWAY_API_KEY is missing");
  }

  const response = await fetch(`${RUNWAY_BASE_URL}/v1/tasks/${jobId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Runway status failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as RunwayStatusResponse;
  const now = new Date().toISOString();

  return {
    id: data.id || jobId,
    mode: "image",
    prompt: fallbackPrompt,
    status: toStudioStatus(data.status),
    createdAt: now,
    updatedAt: data.updated_at || now,
    outputUrl: data.output_url,
    error: data.error,
    provider: "runway",
  };
}
