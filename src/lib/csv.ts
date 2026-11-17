import type { VendorRecord } from "@/types/vendor";

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an Excel & Google My Maps friendly CSV (with UTF-8 BOM and explicit Latitude/Longitude).
 */
export function buildVendorsCsv(vendors: VendorRecord[]): string {
  const headers = [
    "Business Name",
    "Owner Name",
    "Primary Category",
    "All Categories",
    "Verification Status",
    "Active Products",
    "Phone",
    "Email",
    "GSTIN",
    "Address",
    "City",
    "Pincode",
    "Hub / Locality",
    "Latitude",
    "Longitude",
    "Geocode Accuracy",
    "Created At",
  ];

  const rows = vendors.map((v) => [
    v.businessName,
    v.ownerName,
    v.primaryCategory,
    v.categories.join("; "),
    v.verificationStatus,
    v.productCount,
    v.phone,
    v.email,
    v.gstin,
    v.address,
    v.city,
    v.pincode ?? "",
    v.hubLabel,
    v.lat.toFixed(6),
    v.lng.toFixed(6),
    v.geocodeAccuracy,
    v.createdAt,
  ]);

  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadVendorsCsv(vendors: VendorRecord[]): void {
  const csv = buildVendorsCsv(vendors);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ostaad-vendors-${dateStamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
