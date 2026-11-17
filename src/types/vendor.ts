export type VerificationStatus = "verified" | "pending" | "rejected";

export type GeocodeAccuracy = "exact" | "locality" | "approximate";

export interface RawVendorRow {
  id: string | number;
  businessName: string | number | null;
  ownerName: string | number | null;
  email: string | number | null;
  phone: string | number | null;
  gstin: string | number | null;
  city: string | number | null;
  address: string | number | null;
  categoriesJson: string | null;
  description: string | number | null;
  verificationStatus: string | number | null;
  isVerified: number | boolean | string | null;
  createdAt: string | number | null;
  productCount: number | string | null;
}

export interface VendorRecord {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstin: string;
  city: string;
  address: string;
  categories: string[];
  primaryCategory: string;
  description: string;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  createdAt: string;
  productCount: number;
  lat: number;
  lng: number;
  geocodeAccuracy: GeocodeAccuracy;
  geocodeSource: "dictionary" | "nominatim" | "fallback";
  hubLabel: string;
  pincode: string | null;
}

export interface VendorStats {
  totalVendors: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalProducts: number;
  coveredHubs: number;
}

export interface VendorsApiResponse {
  vendors: VendorRecord[];
  mode: "live" | "demo";
  syncedAt: string;
  warning?: string;
  stats: VendorStats;
}
