"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Compass, ListFilter, Map as MapIcon } from "lucide-react";
import { getCategoryMeta } from "@/lib/categories";
import { downloadVendorsCsv } from "@/lib/csv";
import type { VendorRecord, VendorsApiResponse, VendorStats } from "@/types/vendor";
import { HeaderBar } from "@/components/HeaderBar";
import {
  VendorSidebar,
  type CoverageRadiusKm,
  type VerificationFilter,
} from "@/components/VendorSidebar";

const VendorMap = dynamic(() => import("@/components/VendorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#F2EDE7] text-[#23384F]/70">
      <Compass className="h-8 w-8 animate-spin text-[#9B4E27]" />
      <p className="text-xs font-medium">Loading Kolkata &amp; West Bengal map tiles...</p>
    </div>
  ),
});

interface OpsDashboardProps {
  initialData: VendorsApiResponse | null;
  initialError?: string | null;
  d1Configured: boolean;
  devMode: boolean;
}

const EMPTY_STATS: VendorStats = {
  totalVendors: 0,
  verifiedCount: 0,
  pendingCount: 0,
  rejectedCount: 0,
  totalProducts: 0,
  coveredHubs: 0,
};

export function OpsDashboard({
  initialData,
  initialError,
  d1Configured,
  devMode,
}: OpsDashboardProps) {
  const [vendors, setVendors] = useState<VendorRecord[]>(initialData?.vendors ?? []);
  const [stats, setStats] = useState<VendorStats>(initialData?.stats ?? EMPTY_STATS);
  const [mode, setMode] = useState<"live" | "demo">(
    initialData?.mode ?? (d1Configured ? "live" : "demo")
  );
  const [syncedAt, setSyncedAt] = useState<string | null>(initialData?.syncedAt ?? null);
  const [bannerWarning, setBannerWarning] = useState<string | null>(
    initialData?.warning ?? null
  );
  const [syncError, setSyncError] = useState<string | null>(initialError ?? null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Interactive filters & UI state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [coverageRadiusKm, setCoverageRadiusKm] = useState<CoverageRadiusKm>(0);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [flyToNonce, setFlyToNonce] = useState(0);

  const syncVendors = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const res = await fetch("/api/vendors", { cache: "no-store" });
      if (res.status === 401) {
        window.location.reload();
        return;
      }

      const data = (await res.json()) as VendorsApiResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Sync failed (HTTP ${res.status})`);
      }

      setVendors(data.vendors);
      setStats(data.stats);
      setMode(data.mode);
      setSyncedAt(data.syncedAt);
      setBannerWarning(data.warning ?? null);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Failed to sync live vendors.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Poll every 60 seconds when Auto-Refresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void syncVendors();
    }, 60_000);
    return () => clearInterval(interval);
  }, [autoRefresh, syncVendors]);

  // Build category filter options with colors and counts
  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const vendor of vendors) {
      const seenForVendor = new Set<string>();
      for (const cat of vendor.categories) {
        if (!seenForVendor.has(cat)) {
          seenForVendor.add(cat);
          counts.set(cat, (counts.get(cat) ?? 0) + 1);
        }
      }
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        color: getCategoryMeta(name).color,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [vendors]);

  // Apply search, category, and verification filters
  const filteredVendors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return vendors.filter((v) => {
      if (verificationFilter === "verified" && v.verificationStatus !== "verified") {
        return false;
      }
      if (verificationFilter === "pending" && v.verificationStatus !== "pending") {
        return false;
      }
      if (selectedCategory && !v.categories.includes(selectedCategory)) {
        return false;
      }

      if (q) {
        const haystack = [
          v.businessName,
          v.ownerName,
          v.phone,
          v.email,
          v.gstin,
          v.address,
          v.city,
          v.hubLabel,
          v.pincode ?? "",
          ...v.categories,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [vendors, searchQuery, selectedCategory, verificationFilter]);

  const selectedVendor = useMemo(
    () => filteredVendors.find((v) => v.id === selectedVendorId) ?? null,
    [filteredVendors, selectedVendorId]
  );

  const handleSelectVendorFromSidebar = useCallback((vendor: VendorRecord) => {
    setSelectedVendorId(vendor.id);
    setFlyToNonce((n) => n + 1);
    setMobileView("map");
  }, []);

  const handleSelectVendorFromMap = useCallback((vendor: VendorRecord | null) => {
    setSelectedVendorId(vendor?.id ?? null);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory(null);
    setVerificationFilter("all");
  }, []);

  const handleExportCsv = useCallback(() => {
    downloadVendorsCsv(filteredVendors);
  }, [filteredVendors]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#FAF7F4]">
      {/* Top Ops Header */}
      <HeaderBar
        stats={stats}
        filteredCount={filteredVendors.length}
        mode={mode}
        devMode={devMode}
        syncedAt={syncedAt}
        isSyncing={isSyncing}
        autoRefresh={autoRefresh}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onToggleAutoRefresh={() => setAutoRefresh((a) => !a)}
        onSyncNow={() => void syncVendors()}
        onExportCsv={handleExportCsv}
        onLogout={() => void handleLogout()}
      />

      {/* Demo Mode / Sync Error Banner */}
      {(bannerWarning || syncError) && (
        <div
          className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2 text-xs ${
            syncError
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50/90 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{syncError ?? bannerWarning}</span>
          </div>
          {syncError && (
            <button
              type="button"
              onClick={() => void syncVendors()}
              className="shrink-0 rounded-md bg-red-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-800"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Mobile Map / Directory Toggle Bar */}
      <div className="flex shrink-0 border-b border-[#EAE4DE] bg-white p-1.5 lg:hidden">
        <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-[#FAF7F4] p-0.5">
          <button
            type="button"
            onClick={() => setMobileView("map")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
              mobileView === "map"
                ? "bg-[#23384F] text-white"
                : "text-[#23384F]/70 hover:text-[#23384F]"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            Coverage Map
          </button>
          <button
            type="button"
            onClick={() => setMobileView("list")}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition ${
              mobileView === "list"
                ? "bg-[#23384F] text-white"
                : "text-[#23384F]/70 hover:text-[#23384F]"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            Directory ({filteredVendors.length})
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Collapsible Left Sidebar / Mobile List View */}
        <div
          className={`${
            mobileView === "list" ? "block w-full" : "hidden"
          } lg:block lg:shrink-0 lg:transition-all lg:duration-200 ${
            sidebarOpen ? "lg:w-[370px] xl:w-[395px]" : "lg:w-0 lg:overflow-hidden"
          }`}
        >
          <VendorSidebar
            vendors={filteredVendors}
            totalVendorCount={vendors.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryOptions={categoryOptions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            verificationFilter={verificationFilter}
            onVerificationFilterChange={setVerificationFilter}
            coverageRadiusKm={coverageRadiusKm}
            onCoverageRadiusChange={setCoverageRadiusKm}
            selectedVendorId={selectedVendorId}
            onSelectVendor={handleSelectVendorFromSidebar}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Full-Height Interactive Map */}
        <main
          className={`${
            mobileView === "map" ? "block" : "hidden"
          } relative min-w-0 flex-1 lg:block`}
        >
          <VendorMap
            vendors={filteredVendors}
            selectedVendor={selectedVendor}
            flyToNonce={flyToNonce}
            coverageRadiusKm={coverageRadiusKm}
            sidebarOpen={sidebarOpen}
            onSelectVendor={handleSelectVendorFromMap}
          />
        </main>
      </div>
    </div>
  );
}
