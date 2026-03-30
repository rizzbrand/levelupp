import { NextResponse } from "next/server";
import { createMockJob } from "@/lib/runway/mock-store";
import { createRunwayJob, isRunwayConfigured } from "@/lib/runway/client";
import type { CreateStudioJobInput } from "@/lib/runway/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreateStudioJobInput>;

    if (!body.prompt || !body.mode) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, mode" },
        { status: 400 },
      );
    }

    const payload: CreateStudioJobInput = {
      prompt: body.prompt.trim(),
      mode: body.mode,
      imageUrl: body.imageUrl,
    };

    if (!payload.prompt) {
      return NextResponse.json({ error: "Prompt cannot be empty" }, { status: 400 });
    }

    const job = isRunwayConfigured()
      ? await createRunwayJob(payload)
      : createMockJob(payload);

    return NextResponse.json({ job, mockMode: !isRunwayConfigured() }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
