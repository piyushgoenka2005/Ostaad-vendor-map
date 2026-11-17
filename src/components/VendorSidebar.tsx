"use client";

import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Radar,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { getCategoryMeta } from "@/lib/categories";
import type { VendorRecord } from "@/types/vendor";

export type VerificationFilter = "all" | "verified" | "pending";
export type CoverageRadiusKm = 0 | 5 | 10 | 15;

interface CategoryOption {
  name: string;
  color: string;
  count: number;
}

interface VendorSidebarProps {
  vendors: VendorRecord[];
  totalVendorCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryOptions: CategoryOption[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  verificationFilter: VerificationFilter;
  onVerificationFilterChange: (filter: VerificationFilter) => void;
  coverageRadiusKm: CoverageRadiusKm;
  onCoverageRadiusChange: (km: CoverageRadiusKm) => void;
  selectedVendorId: string | null;
  onSelectVendor: (vendor: VendorRecord) => void;
  onResetFilters: () => void;
}

const RADIUS_OPTIONS: Array<{ value: CoverageRadiusKm; label: string }> = [
  { value: 0, label: "Off" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 15, label: "15 km" },
];

export function VendorSidebar({
  vendors,
  totalVendorCount,
  searchQuery,
  onSearchChange,
  categoryOptions,
  selectedCategory,
  onSelectCategory,
  verificationFilter,
  onVerificationFilterChange,
  coverageRadiusKm,
  onCoverageRadiusChange,
  selectedVendorId,
  onSelectVendor,
  onResetFilters,
}: VendorSidebarProps) {
  const hasActiveFilters =
    Boolean(searchQuery.trim()) || selectedCategory !== null || verificationFilter !== "all";

  return (
    <aside className="flex h-full w-full flex-col border-r border-[#EAE4DE] bg-[#FAF7F4]">
      {/* Filter Controls Section */}
      <div className="shrink-0 space-y-3 border-b border-[#EAE4DE] bg-white p-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#23384F]/45" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search business, owner, phone, pincode, hub..."
            className="w-full rounded-xl border border-[#EAE4DE] bg-[#FAF7F4]/70 py-2 pl-9 pr-8 text-xs text-[#23384F] placeholder:text-[#23384F]/45 focus:border-[#9B4E27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9B4E27]/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#23384F]/50 hover:bg-[#EAE4DE] hover:text-[#23384F]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Verification & Coverage Radius Row */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
          {/* Verification Filter */}
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#23384F]/55">
              Verification Status
            </p>
            <div className="grid grid-cols-3 rounded-lg border border-[#EAE4DE] bg-[#FAF7F4] p-0.5">
              {(["all", "verified", "pending"] as const).map((status) => {
                const active = verificationFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onVerificationFilterChange(status)}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold capitalize transition ${
                      active
                        ? "bg-[#23384F] text-white shadow-2xs"
                        : "text-[#23384F]/70 hover:text-[#23384F]"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Coverage Radius Selector */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#23384F]/55">
                <Radar className="h-3 w-3 text-[#9B4E27]" />
                Delivery Coverage Radius
              </p>
              {coverageRadiusKm > 0 && (
                <span className="text-[10px] font-medium text-[#9B4E27]">
                  {coverageRadiusKm} km rings active
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 rounded-lg border border-[#EAE4DE] bg-[#FAF7F4] p-0.5">
              {RADIUS_OPTIONS.map((opt) => {
                const active = coverageRadiusKm === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onCoverageRadiusChange(opt.value)}
                    className={`rounded-md px-1.5 py-1 text-[11px] font-semibold transition ${
                      active
                        ? "bg-[#9B4E27] text-white shadow-2xs"
                        : "text-[#23384F]/70 hover:text-[#23384F]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#23384F]/55">
              Trade Categories
            </p>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className="text-[10px] font-semibold text-[#9B4E27] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto ostaad-scroll pr-0.5">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                selectedCategory === null
                  ? "border-[#23384F] bg-[#23384F] text-white"
                  : "border-[#EAE4DE] bg-[#FAF7F4] text-[#23384F]/80 hover:border-[#23384F]/30"
              }`}
            >
              All
              <span className="opacity-70">{totalVendorCount}</span>
            </button>
            {categoryOptions.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => onSelectCategory(active ? null : cat.name)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    active
                      ? "border-[#23384F] bg-[#23384F] text-white shadow-2xs"
                      : "border-[#EAE4DE] bg-white text-[#23384F] hover:border-[#9B4E27]/40 hover:bg-[#FAF7F4]"
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="max-w-[130px] truncate">{cat.name}</span>
                  <span className={active ? "text-white/75" : "text-[#23384F]/50"}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Directory Count Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#EAE4DE] bg-[#FAF7F4] px-3.5 py-2 text-[11px]">
        <span className="font-medium text-[#23384F]/75">
          Showing <strong className="text-[#23384F]">{vendors.length}</strong> of{" "}
          {totalVendorCount} vendors
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="font-semibold text-[#9B4E27] hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Scrollable Vendor Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3 ostaad-scroll">
        {vendors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#EAE4DE] bg-white p-6 text-center">
            <p className="text-xs font-semibold text-[#23384F]">No matching vendors</p>
            <p className="mt-1 text-[11px] text-[#23384F]/60">
              Try clearing your search or selecting a different trade category.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-3 rounded-lg bg-[#23384F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1B2C3F]"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          vendors.map((vendor) => {
            const selected = vendor.id === selectedVendorId;
            const catMeta = getCategoryMeta(vendor.primaryCategory);

            return (
              <button
                key={vendor.id}
                type="button"
                onClick={() => onSelectVendor(vendor)}
                className={`group block w-full rounded-xl border p-3 text-left transition ${
                  selected
                    ? "border-[#9B4E27] bg-white shadow-sm ring-1 ring-[#9B4E27]/25"
                    : "border-[#EAE4DE] bg-white hover:border-[#9B4E27]/45 hover:shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: catMeta.color }}
                      />
                      <h3 className="truncate text-xs font-bold text-[#23384F] group-hover:text-[#9B4E27]">
                        {vendor.businessName}
                      </h3>
                    </div>
                    <p className="mt-0.5 truncate pl-4 text-[11px] text-[#23384F]/65">
                      {vendor.ownerName}
                    </p>
                  </div>

                  {vendor.verificationStatus === "verified" ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  ) : vendor.verificationStatus === "rejected" ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200/80">
                      <XCircle className="h-3 w-3" />
                      Rejected
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200/80">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>

                {/* Hub & Product Count */}
                <div className="mt-2 flex items-center justify-between gap-2 pl-4 text-[11px] text-[#23384F]/70">
                  <span className="flex min-w-0 items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-[#9B4E27]/80" />
                    <span className="truncate">
                      {vendor.hubLabel}
                      {vendor.pincode ? ` • ${vendor.pincode}` : ""}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#FAF7F4] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#23384F] ring-1 ring-[#EAE4DE]">
                    <Package className="h-2.5 w-2.5 text-[#9B4E27]" />
                    {vendor.productCount}
                  </span>
                </div>

                {/* Category Tags */}
                <div className="mt-2 flex flex-wrap gap-1 pl-4">
                  {vendor.categories.slice(0, 3).map((cat) => {
                    const meta = getCategoryMeta(cat);
                    return (
                      <span
                        key={cat}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: meta.bgTint,
                          color: meta.color,
                        }}
                      >
                        {cat}
                      </span>
                    );
                  })}
                  {vendor.categories.length > 3 && (
                    <span className="rounded-md bg-[#FAF7F4] px-1.5 py-0.5 text-[10px] text-[#23384F]/60">
                      +{vendor.categories.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
