"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { Layers, Maximize2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { getCategoryMeta } from "@/lib/categories";
import type { VendorRecord } from "@/types/vendor";
import type { CoverageRadiusKm } from "@/components/VendorSidebar";
import { VendorDetailDrawer } from "@/components/VendorDetailDrawer";

interface VendorMapProps {
  vendors: VendorRecord[];
  selectedVendor: VendorRecord | null;
  flyToNonce: number;
  coverageRadiusKm: CoverageRadiusKm;
  sidebarOpen: boolean;
  onSelectVendor: (vendor: VendorRecord | null) => void;
}

const KOLKATA_CENTER: [number, number] = [22.555, 88.385];
const DEFAULT_ZOOM = 12;

type TileStyle = "voyager" | "osm";

const TILE_LAYERS: Record<TileStyle, { url: string; attribution: string; label: string }> = {
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    label: "Voyager",
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    label: "OSM",
  },
};

function createPinIcon(color: string, isVerified: boolean, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 40 : 32;
  const height = isSelected ? 48 : 38;

  const verifiedBadge = isVerified
    ? `<span style="
        position:absolute;
        top:-3px;
        right:-3px;
        width:14px;
        height:14px;
        border-radius:9999px;
        background:#16A34A;
        border:2px solid #FFFFFF;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 1px 3px rgba(0,0,0,0.25);
      ">
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.3L4.8 8.6L9.5 3.6" stroke="#FFFFFF" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>`
    : "";

  const pulseRing = isSelected
    ? `<span class="ostaad-pin-pulse" style="
        position:absolute;
        top:4px;
        left:4px;
        width:${size - 8}px;
        height:${size - 8}px;
        border-radius:9999px;
        border:2.5px solid ${color};
        pointer-events:none;
      "></span>`
    : "";

  const html = `
    <div style="position:relative;width:${size}px;height:${height}px;display:flex;align-items:center;justify-content:center;">
      ${pulseRing}
      <svg width="${size}" height="${height}" viewBox="0 0 36 44" fill="none" style="filter:drop-shadow(0 3px 5px rgba(35,56,79,0.34));">
        <path d="M18 2C9.716 2 3 8.716 3 17C3 27.5 18 42 18 42C18 42 33 27.5 33 17C33 8.716 26.284 2 18 2Z"
          fill="${color}"
          stroke="${isSelected ? "#23384F" : "#FFFFFF"}"
          stroke-width="${isSelected ? "3" : "2.4"}"
        />
        <circle cx="18" cy="16.5" r="5.5" fill="#FFFFFF" fill-opacity="0.95" />
        <circle cx="18" cy="16.5" r="2.4" fill="${color}" />
      </svg>
      ${verifiedBadge}
    </div>
  `;

  return L.divIcon({
    html,
    className: "ostaad-pin-wrapper",
    iconSize: [size, height],
    iconAnchor: [size / 2, height - 2],
    tooltipAnchor: [0, -(height - 6)],
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function VendorMap({
  vendors,
  selectedVendor,
  flyToNonce,
  coverageRadiusKm,
  sidebarOpen,
  onSelectVendor,
}: VendorMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);
  const hasFittedInitialRef = useRef(false);

  const [tileStyle, setTileStyle] = useState<TileStyle>("voyager");
  const [legendOpen, setLegendOpen] = useState(true);

  const legendEntries = useMemo(() => {
    const map = new Map<string, { label: string; color: string; count: number }>();
    for (const v of vendors) {
      const meta = getCategoryMeta(v.primaryCategory);
      const existing = map.get(meta.label);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(meta.label, { label: meta.label, color: meta.color, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [vendors]);

  // 1. Initialize Leaflet map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: KOLKATA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tile = L.tileLayer(TILE_LAYERS.voyager.url, {
      attribution: TILE_LAYERS.voyager.attribution,
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    const circlesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    map.on("click", () => {
      onSelectVendor(null);
    });

    mapRef.current = map;
    tileLayerRef.current = tile;
    circlesLayerRef.current = circlesLayer;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      circlesLayerRef.current = null;
      markersLayerRef.current = null;
      hasFittedInitialRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Switch basemap tile layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_LAYERS[tileStyle];
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 19,
      subdomains: tileStyle === "voyager" ? "abcd" : "abc",
    }).addTo(map);
  }, [tileStyle]);

  // 3. Invalidate map size when sidebar opens or closes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 240);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  // 4. Render vendor pins and coverage circles whenever vendors, selection, or radius changes
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    const circlesLayer = circlesLayerRef.current;
    if (!map || !markersLayer || !circlesLayer) return;

    markersLayer.clearLayers();
    circlesLayer.clearLayers();

    const radiusMeters = coverageRadiusKm * 1000;

    for (const vendor of vendors) {
      const meta = getCategoryMeta(vendor.primaryCategory);
      const isSelected = selectedVendor?.id === vendor.id;

      if (radiusMeters > 0) {
        L.circle([vendor.lat, vendor.lng], {
          radius: radiusMeters,
          color: meta.color,
          weight: isSelected ? 2 : 1.1,
          opacity: isSelected ? 0.65 : 0.35,
          fillColor: meta.color,
          fillOpacity: isSelected ? 0.16 : 0.08,
          interactive: false,
        }).addTo(circlesLayer);
      }

      const marker = L.marker([vendor.lat, vendor.lng], {
        icon: createPinIcon(meta.color, vendor.isVerified, isSelected),
        zIndexOffset: isSelected ? 1000 : vendor.isVerified ? 100 : 0,
      });

      marker.bindTooltip(
        `<div style="font-size:11px;line-height:1.35;">
          <div style="font-weight:700;color:#23384F;">${escapeHtml(vendor.businessName)}</div>
          <div style="color:#64748B;">${escapeHtml(vendor.primaryCategory)} • ${escapeHtml(vendor.hubLabel)}</div>
        </div>`,
        {
          direction: "top",
          opacity: 0.96,
        }
      );

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectVendor(vendor);
      });

      marker.addTo(markersLayer);
    }

    // Fit map bounds once on initial load
    if (!hasFittedInitialRef.current && vendors.length > 0) {
      hasFittedInitialRef.current = true;
      const bounds = L.latLngBounds(vendors.map((v) => [v.lat, v.lng] as [number, number]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
      }
    }
  }, [vendors, selectedVendor, coverageRadiusKm, onSelectVendor]);

  // 5. Smooth flyTo when selecting a vendor
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedVendor) return;

    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, 14);
    map.flyTo([selectedVendor.lat, selectedVendor.lng], targetZoom, {
      duration: 0.65,
      easeLinearity: 0.25,
    });
  }, [selectedVendor, flyToNonce]);

  function handleFitAll() {
    const map = mapRef.current;
    if (!map) return;

    if (vendors.length === 0) {
      map.flyTo(KOLKATA_CENTER, DEFAULT_ZOOM, { duration: 0.5 });
      return;
    }

    const bounds = L.latLngBounds(vendors.map((v) => [v.lat, v.lng] as [number, number]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 13, animate: true });
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#F2EDE7]">
      {/* Leaflet Canvas */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Top-Left Floating Map Controls */}
      <div className="pointer-events-none absolute left-3 top-3 z-[400] flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleFitAll}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-[#EAE4DE] bg-white/95 px-3 py-2 text-xs font-semibold text-[#23384F] shadow-md backdrop-blur-xs transition hover:border-[#9B4E27]/50 hover:text-[#9B4E27]"
        >
          <Maximize2 className="h-3.5 w-3.5 text-[#9B4E27]" />
          Fit All Vendors ({vendors.length})
        </button>

        <button
          type="button"
          onClick={() => setTileStyle((prev) => (prev === "voyager" ? "osm" : "voyager"))}
          title="Switch map tile style between CartoDB Voyager and OpenStreetMap"
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-[#EAE4DE] bg-white/95 px-3 py-2 text-xs font-medium text-[#23384F] shadow-md backdrop-blur-xs transition hover:border-[#9B4E27]/50 hover:text-[#9B4E27]"
        >
          <Layers className="h-3.5 w-3.5 text-[#23384F]/70" />
          Map: <span className="font-semibold">{TILE_LAYERS[tileStyle].label}</span>
        </button>
      </div>

      {/* Bottom-Left Floating Map Legend */}
      <div className="pointer-events-auto absolute bottom-3 left-3 z-[400] max-w-[240px] rounded-2xl border border-[#EAE4DE] bg-white/95 shadow-lg backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setLegendOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#23384F]">
            Map Legend
          </span>
          {legendOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-[#23384F]/60" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-[#23384F]/60" />
          )}
        </button>

        {legendOpen && (
          <div className="border-t border-[#EAE4DE] px-3 py-2.5 text-[11px]">
            <div className="max-h-36 space-y-1.5 overflow-y-auto ostaad-scroll pr-1">
              {legendEntries.length === 0 ? (
                <p className="text-[#23384F]/55">No visible pins</p>
              ) : (
                legendEntries.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/15"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate font-medium text-[#23384F]">{item.label}</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#23384F]/55">{item.count}</span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-2.5 space-y-1 border-t border-[#EAE4DE] pt-2 text-[10px] text-[#23384F]/70">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Green check badge = Verified vendor</span>
              </div>
              {coverageRadiusKm > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full border border-[#9B4E27] bg-[#9B4E27]/20" />
                  <span>{coverageRadiusKm} km delivery coverage ring</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rich Selected Vendor Detail Drawer */}
      <VendorDetailDrawer
        vendor={selectedVendor}
        onClose={() => onSelectVendor(null)}
      />
    </div>
  );
}
