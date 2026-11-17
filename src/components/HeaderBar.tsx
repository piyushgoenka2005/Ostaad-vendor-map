"use client";

import {
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  LogOut,
  MapPin,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  RefreshCw,
} from "lucide-react";
import type { VendorStats } from "@/types/vendor";

interface HeaderBarProps {
  stats: VendorStats;
  filteredCount: number;
  mode: "live" | "demo";
  devMode: boolean;
  syncedAt: string | null;
  isSyncing: boolean;
  autoRefresh: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onToggleAutoRefresh: () => void;
  onSyncNow: () => void;
  onExportCsv: () => void;
  onLogout: () => void;
}

function formatSyncTime(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return "Just now";
  }
}

export function HeaderBar({
  stats,
  filteredCount,
  mode,
  devMode,
  syncedAt,
  isSyncing,
  autoRefresh,
  sidebarOpen,
  onToggleSidebar,
  onToggleAutoRefresh,
  onSyncNow,
  onExportCsv,
  onLogout,
}: HeaderBarProps) {
  return (
    <header className="z-30 shrink-0 border-b border-[#EAE4DE] bg-white/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 lg:px-5">
        {/* Left: Sidebar toggle + Brand */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleSidebar}
            title={sidebarOpen ? "Collapse directory sidebar" : "Expand directory sidebar"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAE4DE] bg-[#FAF7F4] text-[#23384F] transition hover:border-[#9B4E27]/40 hover:text-[#9B4E27]"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#23384F] text-[#FAF7F4] shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-[#23384F] sm:text-base">
                  Ostaad Vendor Coverage Map
                </h1>
                <span
                  className={`hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-flex ${
                    mode === "live"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      mode === "live" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  {mode === "live" ? "Live D1" : "Demo Data"}
                </span>
                {devMode && (
                  <span className="hidden rounded-full bg-[#FAF7F4] px-2 py-0.5 text-[10px] font-medium text-[#23384F]/70 ring-1 ring-[#EAE4DE] xl:inline-flex">
                    Dev Mode (No Gate)
                  </span>
                )}
              </div>
              <p className="hidden text-[11px] text-[#23384F]/60 sm:block">
                Kolkata &amp; West Bengal Supply Network • Last synced {formatSyncTime(syncedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live KPI Pills */}
        <div className="order-3 flex w-full items-center gap-2 overflow-x-auto pb-0.5 xl:order-2 xl:w-auto xl:pb-0">
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EAE4DE] bg-[#FAF7F4] px-2.5 py-1.5 text-xs">
            <Building2 className="h-3.5 w-3.5 text-[#9B4E27]" />
            <span className="font-semibold text-[#23384F]">{stats.totalVendors}</span>
            <span className="text-[#23384F]/65">Vendors</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EAE4DE] bg-[#FAF7F4] px-2.5 py-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold text-emerald-700">{stats.verifiedCount}</span>
            <span className="text-[#23384F]/40">/</span>
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span className="font-semibold text-amber-700">{stats.pendingCount}</span>
            <span className="hidden text-[#23384F]/65 sm:inline">Ver / Pend</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EAE4DE] bg-[#FAF7F4] px-2.5 py-1.5 text-xs">
            <Package className="h-3.5 w-3.5 text-[#23384F]" />
            <span className="font-semibold text-[#23384F]">{stats.totalProducts}</span>
            <span className="text-[#23384F]/65">Products</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EAE4DE] bg-[#FAF7F4] px-2.5 py-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 text-[#9B4E27]" />
            <span className="font-semibold text-[#23384F]">{stats.coveredHubs}</span>
            <span className="text-[#23384F]/65">Hubs</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="order-2 flex items-center gap-1.5 xl:order-3">
          <button
            type="button"
            onClick={onToggleAutoRefresh}
            title="Auto-refresh live D1 vendors every 60 seconds"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              autoRefresh
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-[#EAE4DE] bg-white text-[#23384F]/75 hover:bg-[#FAF7F4]"
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${autoRefresh ? "animate-pulse text-emerald-600" : ""}`} />
            <span className="hidden md:inline">Auto 60s</span>
          </button>

          <button
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#23384F] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1A2B3D] disabled:opacity-65"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync Live Now"}</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            title={`Export ${filteredCount} visible vendors as CSV (Excel & Google My Maps ready)`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EAE4DE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#23384F] transition hover:border-[#9B4E27]/40 hover:bg-[#FAF7F4] hover:text-[#9B4E27]"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {!devMode && (
            <button
              type="button"
              onClick={onLogout}
              title="Lock ops dashboard"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAE4DE] bg-white text-[#23384F]/70 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
