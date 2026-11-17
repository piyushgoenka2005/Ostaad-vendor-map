export interface CategoryMeta {
  key: string;
  label: string;
  color: string;
  bgTint: string;
  borderTint: string;
  keywords: string[];
}

export const CATEGORY_CATALOG: CategoryMeta[] = [
  {
    key: "electrical",
    label: "Electrical",
    color: "#D97706",
    bgTint: "#FEF3C7",
    borderTint: "#F59E0B",
    keywords: ["electrical", "electric", "lighting", "wire", "cable", "switch", "fan", "solar"],
  },
  {
    key: "plywood",
    label: "Plywood & Laminates",
    color: "#9B4E27",
    bgTint: "#F9EAE2",
    borderTint: "#C87D55",
    keywords: ["plywood", "laminate", "veneer", "timber", "wood", "mdf", "flush door", "board"],
  },
  {
    key: "cement",
    label: "Cement",
    color: "#475569",
    bgTint: "#F1F5F9",
    borderTint: "#94A3B8",
    keywords: ["cement", "concrete", "rmc", "sand", "brick", "aggregate", "aac", "block", "masonry"],
  },
  {
    key: "plumbing",
    label: "Plumbing & Pipes",
    color: "#0284C7",
    bgTint: "#E0F2FE",
    borderTint: "#38BDF8",
    keywords: ["plumbing", "pipe", "sanitary", "bath", "faucet", "water tank", "pump", "cpvc", "upvc"],
  },
  {
    key: "pest-control",
    label: "Pest Control",
    color: "#15803D",
    bgTint: "#DCFCE7",
    borderTint: "#4ADE80",
    keywords: ["pest", "termite", "anti-termite", "fumigation", "waterproofing"],
  },
  {
    key: "glass-aluminium",
    label: "Glass & Aluminium",
    color: "#0D9488",
    bgTint: "#CCFBF1",
    borderTint: "#2DD4BF",
    keywords: ["glass", "aluminium", "aluminum", "upvc window", "facade", "glazing", "mirror", "acp"],
  },
  {
    key: "roofing",
    label: "Roofing",
    color: "#B91C1C",
    bgTint: "#FEE2E2",
    borderTint: "#F87171",
    keywords: ["roofing", "roof", "sheet", "truss", "shed", "shingle", "steel", "tmt"],
  },
  {
    key: "hardware",
    label: "Hardware",
    color: "#6D28D9",
    bgTint: "#EDE9FE",
    borderTint: "#A78BFA",
    keywords: ["hardware", "lock", "hinge", "fastener", "tool", "adhesive", "fitting", "door"],
  },
  {
    key: "paint",
    label: "Paints & Finishes",
    color: "#BE185D",
    bgTint: "#FCE7F3",
    borderTint: "#F472B6",
    keywords: ["paint", "putty", "primer", "polish", "coating", "texture", "finish"],
  },
  {
    key: "tiles-stone",
    label: "Tiles & Stone",
    color: "#0E7490",
    bgTint: "#CFFAFE",
    borderTint: "#22D3EE",
    keywords: ["tile", "marble", "granite", "stone", "flooring", "ceramic", "vitrified"],
  },
];

export const DEFAULT_CATEGORY_META: CategoryMeta = {
  key: "other",
  label: "General Supply",
  color: "#23384F",
  bgTint: "#E8EEF4",
  borderTint: "#64748B",
  keywords: [],
};

export function getCategoryMeta(categoryName: string): CategoryMeta {
  const normalized = categoryName.trim().toLowerCase();
  if (!normalized) return DEFAULT_CATEGORY_META;

  for (const meta of CATEGORY_CATALOG) {
    if (meta.label.toLowerCase() === normalized || meta.key === normalized) {
      return meta;
    }
  }

  for (const meta of CATEGORY_CATALOG) {
    if (meta.keywords.some((kw) => normalized.includes(kw))) {
      return meta;
    }
  }

  return DEFAULT_CATEGORY_META;
}

export function getCategoryColor(categoryName: string): string {
  return getCategoryMeta(categoryName).color;
}

export function parseCategoriesJson(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
        .filter(Boolean);
    }
    if (typeof parsed === "string" && parsed.trim()) {
      return [parsed.trim()];
    }
  } catch {
    // Fallback for comma-separated values if any legacy row isn't strict JSON
    return trimmed
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((s) => s.replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);
  }

  return [];
}
