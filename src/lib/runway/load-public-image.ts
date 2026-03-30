import fs from "node:fs/promises";
import path from "node:path";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/**
 * Load a file from `public/` and return a data URI Runway accepts for reference images.
 * `publicPath` must start with `/` (e.g. `/assets/tee1.PNG`).
 */
export async function loadPublicAssetAsDataUri(publicPath: string): Promise<string> {
  const normalized = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  const absolute = path.join(process.cwd(), "public", normalized);
  const buf = await fs.readFile(absolute);
  const ext = path.extname(absolute).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const b64 = buf.toString("base64");
  return `data:${mime};base64,${b64}`;
}
