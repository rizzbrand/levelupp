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
  productId?: string;
  productName?: string;
  productCategory?: string;
};

export type CreateStudioJobInput = {
  prompt: string;
  mode: StudioGenerationMode;
  /** Public path e.g. /assets/tee1.PNG — server loads as data URI for Runway */
  imagePublicPath?: string;
  imageUrl?: string;
  productId?: string;
  productName?: string;
  productCategory?: string;
};
