import type { RawVendorRow, VendorRecord, VendorStats, VerificationStatus } from "@/types/vendor";
import { parseCategoriesJson } from "@/lib/categories";
import { DEMO_VENDOR_ROWS } from "@/lib/demo-data";
import { applyColocationJitter, geocodeAddress } from "@/lib/geocode";

const DEFAULT_D1_DATABASE_ID = "8363bc75-2f49-4b66-95c3-8b5968c9936b";

export const LIVE_VENDORS_SQL = `
SELECT
  v.id,
  v.businessName,
  v.ownerName,
  v.email,
  v.phone,
  v.gstin,
  v.city,
  v.address,
  v.categoriesJson,
  v.description,
  v.verificationStatus,
  v.isVerified,
  v.createdAt,
  COUNT(p.id) AS productCount
FROM vendors v
LEFT JOIN products p ON p.vendorId = v.id AND p.isDeleted = 0
GROUP BY v.id
ORDER BY v.createdAt DESC;
`.trim();

interface CloudflareD1QueryResult<T> {
  results: T[];
  success: boolean;
  meta?: Record<string, unknown>;
}

interface CloudflareD1Response<T> {
  success: boolean;
  errors?: Array<{ code?: number; message?: string }>;
  messages?: Array<{ code?: number; message?: string }>;
  result?: Array<CloudflareD1QueryResult<T>>;
}

export function isD1Configured(): boolean {
  const token = (process.env.CF_API_TOKEN ?? "").trim();
  const accountId = (process.env.CF_ACCOUNT_ID ?? "").trim();
  return Boolean(token && accountId);
}

async function queryCloudflareD1<T>(sql: string): Promise<T[]> {
  const accountId = (process.env.CF_ACCOUNT_ID ?? "").trim();
  const databaseId = (process.env.CF_D1_DATABASE_ID ?? "").trim() || DEFAULT_D1_DATABASE_ID;
  const apiToken = (process.env.CF_API_TOKEN ?? "").trim();

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare D1 credentials (CF_ACCOUNT_ID / CF_API_TOKEN) are not configured.");
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
    accountId
  )}/d1/database/${encodeURIComponent(databaseId)}/query`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      `Cloudflare D1 HTTP ${response.status}: ${bodyText.slice(0, 240) || response.statusText}`
    );
  }

  const json = (await response.json()) as CloudflareD1Response<T>;

  if (!json.success) {
    const errMsg =
      json.errors?.map((e) => e.message).filter(Boolean).join("; ") || "Unknown D1 API error";
    throw new Error(`Cloudflare D1 query failed: ${errMsg}`);
  }

  const firstResult = json.result?.[0];
  if (!firstResult || !Array.isArray(firstResult.results)) {
    return [];
  }

  return firstResult.results;
}

function normalizeVerificationStatus(
  status: string | null | undefined,
  isVerified: number | boolean | null | undefined
): VerificationStatus {
  const lowered = (status ?? "").trim().toLowerCase();
  if (lowered === "verified" || lowered === "approved") return "verified";
  if (lowered === "rejected" || lowered === "declined") return "rejected";
  if (lowered === "pending") return "pending";
  if (isVerified === 1 || isVerified === true) return "verified";
  return "pending";
}

const MAX_NOMINATIM_PER_REQUEST = 5;

async function hydrateVendors(
  rows: RawVendorRow[],
  options?: { allowNominatim?: boolean }
): Promise<VendorRecord[]> {
  const hydrated: VendorRecord[] = [];
  let nominatimCallsUsed = 0;

  for (const row of rows) {
    const categories = parseCategoriesJson(row.categoriesJson);
    const primaryCategory = categories[0] ?? "General Supply";
    const verificationStatus = normalizeVerificationStatus(row.verificationStatus, row.isVerified);
    const isVerified = verificationStatus === "verified" || row.isVerified === 1 || row.isVerified === true;

    const address = (row.address ?? "").trim();
    const city = (row.city ?? "").trim() || "Kolkata";
    const canUseNominatim =
      (options?.allowNominatim ?? true) && nominatimCallsUsed < MAX_NOMINATIM_PER_REQUEST;

    const geo = await geocodeAddress(address, city, {
      allowNominatim: canUseNominatim,
      skipCacheOnFallback: !canUseNominatim && (options?.allowNominatim ?? true),
    });

    if (geo.nominatimAttempted) {
      nominatimCallsUsed += 1;
    }

    const parsedProductCount = Number(row.productCount ?? 0);

    hydrated.push({
      id: String(row.id),
      businessName: (row.businessName ?? "").trim() || "Unnamed Vendor",
      ownerName: (row.ownerName ?? "").trim() || "—",
      email: (row.email ?? "").trim(),
      phone: (row.phone ?? "").trim(),
      gstin: (row.gstin ?? "").trim(),
      city,
      address: address || city,
      categories: categories.length > 0 ? categories : ["General Supply"],
      primaryCategory,
      description: (row.description ?? "").trim(),
      verificationStatus,
      isVerified,
      createdAt: (row.createdAt ?? "").trim(),
      productCount: Number.isFinite(parsedProductCount) ? parsedProductCount : 0,
      lat: geo.lat,
      lng: geo.lng,
      geocodeAccuracy: geo.accuracy,
      geocodeSource: geo.source,
      hubLabel: geo.hubLabel,
      pincode: geo.pincode,
    });
  }

  return applyColocationJitter(hydrated);
}

export function computeVendorStats(vendors: VendorRecord[]): VendorStats {
  let verifiedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  let totalProducts = 0;
  const hubs = new Set<string>();

  for (const v of vendors) {
    if (v.verificationStatus === "verified") verifiedCount++;
    else if (v.verificationStatus === "rejected") rejectedCount++;
    else pendingCount++;

    totalProducts += v.productCount;
    hubs.add(v.pincode || v.hubLabel);
  }

  return {
    totalVendors: vendors.length,
    verifiedCount,
    pendingCount,
    rejectedCount,
    totalProducts,
    coveredHubs: hubs.size,
  };
}

export async function getLiveOrDemoVendors(): Promise<{
  vendors: VendorRecord[];
  mode: "live" | "demo";
  warning?: string;
  stats: VendorStats;
}> {
  if (!isD1Configured()) {
    const vendors = await hydrateVendors(DEMO_VENDOR_ROWS, { allowNominatim: false });
    return {
      vendors,
      mode: "demo",
      warning: "Configure Cloudflare D1 credentials in .env.local to load live data",
      stats: computeVendorStats(vendors),
    };
  }

  const rows = await queryCloudflareD1<RawVendorRow>(LIVE_VENDORS_SQL);
  const vendors = await hydrateVendors(rows, { allowNominatim: true });

  return {
    vendors,
    mode: "live",
    stats: computeVendorStats(vendors),
  };
}
