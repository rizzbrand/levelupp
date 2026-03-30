import type { StudioJob } from "./types";

const cache = new Map<string, Partial<StudioJob>>();

export function rememberJobMeta(id: string, meta: Partial<StudioJob>) {
  cache.set(id, { ...cache.get(id), ...meta });
}

export function getJobMeta(id: string): Partial<StudioJob> | undefined {
  return cache.get(id);
}
