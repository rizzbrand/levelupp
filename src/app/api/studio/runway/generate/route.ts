import { NextResponse } from "next/server";
import { getProductById } from "@/lib/catalog";
import { createMockJob } from "@/lib/runway/mock-store";
import { createRunwayJob, isRunwayConfigured } from "@/lib/runway/client";
import { loadPublicAssetAsDataUri } from "@/lib/runway/load-public-image";
import { buildProductAdPrompt } from "@/lib/runway/build-ad-prompt";
import type { CreateStudioJobInput, StudioGenerationMode } from "@/lib/runway/types";

type Body = {
  productId?: string;
  mode?: StudioGenerationMode;
  extraPrompt?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const productId = body.productId?.trim();
    const mode = body.mode;
    if (!productId || !mode) {
      return NextResponse.json(
        { error: "Missing required fields: productId, mode" },
        { status: 400 },
      );
    }

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const prompt = buildProductAdPrompt(product, body.extraPrompt ?? "");
    const imageDataUri = await loadPublicAssetAsDataUri(product.image);

    const payload: CreateStudioJobInput = {
      prompt,
      mode,
      imagePublicPath: product.image,
      imageUrl: product.image,
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
    };

    const job = isRunwayConfigured()
      ? await createRunwayJob({ ...payload, imageDataUri })
      : createMockJob(payload);

    return NextResponse.json({ job, mockMode: !isRunwayConfigured() }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
