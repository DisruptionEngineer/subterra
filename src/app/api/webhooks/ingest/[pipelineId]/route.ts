import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pipelineId: string }> }
) {
  const { pipelineId } = await params;

  try {
    // Verify pipeline exists and is active
    const { data: pipeline, error: pipelineError } = await supabaseAdmin
      .from("pipelines")
      .select("id, status, user_id")
      .eq("slug", pipelineId)
      .single();

    if (pipelineError || !pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    if (pipeline.status !== "active") {
      return NextResponse.json(
        { error: "Pipeline is not active" },
        { status: 403 }
      );
    }

    // Parse the incoming webhook payload
    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Store the event
    const { error: insertError } = await supabaseAdmin
      .from("webhook_events")
      .insert({
        pipeline_id: pipeline.id,
        payload,
        headers: Object.fromEntries(request.headers.entries()),
        source_ip: request.headers.get("x-forwarded-for") || "unknown",
        received_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to store event:", insertError);
      return NextResponse.json(
        { error: "Failed to store event" },
        { status: 500 }
      );
    }

    // Update pipeline last_event_at
    await supabaseAdmin
      .from("pipelines")
      .update({
        last_event_at: new Date().toISOString(),
      })
      .eq("id", pipeline.id);

    return NextResponse.json({ status: "received", pipeline: pipelineId });
  } catch (error) {
    console.error("Webhook ingestion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also accept GET for health checks
export async function GET() {
  return NextResponse.json({ status: "ok", service: "subterra-ingest" });
}
