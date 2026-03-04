"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Link2,
  FileText,
  Zap,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard", label: "Pipelines", icon: Link2 },
  { href: "/dashboard", label: "Reports", icon: FileText },
  { href: "/dashboard", label: "Events", icon: Zap },
];

const configItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#111118] border-r border-[#2a2a38] flex flex-col min-h-screen">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="w-4 h-4"
          >
            <path d="M4 18 L12 6 L20 18" />
            <path d="M7 14 L12 6 L17 14" opacity="0.5" />
          </svg>
        </div>
        <span className="text-base font-extrabold tracking-tight">
          subterra
        </span>
      </div>

      <nav className="flex-1 py-2">
        <div className="px-5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#555568]">
            Main
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-5 py-2 text-sm transition-colors ${
                isActive
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-[#8888a0] hover:text-[#e8e8ed] hover:bg-[#1a1a24]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="px-5 mt-6 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#555568]">
            Configure
          </span>
        </div>
        {configItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2.5 px-5 py-2 text-sm text-[#8888a0] hover:text-[#e8e8ed] hover:bg-[#1a1a24] transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-[#2a2a38]">
        <UserButton />
      </div>
    </aside>
  );
}
