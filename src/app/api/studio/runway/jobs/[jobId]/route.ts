import { NextResponse } from "next/server";
import { getMockJob } from "@/lib/runway/mock-store";
import { getRunwayJob, isRunwayConfigured } from "@/lib/runway/client";

type Params = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_req: Request, context: Params) {
  try {
    const { jobId } = await context.params;

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    if (!isRunwayConfigured()) {
      const job = getMockJob(jobId);
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ job, mockMode: true });
    }

    const job = await getRunwayJob(jobId);
    return NextResponse.json({ job, mockMode: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
