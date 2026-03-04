import Link from "next/link";
import { ArrowRight, Zap, FileText, RefreshCw } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <path d="M4 18 L12 6 L20 18" />
              <path d="M7 14 L12 6 L17 14" opacity="0.5" />
            </svg>
          </div>
          <span className="text-base font-extrabold tracking-tight">subterra</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-[#8888a0] hover:text-[#e8e8ed] transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            Start free <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#2a2a38] bg-[#1a1a24] text-xs text-[#8888a0] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Now in public beta
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5">
          Webhooks in.
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Reports out.
          </span>
        </h1>
        <p className="text-lg text-[#8888a0] max-w-xl mx-auto mb-9 leading-relaxed">
          Subterra turns webhook events from any source into branded, scheduled
          PDF reports. No code. No dashboards. Just the data your stakeholders
          need, delivered on time.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/sign-up"
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
          >
            Start free →
          </Link>
          <Link
            href="#how-it-works"
            className="px-7 py-3 rounded-xl border border-[#2a2a38] text-sm text-[#e8e8ed] hover:border-[#555568] transition-colors"
          >
            How it works
          </Link>
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="max-w-3xl mx-auto px-6 pb-20" id="how-it-works">
        <div className="rounded-2xl border border-[#2a2a38] bg-[#111118] p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.06)_0%,transparent_50%)]" />
          <div className="flex items-center justify-between gap-4 relative z-10 flex-wrap">
            {[
              { icon: "⚡", label: "Webhook Event", sub: "Any JSON payload" },
              { icon: "◆", label: "Subterra", sub: "Normalize & store", highlight: true },
              { icon: "📊", label: "Template", sub: "Tables, charts, stats" },
              { icon: "📬", label: "Delivery", sub: "Email, webhook, API" },
            ].map((node, i) => (
              <div key={node.label} className="flex items-center gap-4">
                <div
                  className={`p-3.5 rounded-xl border text-center min-w-[120px] ${
                    node.highlight
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-[#2a2a38] bg-[#1a1a24]"
                  }`}
                >
                  <div className="text-xl mb-1.5">{node.icon}</div>
                  <div className="text-xs font-semibold">{node.label}</div>
                  <div className="text-[10px] text-[#555568]">{node.sub}</div>
                </div>
                {i < 3 && (
                  <span className="text-[#555568] text-lg hidden md:block">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-5 h-5" />,
              color: "text-indigo-400 bg-indigo-500/10",
              title: "Universal Ingestion",
              desc: "Accepts any JSON webhook. Stripe, HubSpot, custom APIs — just point and send. Auto-schema detection maps your fields.",
            },
            {
              icon: <FileText className="w-5 h-5" />,
              color: "text-green-400 bg-green-500/10",
              title: "Branded Reports",
              desc: "Your logo, your colors. Output as PDF. Professional reports that look like your team built them.",
            },
            {
              icon: <RefreshCw className="w-5 h-5" />,
              color: "text-violet-400 bg-violet-500/10",
              title: "Set & Forget Delivery",
              desc: "Schedule reports daily, weekly, or monthly. Delivered via email. Runs silently in the background forever.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-[#2a2a38] bg-[#1a1a24]"
            >
              <div
                className={`w-9 h-9 rounded-lg mb-3.5 flex items-center justify-center ${feature.color}`}
              >
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold mb-1.5">{feature.title}</h3>
              <p className="text-xs text-[#8888a0] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-2">
          Simple pricing.
        </h2>
        <p className="text-sm text-[#8888a0] text-center mb-10">
          Start free. Upgrade when your pipelines demand it.
        </p>

        <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
          {/* Free */}
          <div className="p-7 rounded-2xl border border-[#2a2a38] bg-[#1a1a24]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#555568] mb-2">
              Free
            </div>
            <div className="text-3xl font-extrabold tracking-tight mb-1">
              $0<span className="text-sm font-normal text-[#555568]">/mo</span>
            </div>
            <p className="text-xs text-[#8888a0] mb-5">
              Try it out with one pipeline
            </p>
            <ul className="space-y-2 mb-6">
              {["1 pipeline", "10 reports/month", "Email delivery", "Basic template"].map((item) => (
                <li key={item} className="text-xs text-[#8888a0] flex items-center gap-2">
                  <span className="text-green-400 text-[11px]">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block w-full py-2.5 rounded-lg border border-[#2a2a38] text-center text-sm font-semibold hover:border-[#555568] transition-colors"
            >
              Get started
            </Link>
          </div>

          {/* Starter */}
          <div className="p-7 rounded-2xl border border-indigo-500 bg-[#1a1a24] relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-[10px] font-bold uppercase tracking-wider text-white">
              Popular
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#555568] mb-2">
              Starter
            </div>
            <div className="text-3xl font-extrabold tracking-tight mb-1">
              $29<span className="text-sm font-normal text-[#555568]">/mo</span>
            </div>
            <p className="text-xs text-[#8888a0] mb-5">
              For teams and growing projects
            </p>
            <ul className="space-y-2 mb-6">
              {[
                "3 pipelines",
                "500 reports/month",
                "Custom branding",
                "Email delivery",
                "$0.05/report overage",
              ].map((item) => (
                <li key={item} className="text-xs text-[#8888a0] flex items-center gap-2">
                  <span className="text-green-400 text-[11px]">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="block w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-center text-sm font-semibold text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-[#1e1e2a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-3 h-3">
                <path d="M4 18 L12 6 L20 18" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#555568]">subterra</span>
          </div>
          <span className="text-xs text-[#555568]">
            © 2026 Subterra. The infrastructure beneath your data.
          </span>
        </div>
      </footer>
    </div>
  );
}
