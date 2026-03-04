"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, RefreshCw } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Pipeline } from "@/types";

interface PipelineWithCounts extends Pipeline {
  event_count_7d: number;
}

export default function DashboardPage() {
  const [pipelines, setPipelines] = useState<PipelineWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelines();
  }, []);

  async function fetchPipelines() {
    try {
      const res = await fetch("/api/pipelines");
      if (res.ok) {
        const data = await res.json();
        setPipelines(data);
      }
    } catch (err) {
      console.error("Failed to fetch pipelines:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalEvents = pipelines.reduce((sum, p) => sum + (p.event_count_7d || 0), 0);
  const activePipelines = pipelines.filter((p) => p.status === "active").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchPipelines}
            className="px-4 py-2 rounded-lg border border-[#2a2a38] text-sm text-[#8888a0] hover:text-[#e8e8ed] hover:border-[#555568] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/pipelines/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Pipeline
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-7">
        {[
          { label: "Active Pipelines", value: activePipelines, change: null },
          {
            label: "Events (7d)",
            value: formatNumber(totalEvents),
            change: null,
          },
          {
            label: "Reports Generated",
            value: pipelines.reduce((sum, p) => sum + (p.report_count_period || 0), 0),
            change: null,
          },
          { label: "Delivery Rate", value: "99.7%", change: null },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border border-[#2a2a38] bg-[#1a1a24]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#555568] mb-1.5">
              {stat.label}
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Table */}
      <div className="rounded-xl border border-[#2a2a38] bg-[#1a1a24] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] px-5 py-3 border-b border-[#2a2a38] text-[11px] font-semibold uppercase tracking-wider text-[#555568]">
          <div>Pipeline</div>
          <div>Status</div>
          <div>Events (7d)</div>
          <div>Next Report</div>
          <div></div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-[#555568] text-sm">
            Loading pipelines...
          </div>
        ) : pipelines.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[#555568] text-sm mb-4">
              No pipelines yet. Create one to start ingesting webhooks.
            </p>
            <Link
              href="/pipelines/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Create Pipeline
            </Link>
          </div>
        ) : (
          pipelines.map((pipeline) => (
            <Link
              key={pipeline.id}
              href={`/pipelines/${pipeline.id}`}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] px-5 py-3.5 border-b border-[#1e1e2a] items-center hover:bg-[#22222e] transition-colors cursor-pointer"
            >
              <div>
                <div className="text-sm font-semibold">{pipeline.name}</div>
                <div className="text-[11px] text-[#555568] font-mono">
                  {pipeline.slug}
                </div>
              </div>
              <div>
                <StatusBadge status={pipeline.status} />
              </div>
              <div className="text-sm text-[#8888a0]">
                {formatNumber(pipeline.event_count_7d || 0)}
              </div>
              <div className="text-sm text-[#8888a0]">
                {pipeline.schedule_label || "—"}
              </div>
              <div className="text-right">
                <button
                  onClick={(e) => e.preventDefault()}
                  className="w-8 h-8 rounded-md inline-flex items-center justify-center text-[#555568] hover:bg-[#2a2a38] hover:text-[#e8e8ed] transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: "bg-green-500/15 text-green-400",
    paused: "bg-yellow-500/15 text-yellow-400",
    error: "bg-red-500/15 text-red-400",
  };

  const dotStyles = {
    active: "bg-green-400",
    paused: "bg-yellow-400",
    error: "bg-red-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[status as keyof typeof styles] || styles.active}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotStyles[status as keyof typeof dotStyles] || dotStyles.active}`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
