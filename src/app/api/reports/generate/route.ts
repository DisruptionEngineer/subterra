import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendReportEmail } from "@/lib/resend";
import { generateReportId } from "@/lib/utils";
import { format, subDays, subWeeks, subMonths } from "date-fns";

// POST /api/reports/generate — generate a report for a pipeline
// Called by Vercel Cron or manually from dashboard
export async function POST(request: NextRequest) {
  // Verify cron secret or user auth
  const cronSecret = request.headers.get("x-cron-secret");
  const pipelineId = request.nextUrl.searchParams.get("pipeline_id");

  if (cronSecret !== process.env.CRON_SECRET && !pipelineId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // If called by cron, process all due pipelines
    // If called manually, process specific pipeline
    let pipelines;

    if (pipelineId) {
      const { data } = await supabaseAdmin
        .from("pipelines")
        .select("*")
        .eq("id", pipelineId)
        .eq("status", "active")
        .single();
      pipelines = data ? [data] : [];
    } else {
      // For cron: get all active pipelines (in production, match cron schedule)
      const { data } = await supabaseAdmin
        .from("pipelines")
        .select("*")
        .eq("status", "active");
      pipelines = data || [];
    }

    const results = [];

    for (const pipeline of pipelines) {
      try {
        // Determine report period based on schedule
        const now = new Date();
        let periodStart: Date;

        if (pipeline.schedule.includes("* * 1")) {
          periodStart = subMonths(now, 1);
        } else if (pipeline.schedule.includes("* * *")) {
          periodStart = subDays(now, 1);
        } else {
          periodStart = subWeeks(now, 1);
        }

        // Fetch events for the period
        const { data: events } = await supabaseAdmin
          .from("webhook_events")
          .select("*")
          .eq("pipeline_id", pipeline.id)
          .gte("received_at", periodStart.toISOString())
          .lte("received_at", now.toISOString())
          .order("received_at", { ascending: true });

        if (!events || events.length === 0) {
          results.push({
            pipeline: pipeline.name,
            status: "skipped",
            reason: "no events",
          });
          continue;
        }

        // Generate PDF report
        const pdfBuffer = await generatePDFReport({
          pipeline,
          events,
          periodStart,
          periodEnd: now,
        });

        // Store report record
        const reportId = generateReportId();
        const periodStartStr = format(periodStart, "yyyy-MM-dd");
        const periodEndStr = format(now, "yyyy-MM-dd");

        await supabaseAdmin.from("reports").insert({
          id: reportId,
          pipeline_id: pipeline.id,
          format: "pdf",
          period_start: periodStartStr,
          period_end: periodEndStr,
          event_count: events.length,
          delivered: false,
        });

        // Send email
        if (
          pipeline.delivery_method === "email_pdf" &&
          pipeline.delivery_emails?.length
        ) {
          await sendReportEmail({
            to: pipeline.delivery_emails,
            pipelineName: pipeline.name,
            reportTitle: pipeline.report_title || pipeline.name,
            periodStart: periodStartStr,
            periodEnd: periodEndStr,
            pdfBuffer: Buffer.from(pdfBuffer),
          });

          await supabaseAdmin
            .from("reports")
            .update({ delivered: true, delivered_at: new Date().toISOString() })
            .eq("id", reportId);
        }

        // Update pipeline
        await supabaseAdmin
          .from("pipelines")
          .update({ last_report_at: new Date().toISOString() })
          .eq("id", pipeline.id);

        // Track usage for billing
        await supabaseAdmin.rpc("increment_report_usage", {
          p_user_id: pipeline.user_id,
        });

        results.push({
          pipeline: pipeline.name,
          status: "generated",
          events: events.length,
          reportId,
        });
      } catch (err) {
        console.error(`Failed to generate report for ${pipeline.name}:`, err);
        results.push({
          pipeline: pipeline.name,
          status: "error",
          error: (err as Error).message,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PDF generation using HTML-to-PDF approach (simpler than @react-pdf for MVP)
async function generatePDFReport({
  pipeline,
  events,
  periodStart,
  periodEnd,
}: {
  pipeline: Record<string, unknown>;
  events: Record<string, unknown>[];
  periodStart: Date;
  periodEnd: Date;
}): Promise<Uint8Array> {
  const brandColor = (pipeline.brand_color as string) || "#6366f1";
  const brandName = (pipeline.brand_name as string) || "Subterra";
  const reportTitle =
    (pipeline.report_title as string) || (pipeline.name as string);

  // Extract summary stats from events
  const totalEvents = events.length;

  // Try to extract monetary amounts if present
  let totalAmount = 0;
  let hasAmounts = false;
  for (const event of events) {
    const payload = event.payload as Record<string, unknown>;
    const amount =
      (payload.amount as number) ||
      ((payload.data as Record<string, unknown>)?.amount as number) ||
      0;
    if (amount > 0) {
      totalAmount += amount;
      hasAmounts = true;
    }
  }

  // Build table rows from event payloads
  // Take first 50 events for the table
  const tableEvents = events.slice(0, 50);

  // Auto-detect columns from first event payload
  const samplePayload = tableEvents[0]?.payload as Record<string, unknown>;
  const columns = samplePayload
    ? Object.keys(samplePayload)
        .filter(
          (k) => typeof samplePayload[k] !== "object" || samplePayload[k] === null
        )
        .slice(0, 6)
    : ["received_at"];

  const tableRows = tableEvents
    .map((event) => {
      const payload = event.payload as Record<string, unknown>;
      const cells = columns
        .map((col) => {
          const val = payload[col];
          if (val === null || val === undefined) return "-";
          if (typeof val === "number" && col.toLowerCase().includes("amount"))
            return `$${(val / 100).toFixed(2)}`;
          return String(val).substring(0, 40);
        })
        .map((cell) => `<td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#333;">${cell}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const tableHeaders = columns
    .map(
      (col) =>
        `<th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#666;border-bottom:1px solid #ddd;">${col.replace(/_/g, " ")}</th>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,Helvetica,Arial,sans-serif;margin:0;padding:40px;color:#1a1a2e;">
      <div style="max-width:800px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid ${brandColor};">
          <div>
            <div style="font-size:18px;font-weight:700;">${brandName}</div>
          </div>
          <div style="text-align:right;font-size:11px;color:#888;">
            ${reportTitle}<br>
            ${format(periodStart, "MMM d, yyyy")} – ${format(periodEnd, "MMM d, yyyy")}<br>
            Generated by Subterra
          </div>
        </div>

        <h1 style="font-size:22px;font-weight:800;margin-bottom:24px;">${reportTitle}</h1>

        <div style="display:flex;gap:16px;margin-bottom:28px;">
          <div style="flex:1;padding:16px;border-radius:8px;background:#f5f5ff;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:${brandColor};">${totalEvents.toLocaleString()}</div>
            <div style="font-size:11px;color:#666;">Total Events</div>
          </div>
          ${
            hasAmounts
              ? `<div style="flex:1;padding:16px;border-radius:8px;background:#f5f5ff;text-align:center;">
              <div style="font-size:24px;font-weight:800;color:${brandColor};">$${(totalAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div style="font-size:11px;color:#666;">Total Amount</div>
            </div>`
              : ""
          }
          <div style="flex:1;padding:16px;border-radius:8px;background:#f5f5ff;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:${brandColor};">${Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))}</div>
            <div style="font-size:11px;color:#666;">Days Covered</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead><tr>${tableHeaders}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>

        ${events.length > 50 ? `<p style="font-size:12px;color:#999;text-align:center;">Showing 50 of ${events.length} events</p>` : ""}

        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
        <p style="font-size:10px;color:#bbb;text-align:center;">
          Generated by Subterra · ${format(new Date(), "MMM d, yyyy h:mm a")}
        </p>
      </div>
    </body>
    </html>
  `;

  // For MVP, we'll return the HTML as a buffer
  // In production, this would use Puppeteer or a PDF rendering service
  const encoder = new TextEncoder();
  return encoder.encode(html);
}
