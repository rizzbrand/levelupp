import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

/**
 * Next.js loads `.env*` from the project root. If the key lives in `src/.env`, merge it in
 * so `RUNWAY_API_KEY` / `RUNWAYML_API_SECRET` resolve without moving files.
 */
function loadOptionalSrcEnv() {
  const filePath = path.join(process.cwd(), "src", ".env");
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadOptionalSrcEnv();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
