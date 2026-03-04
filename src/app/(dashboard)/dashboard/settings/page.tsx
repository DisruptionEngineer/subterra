"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Save, CreditCard, Bell, Palette, Key } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: "general", label: "General", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api", label: "API Keys", icon: Key },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#2a2a38]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-[#8888a0] hover:text-[#e8e8ed]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-[#2a2a38] bg-[#1a1a24] p-6">
            <h2 className="text-sm font-bold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#8888a0] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.fullName || ""}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#111118] border border-[#2a2a38] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  disabled
                />
                <p className="text-[10px] text-[#555568] mt-1">
                  Managed by your authentication provider
                </p>
              </div>
              <div>
                <label className="block text-xs text-[#8888a0] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#111118] border border-[#2a2a38] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#2a2a38] bg-[#1a1a24] p-6">
            <h2 className="text-sm font-bold mb-4">Report Branding</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#8888a0] mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Your company name"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#111118] border border-[#2a2a38] text-sm placeholder-[#555568] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8888a0] mb-1.5">
                  Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue="#6366f1"
                    className="w-10 h-10 rounded-lg border border-[#2a2a38] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue="#6366f1"
                    className="w-32 px-3.5 py-2.5 rounded-lg bg-[#111118] border border-[#2a2a38] text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#8888a0] mb-1.5">
                  Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#111118] border border-[#2a2a38] text-sm placeholder-[#555568] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={async () => {
                setSaving(true);
                await new Promise((r) => setTimeout(r, 600));
                setSaving(false);
              }}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-[#2a2a38] bg-[#1a1a24] p-6">
            <h2 className="text-sm font-bold mb-1">Current Plan</h2>
            <p className="text-xs text-[#555568] mb-4">
              Manage your subscription
            </p>
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#111118] border border-[#2a2a38]">
              <div>
                <div className="text-sm font-bold">Free</div>
                <div className="text-xs text-[#555568]">
                  1 pipeline · 10 reports/month
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-500/15 text-green-400">
                Active
              </span>
            </div>
            <button className="mt-4 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
              Upgrade to Starter — $29/mo
            </button>
          </div>

          <div className="rounded-xl border border-[#2a2a38] bg-[#1a1a24] p-6">
            <h2 className="text-sm font-bold mb-1">Usage This Period</h2>
            <p className="text-xs text-[#555568] mb-4">
              Resets on the 1st of each month
            </p>
            <div className="space-y-3">
              <UsageBar label="Pipelines" used={0} max={1} />
              <UsageBar label="Reports" used={0} max={10} />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl">
          <div className="rounded-xl border border-[#2a2a38] bg-[#1a1a24] p-6">
            <h2 className="text-sm font-bold mb-4">Email Notifications</h2>
            <div className="space-y-4">
              {[
                {
                  label: "Report delivered",
                  desc: "Get notified when a report is generated and sent",
                  defaultChecked: true,
                },
                {
                  label: "Pipeline errors",
                  desc: "Get notified when a pipeline encounters an error",
                  defaultChecked: true,
                },
                {
                  label: "Usage alerts",
                  desc: "Get notified when approaching plan limits",
                  defaultChecked: true,
                },
                {
                  label: "Weekly digest",
                  desc: "Summary of all pipeline activity",
                  defaultChecked: false,
                },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-[#111118] border border-[#2a2a38] cursor-pointer hover:border-[#555568] transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-[#555568]">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="w-4 h-4 rounded border-[#2a2a38] bg-[#111118] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "api" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-[#2a2a38] bg-[#1a1a24] p-6">
            <h2 className="text-sm font-bold mb-1">Webhook Endpoints</h2>
            <p className="text-xs text-[#555568] mb-4">
              Use these URLs to send webhook events to your pipelines
            </p>
            <div className="p-3.5 rounded-lg bg-[#111118] border border-[#2a2a38]">
              <div className="text-[11px] text-[#555568] mb-1">
                Base endpoint
              </div>
              <code className="text-sm text-indigo-400 font-mono">
                https://subterra-nine.vercel.app/api/webhooks/ingest/
                <span className="text-[#555568]">{"<pipeline-slug>"}</span>
              </code>
            </div>
            <p className="text-[10px] text-[#555568] mt-2">
              Create a pipeline to get a unique webhook URL
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <h2 className="text-sm font-bold text-amber-400 mb-1">
              API Access — Coming Soon
            </h2>
            <p className="text-xs text-[#8888a0]">
              Programmatic access to your pipelines, events, and reports via REST
              API. Available on the Starter plan and above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function UsageBar({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#8888a0]">{label}</span>
        <span className="text-xs text-[#8888a0]">
          {used} / {max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#111118] border border-[#2a2a38] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
