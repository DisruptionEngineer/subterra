import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generatePipelineSlug } from "@/lib/utils";

// GET /api/pipelines — list all pipelines for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: pipelines, error } = await supabaseAdmin
    .from("pipelines")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get event counts for each pipeline (last 7 days)
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const pipelinesWithCounts = await Promise.all(
    (pipelines || []).map(async (pipeline) => {
      const { count } = await supabaseAdmin
        .from("webhook_events")
        .select("*", { count: "exact", head: true })
        .eq("pipeline_id", pipeline.id)
        .gte("received_at", sevenDaysAgo);

      return {
        ...pipeline,
        event_count_7d: count || 0,
      };
    })
  );

  return NextResponse.json(pipelinesWithCounts);
}

// POST /api/pipelines — create a new pipeline
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name,
    schedule,
    schedule_label,
    delivery_method,
    delivery_emails,
    brand_color,
    brand_name,
    report_title,
  } = body;

  if (!name || !schedule || !delivery_emails?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check pipeline limit
  const { count } = await supabaseAdmin
    .from("pipelines")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // For MVP, free users get 1 pipeline, starter gets 3
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, pipeline_limit")
    .eq("user_id", userId)
    .single();

  const limit = subscription?.pipeline_limit || 1;
  if ((count || 0) >= limit) {
    return NextResponse.json(
      { error: `Pipeline limit reached (${limit}). Upgrade your plan.` },
      { status: 403 }
    );
  }

  const slug = generatePipelineSlug();

  const { data: pipeline, error } = await supabaseAdmin
    .from("pipelines")
    .insert({
      user_id: userId,
      name,
      slug,
      status: "active",
      schedule: schedule || "0 9 * * 1", // Default: Monday 9am
      schedule_label: schedule_label || "Every Monday at 9:00 AM",
      delivery_method: delivery_method || "email_pdf",
      delivery_emails: delivery_emails || [],
      brand_color: brand_color || "#6366f1",
      brand_name: brand_name || "",
      report_title: report_title || name,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(pipeline, { status: 201 });
}
