"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

const SCHEDULES = [
  { value: "0 9 * * 1", label: "Weekly — Every Monday at 9:00 AM" },
  { value: "0 7 * * *", label: "Daily — Every day at 7:00 AM" },
  { value: "0 9 * * 5", label: "Weekly — Every Friday at 9:00 AM" },
  { value: "0 9 1 * *", label: "Monthly — 1st of each month at 9:00 AM" },
];

const SOURCES = [
  { id: "stripe", icon: "💳", name: "Stripe" },
  { id: "hubspot", icon: "📧", name: "HubSpot" },
  { id: "shopify", icon: "🛍️", name: "Shopify" },
  { id: "slack", icon: "💬", name: "Slack" },
  { id: "sentry", icon: "🐛", name: "Sentry" },
  { id: "custom", icon: "⚙️", name: "Custom" },
];

export default function NewPipelinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSource, setSelectedSource] = useState("custom");

  const [form, setForm] = useState({
    name: "",
    schedule: "0 9 * * 1",
    delivery_method: "email_pdf",
    delivery_emails: "",
    brand_color: "#6366f1",
    brand_name: "",
    report_title: "",
  });

  // Preview slug
  const previewSlug = "pipe_xxxxxxxxxxxx";
  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/ingest/${previewSlug}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduleObj = SCHEDULES.find((s) => s.value === form.schedule);
      const res = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          schedule_label: scheduleObj?.label || form.schedule,
          delivery_emails: form.delivery_emails
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean),
          report_title: form.report_title || form.name,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create pipeline");
      }
    } catch {
      alert("Failed to create pipeline");
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#555568] hover:text-[#8888a0] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-2xl font-extrabold tracking-tight mb-1">
        Create Pipeline
      </h1>
      <p className="text-sm text-[#8888a0] mb-8">
        Connect a webhook source, configure your report, and set a delivery
        schedule.
      </p>

      {/* Step Indicator */}
      <div className="flex gap-1 mb-8">
        <div className="flex-1 h-0.5 rounded bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="flex-1 h-0.5 rounded bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="flex-1 h-0.5 rounded bg-[#2a2a38]" />
        <div className="flex-1 h-0.5 rounded bg-[#2a2a38]" />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Name & Source */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-4">1. Name & Source</h3>

          <label className="block text-xs font-semibold text-[#8888a0] mb-1.5">
            Pipeline Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Stripe Weekly Revenue Report"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#2a2a38] bg-[#1a1a24] text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            required
          />

          <label className="block text-xs font-semibold text-[#8888a0] mt-4 mb-1.5">
            Your Webhook URL
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-[#1a1a24] border border-[#2a2a38]">
            <code className="flex-1 text-xs text-indigo-400 font-mono truncate">
              {webhookUrl}
            </code>
            <button
              type="button"
              onClick={copyUrl}
              className="px-3 py-1 rounded-md border border-[#2a2a38] text-[11px] font-semibold text-[#8888a0] hover:text-[#e8e8ed] transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#555568] mt-1">
            Point your webhook to this URL. We&apos;ll auto-detect the schema
            from the first payload.
          </p>
        </div>

        {/* Section 2: Quick Connect */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-4">2. Quick Connect (optional)</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {SOURCES.map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => setSelectedSource(source.id)}
                className={`p-4 rounded-lg border text-center transition-all ${
                  selectedSource === source.id
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-[#2a2a38] bg-[#1a1a24] hover:border-indigo-500/50"
                }`}
              >
                <div className="text-2xl mb-2">{source.icon}</div>
                <div className="text-xs font-semibold">{source.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Schedule & Delivery */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-4">3. Schedule & Delivery</h3>

          <label className="block text-xs font-semibold text-[#8888a0] mb-1.5">
            Report Frequency
          </label>
          <select
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#2a2a38] bg-[#1a1a24] text-sm focus:border-indigo-500 focus:outline-none transition-colors"
          >
            {SCHEDULES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <label className="block text-xs font-semibold text-[#8888a0] mt-4 mb-1.5">
            Delivery Method
          </label>
          <select
            value={form.delivery_method}
            onChange={(e) =>
              setForm({ ...form, delivery_method: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#2a2a38] bg-[#1a1a24] text-sm focus:border-indigo-500 focus:outline-none transition-colors"
          >
            <option value="email_pdf">Email (PDF attached)</option>
          </select>

          <label className="block text-xs font-semibold text-[#8888a0] mt-4 mb-1.5">
            Deliver To
          </label>
          <input
            type="text"
            value={form.delivery_emails}
            onChange={(e) =>
              setForm({ ...form, delivery_emails: e.target.value })
            }
            placeholder="team@company.com, cfo@company.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#2a2a38] bg-[#1a1a24] text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            required
          />
        </div>

        {/* Section 4: Branding */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-4">4. Report Branding</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8888a0] mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={form.brand_name}
                onChange={(e) =>
                  setForm({ ...form, brand_name: e.target.value })
                }
                placeholder="Acme Corp"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#2a2a38] bg-[#1a1a24] text-sm focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8888a0] mb-1.5">
                Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brand_color}
                  onChange={(e) =>
                    setForm({ ...form, brand_color: e.target.value })
                  }
                  className="w-10 h-10 rounded-lg border border-[#2a2a38] bg-[#1a1a24] cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brand_color}
                  onChange={(e) =>
                    setForm({ ...form, brand_color: e.target.value })
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#2a2a38] bg-[#1a1a24] text-sm font-mono focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <label className="block text-xs font-semibold text-[#8888a0] mt-4 mb-1.5">
            Report Title
          </label>
          <input
            type="text"
            value={form.report_title}
            onChange={(e) =>
              setForm({ ...form, report_title: e.target.value })
            }
            placeholder="Defaults to pipeline name"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#2a2a38] bg-[#1a1a24] text-sm focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-lg border border-[#2a2a38] text-sm text-[#8888a0] hover:text-[#e8e8ed] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Pipeline →"}
          </button>
        </div>
      </form>
    </div>
  );
}
