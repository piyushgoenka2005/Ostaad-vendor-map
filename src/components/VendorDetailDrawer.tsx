"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Navigation,
  Package,
  Phone,
  X,
  XCircle,
} from "lucide-react";
import { getCategoryMeta } from "@/lib/categories";
import type { VendorRecord } from "@/types/vendor";

interface VendorDetailDrawerProps {
  vendor: VendorRecord | null;
  onClose: () => void;
}

const ACCURACY_STYLES = {
  exact: {
    label: "Exact",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  locality: {
    label: "Locality",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  approximate: {
    label: "Approximate",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
} as const;

export function VendorDetailDrawer({ vendor, onClose }: VendorDetailDrawerProps) {
  const [copiedGstin, setCopiedGstin] = useState(false);

  if (!vendor) return null;

  const primaryMeta = getCategoryMeta(vendor.primaryCategory);
  const accuracyBadge = ACCURACY_STYLES[vendor.geocodeAccuracy];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${vendor.businessName}, ${vendor.address}, ${vendor.city}`
  )}`;

  async function copyGstin() {
    if (!vendor?.gstin) return;
    try {
      await navigator.clipboard.writeText(vendor.gstin);
      setCopiedGstin(true);
      setTimeout(() => setCopiedGstin(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  }

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-[500] max-h-[68vh] overflow-y-auto rounded-2xl border border-[#EAE4DE] bg-white shadow-xl sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:w-[370px] sm:max-h-[calc(100%-2rem)] ostaad-scroll">
      {/* Accent Header Band */}
      <div
        className="h-1.5 w-full rounded-t-2xl"
        style={{ backgroundColor: primaryMeta.color }}
      />

      <div className="p-4">
        {/* Title & Close */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {vendor.verificationStatus === "verified" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Vendor
                </span>
              ) : vendor.verificationStatus === "rejected" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">
                  <XCircle className="h-3 w-3" />
                  Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
                  <Clock className="h-3 w-3" />
                  Pending Verification
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${accuracyBadge.className}`}
                title={`Geocode source: ${vendor.geocodeSource}`}
              >
                <Navigation className="h-2.5 w-2.5" />
                {accuracyBadge.label}
              </span>
            </div>

            <h2 className="mt-2 text-base font-bold leading-snug text-[#23384F]">
              {vendor.businessName}
            </h2>
            <p className="mt-0.5 text-xs text-[#23384F]/65">
              Owner: <span className="font-medium text-[#23384F]">{vendor.ownerName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close vendor details"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#EAE4DE] bg-[#FAF7F4] text-[#23384F]/70 transition hover:bg-[#EAE4DE] hover:text-[#23384F]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Categories & Active Product Count */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4] px-3 py-2">
          <div className="flex flex-wrap gap-1.5">
            {vendor.categories.map((cat) => {
              const meta = getCategoryMeta(cat);
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    backgroundColor: meta.bgTint,
                    color: meta.color,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {cat}
                </span>
              );
            })}
          </div>
          <div className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#23384F] ring-1 ring-[#EAE4DE]">
            <Package className="h-3.5 w-3.5 text-[#9B4E27]" />
            {vendor.productCount}
            <span className="text-[10px] font-medium text-[#23384F]/60">active</span>
          </div>
        </div>

        {/* Contact & GSTIN Details */}
        <div className="mt-3 space-y-2 text-xs">
          {vendor.phone && (
            <a
              href={`tel:${vendor.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2.5 rounded-lg border border-[#EAE4DE] bg-white px-3 py-2 text-[#23384F] transition hover:border-[#9B4E27]/50 hover:bg-[#FAF7F4]"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-[#9B4E27]" />
              <span className="font-mono font-medium">{vendor.phone}</span>
              <span className="ml-auto text-[10px] font-semibold text-[#9B4E27]">Call</span>
            </a>
          )}

          {vendor.email && (
            <a
              href={`mailto:${vendor.email}`}
              className="flex items-center gap-2.5 rounded-lg border border-[#EAE4DE] bg-white px-3 py-2 text-[#23384F] transition hover:border-[#9B4E27]/50 hover:bg-[#FAF7F4]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#23384F]/70" />
              <span className="truncate font-medium">{vendor.email}</span>
              <span className="ml-auto shrink-0 text-[10px] font-semibold text-[#23384F]/65">
                Email
              </span>
            </a>
          )}

          {vendor.gstin && (
            <div className="flex items-center gap-2.5 rounded-lg border border-[#EAE4DE] bg-[#FAF7F4]/60 px-3 py-2 text-[#23384F]">
              <FileText className="h-3.5 w-3.5 shrink-0 text-[#23384F]/60" />
              <span className="text-[11px] text-[#23384F]/60">GSTIN</span>
              <span className="font-mono font-semibold">{vendor.gstin}</span>
              <button
                type="button"
                onClick={copyGstin}
                className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-[#23384F]/70 hover:bg-[#EAE4DE]"
              >
                {copiedGstin ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Full Address + Open in Google Maps */}
        <div className="mt-3 rounded-xl border border-[#EAE4DE] bg-[#FAF7F4]/70 p-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9B4E27]" />
            <div className="min-w-0 flex-1 text-xs leading-relaxed text-[#23384F]">
              <p className="font-medium">{vendor.address}</p>
              <p className="mt-0.5 text-[11px] text-[#23384F]/65">
                Hub: {vendor.hubLabel} • {vendor.city}
                {vendor.pincode ? ` • ${vendor.pincode}` : ""}
              </p>
              <p className="mt-1 font-mono text-[10px] text-[#23384F]/50">
                {vendor.lat.toFixed(5)}, {vendor.lng.toFixed(5)}
              </p>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#23384F] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1A2B3D]"
          >
            Open in Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Description if available */}
        {vendor.description && (
          <p className="mt-3 text-xs leading-relaxed text-[#23384F]/75">
            {vendor.description}
          </p>
        )}
      </div>
    </div>
  );
}
