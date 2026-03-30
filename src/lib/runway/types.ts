export type StudioGenerationMode = "image" | "video";

export type StudioJobStatus =
  | "queued"
  | "processing"
  | "succeeded"
  | "failed";

export type StudioJob = {
  id: string;
  mode: StudioGenerationMode;
  prompt: string;
  status: StudioJobStatus;
  createdAt: string;
  updatedAt: string;
  previewUrl?: string;
  outputUrl?: string;
  error?: string;
  provider: "runway" | "mock";
};

export type CreateStudioJobInput = {
  prompt: string;
  mode: StudioGenerationMode;
  imageUrl?: string;
};
