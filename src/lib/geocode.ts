import type { GeocodeAccuracy } from "@/types/vendor";

export interface GeocodeResult {
  lat: number;
  lng: number;
  accuracy: GeocodeAccuracy;
  source: "dictionary" | "nominatim" | "fallback";
  hubLabel: string;
  pincode: string | null;
  nominatimAttempted?: boolean;
}

interface DictionaryEntry {
  hubLabel: string;
  lat: number;
  lng: number;
  keywords: string[];
  pincodes: string[];
  accuracy: GeocodeAccuracy;
}

/**
 * Tier 1 — High-accuracy Kolkata & West Bengal construction/commercial hubs & pincodes.
 * Ordered from most specific sub-localities to broader areas.
 */
const LOCALITY_DICTIONARY: DictionaryEntry[] = [
  // Exact Kolkata Hubs specified for Ostaad Ops
  {
    hubLabel: "Ezra Street / Burrabazar",
    lat: 22.5754,
    lng: 88.3532,
    keywords: ["ezra street", "ezra st", "burrabazar", "bara bazar", "barabazar", "canning street", "brabourne road", "rabindra sarani", "b.b.d. bag", "bbd bag", "dalhousie"],
    pincodes: ["700001", "700007"],
    accuracy: "locality",
  },
  {
    hubLabel: "Ultadanga / CIT Road",
    lat: 22.5924,
    lng: 88.3910,
    keywords: ["ultadanga", "cit road", "c.i.t. road", "c i t road", "hudco", "muchibazar", "dakshindari", "bidhan nagar road"],
    pincodes: ["700067"],
    accuracy: "locality",
  },
  {
    hubLabel: "Anandapur / Ruby",
    lat: 22.5138,
    lng: 88.4048,
    keywords: ["anandapur", "nazirabad", "ruby", "urbana", "heritage", "nonadanga", "chowbaga"],
    pincodes: [], // Shares 700107 with Rajdanga; matched by keyword first
    accuracy: "locality",
  },
  {
    hubLabel: "Rajdanga / Kasba",
    lat: 22.5150,
    lng: 88.3932,
    keywords: ["rajdanga", "kasba", "acropolis", "bosepukur", "haltu", "east kolkata township", "ektp"],
    pincodes: ["700107", "700042"],
    accuracy: "locality",
  },
  {
    hubLabel: "New Town / Akankha More",
    lat: 22.5895,
    lng: 88.4750,
    keywords: ["akankha", "aa-iib", "aa iib", "action area iib", "action area 2b", "new town 700136", "rajarhat new town"],
    pincodes: ["700136"],
    accuracy: "locality",
  },
  {
    hubLabel: "New Town Action Area",
    lat: 22.5797,
    lng: 88.4598,
    keywords: ["new town", "newtown", "action area", "biswa bangla", "ecospace", "eco park", "shapoorji", "unitech", "axis mall", "city centre 2", "cc2"],
    pincodes: ["700156", "700157", "700160", "700161", "700163"],
    accuracy: "locality",
  },
  {
    hubLabel: "Salt Lake / Sector V",
    lat: 22.5867,
    lng: 88.4171,
    keywords: ["salt lake", "saltlake", "bidhannagar", "sector v", "sector 5", "sector i", "sector ii", "sector iii", "karunamoyee", "tank no", "webel"],
    pincodes: ["700064", "700091", "700097", "700098", "700106"],
    accuracy: "locality",
  },
  {
    hubLabel: "Howrah",
    lat: 22.5958,
    lng: 88.2636,
    keywords: ["howrah", "shibpur", "salkia", "liluah", "ghusuri", "bally", "belur", "santragachi", "andul", "kona expressway", "dasnagar", "kadamtala"],
    pincodes: ["711101", "711102", "711103", "711104", "711105", "711106", "711109", "711112", "711114", "711201", "711202", "711204"],
    accuracy: "locality",
  },
  {
    hubLabel: "Behala",
    lat: 22.4985,
    lng: 88.3168,
    keywords: ["behala", "parnasree", "sakherbazar", "thakurpukur", "joka", "diamond harbour road", "dh road", "taratala", "new alipore"],
    pincodes: ["700034", "700060", "700061", "700063", "700053", "700088", "700104"],
    accuracy: "locality",
  },
  {
    hubLabel: "Garia / Baruipur",
    lat: 22.4631,
    lng: 88.3924,
    keywords: ["garia", "baruipur", "narendrapur", "sonarpur", "kamalgazi", "patuli", "baishnabghata", "baisnabghata", "nayabad", "em bypass south"],
    pincodes: ["700084", "700144", "700103", "700094", "700150", "700152"],
    accuracy: "locality",
  },
  {
    hubLabel: "Dum Dum / Barasat",
    lat: 22.6420,
    lng: 88.4312,
    keywords: ["dum dum", "dumdum", "nagerbazar", "barasat", "madhyamgram", "jessore road", "birati", "airport", "belghoria", "sodepur", "barrackpore"],
    pincodes: ["700028", "700030", "700051", "700052", "700055", "700056", "700074", "700079", "700080", "700081", "700110", "700120", "700124", "700125", "700126", "700129"],
    accuracy: "locality",
  },
  // Additional prominent Kolkata commercial corridors
  {
    hubLabel: "Park Street / Camac Street",
    lat: 22.5519,
    lng: 88.3529,
    keywords: ["park street", "camac street", "theatre road", "shakespeare sarani", "mullick bazar", "park circus", "ajc bose road"],
    pincodes: ["700016", "700017", "700071"],
    accuracy: "locality",
  },
  {
    hubLabel: "Ballygunge / Gariahat",
    lat: 22.5236,
    lng: 88.3658,
    keywords: ["ballygunge", "gariahat", "rashbehari", "hazra", "bhawanipore", "bhowanipore", "elgin road", "lansdowne", "kalighat"],
    pincodes: ["700019", "700020", "700025", "700026", "700029"],
    accuracy: "locality",
  },
  {
    hubLabel: "Tollygunge / Jadavpur",
    lat: 22.4989,
    lng: 88.3627,
    keywords: ["tollygunge", "jadavpur", "dhakuria", "santoshpur", "golf green", "lake gardens", "prince anwar shah", "bansdroni", "regent park"],
    pincodes: ["700031", "700032", "700033", "700040", "700045", "700068", "700070", "700075", "700095"],
    accuracy: "locality",
  },
  {
    hubLabel: "Sealdah / Bowbazar / Central",
    lat: 22.5667,
    lng: 88.3697,
    keywords: ["sealdah", "bowbazar", "college street", "chandni chowk", "esplanade", "dharmatala", "bentinck street", "lenin sarani", "ganesh chandra", "mg road", "mahatma gandhi road", "entally"],
    pincodes: ["700012", "700013", "700014", "700069", "700072", "700073"],
    accuracy: "locality",
  },
  {
    hubLabel: "Topsia / Tangra / EM Bypass",
    lat: 22.5448,
    lng: 88.3920,
    keywords: ["topsia", "tangra", "science city", "tiljala", "picnic garden", "beliaghata", "phoolbagan", "kankurgachi"],
    pincodes: ["700010", "700015", "700039", "700054", "700085", "700100", "700105"],
    accuracy: "locality",
  },
  {
    hubLabel: "Lake Town / Baguiati / Rajarhat",
    lat: 22.6122,
    lng: 88.4265,
    keywords: ["lake town", "laketown", "bangur", "vip road", "baguiati", "keshtopur", "kestopur", "chinar park", "teghoria", "kaikhali", "rajarhat"],
    pincodes: ["700048", "700059", "700089", "700101", "700102", "700135", "700159"],
    accuracy: "locality",
  },
  {
    hubLabel: "Shyambazar / North Kolkata",
    lat: 22.6016,
    lng: 88.3736,
    keywords: ["shyambazar", "shobhabazar", "hatibagan", "bagbazar", "cossipore", "sinthi", "bt road", "b.t. road", "baranagar", "paikpara", "maniktala"],
    pincodes: ["700002", "700003", "700004", "700005", "700006", "700036", "700037", "700050", "700090"],
    accuracy: "locality",
  },
  {
    hubLabel: "Alipore / Kidderpore",
    lat: 22.5356,
    lng: 88.3289,
    keywords: ["alipore", "alipur", "kidderpore", "khidirpur", "chetla", "mominpore", "garden reach", "metiabruz"],
    pincodes: ["700023", "700024", "700027"],
    accuracy: "locality",
  },
  // West Bengal Regional Hubs
  {
    hubLabel: "Hooghly",
    lat: 22.9089,
    lng: 88.3967,
    keywords: ["hooghly", "hugli", "chinsurah", "chandannagar", "serampore", "srirampur", "uttarpara", "dankuni", "rishra", "konnagar", "bandel"],
    pincodes: ["712101", "712103", "712123", "712136", "712201", "712232", "712235", "712248", "712258", "712311"],
    accuracy: "locality",
  },
  {
    hubLabel: "Durgapur",
    lat: 23.5204,
    lng: 87.3119,
    keywords: ["durgapur", "benachity", "city centre durgapur", "bidhannagar durgapur"],
    pincodes: ["713201", "713204", "713212", "713213", "713216"],
    accuracy: "locality",
  },
  {
    hubLabel: "Siliguri",
    lat: 26.7271,
    lng: 88.3953,
    keywords: ["siliguri", "sevoke road", "matigara", "bagdogra", "pradhan nagar"],
    pincodes: ["734001", "734002", "734003", "734005", "734006", "734008", "734010"],
    accuracy: "locality",
  },
  {
    hubLabel: "Asansol",
    lat: 23.6739,
    lng: 86.9524,
    keywords: ["asansol", "burnpur", "raniganj"],
    pincodes: ["713301", "713302", "713303", "713304", "713325"],
    accuracy: "locality",
  },
  {
    hubLabel: "Kharagpur / Midnapore",
    lat: 22.3460,
    lng: 87.2320,
    keywords: ["kharagpur", "midnapore", "medinipur"],
    pincodes: ["721101", "721301", "721302"],
    accuracy: "locality",
  },
  {
    hubLabel: "Bardhaman",
    lat: 23.2324,
    lng: 87.8615,
    keywords: ["bardhaman", "burdwan"],
    pincodes: ["713101", "713102", "713103"],
    accuracy: "locality",
  },
];

const KOLKATA_FALLBACK = {
  lat: 22.5726,
  lng: 88.3639,
  hubLabel: "Kolkata (General)",
};

const CITY_FALLBACKS: Array<{ keywords: string[]; lat: number; lng: number; hubLabel: string }> = [
  { keywords: ["howrah"], lat: 22.5958, lng: 88.2636, hubLabel: "Howrah" },
  { keywords: ["hooghly", "hugli"], lat: 22.9089, lng: 88.3967, hubLabel: "Hooghly" },
  { keywords: ["durgapur"], lat: 23.5204, lng: 87.3119, hubLabel: "Durgapur" },
  { keywords: ["siliguri"], lat: 26.7271, lng: 88.3953, hubLabel: "Siliguri" },
  { keywords: ["asansol"], lat: 23.6739, lng: 86.9524, hubLabel: "Asansol" },
  { keywords: ["kharagpur"], lat: 22.3460, lng: 87.2320, hubLabel: "Kharagpur" },
  { keywords: ["bardhaman", "burdwan"], lat: 23.2324, lng: 87.8615, hubLabel: "Bardhaman" },
  { keywords: ["haldia"], lat: 22.0667, lng: 88.0698, hubLabel: "Haldia" },
  { keywords: ["barasat"], lat: 22.7228, lng: 88.4807, hubLabel: "Barasat" },
  { keywords: ["kalyani"], lat: 22.9751, lng: 88.4345, hubLabel: "Kalyani" },
  { keywords: ["kolkata", "calcutta"], lat: KOLKATA_FALLBACK.lat, lng: KOLKATA_FALLBACK.lng, hubLabel: KOLKATA_FALLBACK.hubLabel },
];

// Persist cache across warm serverless invocations and Next.js dev HMR
const globalForGeocode = globalThis as unknown as {
  __ostaadGeocodeCache?: Map<string, GeocodeResult>;
  __ostaadNominatimQueue?: Promise<void>;
  __ostaadLastNominatimAt?: number;
};

const geocodeCache =
  globalForGeocode.__ostaadGeocodeCache ?? new Map<string, GeocodeResult>();
globalForGeocode.__ostaadGeocodeCache = geocodeCache;

function normalizeKey(address: string, city: string): string {
  return `${address.trim().toLowerCase().replace(/\s+/g, " ")}|${city.trim().toLowerCase().replace(/\s+/g, " ")}`;
}

export function extractPincode(text: string): string | null {
  const match = text.match(/\b(7\d{5})\b/) ?? text.match(/\b([1-9]\d{5})\b/);
  return match ? match[1] : null;
}

function matchDictionary(address: string, city: string, pincode: string | null): GeocodeResult | null {
  const combined = `${address} ${city}`.toLowerCase();

  // Pass 1: Match specific locality keywords first (handles shared pincodes like 700107 Anandapur vs Rajdanga)
  for (const entry of LOCALITY_DICTIONARY) {
    if (entry.keywords.some((kw) => combined.includes(kw))) {
      return {
        lat: entry.lat,
        lng: entry.lng,
        accuracy: entry.accuracy,
        source: "dictionary",
        hubLabel: entry.hubLabel,
        pincode,
      };
    }
  }

  // Pass 2: Match exact pincode
  if (pincode) {
    for (const entry of LOCALITY_DICTIONARY) {
      if (entry.pincodes.includes(pincode)) {
        return {
          lat: entry.lat,
          lng: entry.lng,
          accuracy: entry.accuracy,
          source: "dictionary",
          hubLabel: entry.hubLabel,
          pincode,
        };
      }
    }
  }

  return null;
}

async function waitForNominatimSlot(): Promise<void> {
  const prev = globalForGeocode.__ostaadNominatimQueue ?? Promise.resolve();
  let release!: () => void;
  globalForGeocode.__ostaadNominatimQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await prev;

  const lastAt = globalForGeocode.__ostaadLastNominatimAt ?? 0;
  const elapsed = Date.now() - lastAt;
  const waitMs = Math.max(0, 1050 - elapsed);
  if (waitMs > 0) {
    await new Promise((r) => setTimeout(r, waitMs));
  }
  globalForGeocode.__ostaadLastNominatimAt = Date.now();
  release();
}

async function queryNominatim(address: string, city: string, pincode: string | null): Promise<GeocodeResult | null> {
  const cleanAddress = address.trim();
  const cleanCity = city.trim() || "Kolkata";
  const queryParts = [cleanAddress, cleanCity, "West Bengal", "India"].filter(Boolean);
  if (queryParts.length <= 2 && !pincode) {
    return null;
  }

  const queriesToTry = [queryParts.join(", ")];
  if (pincode) {
    queriesToTry.push(`${pincode}, ${cleanCity}, West Bengal, India`);
  }

  for (const q of queriesToTry) {
    try {
      await waitForNominatimSlot();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "OstaadVendorMap/1.0 (ops@ostaad.in)",
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) continue;

      const data = (await res.json()) as Array<{
        lat?: string;
        lon?: string;
        display_name?: string;
        type?: string;
        class?: string;
      }>;

      if (!Array.isArray(data) || data.length === 0) continue;

      const lat = Number.parseFloat(data[0].lat ?? "");
      const lng = Number.parseFloat(data[0].lon ?? "");

      // Sanity bounds for West Bengal & eastern India (roughly 21..28N, 85..90E)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (lat < 20.5 || lat > 28.5 || lng < 84.5 || lng > 91.0) continue;

      const isStreetLevel =
        data[0].class === "building" ||
        data[0].class === "highway" ||
        data[0].class === "amenity" ||
        data[0].class === "shop" ||
        data[0].type === "house" ||
        data[0].type === "residential" ||
        data[0].type === "road";

      const displayFirst = (data[0].display_name ?? "")
        .split(",")
        .slice(0, 2)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", ");

      return {
        lat,
        lng,
        accuracy: isStreetLevel ? "exact" : "locality",
        source: "nominatim",
        hubLabel: displayFirst || (pincode ? `${cleanCity} ${pincode}` : cleanCity),
        pincode,
      };
    } catch {
      // Network timeout or Nominatim unavailable — fall through cleanly to Tier 3
    }
  }

  return null;
}

function cityFallback(address: string, city: string, pincode: string | null): GeocodeResult {
  const combined = `${city} ${address}`.toLowerCase();
  for (const fallback of CITY_FALLBACKS) {
    if (fallback.keywords.some((kw) => combined.includes(kw))) {
      return {
        lat: fallback.lat,
        lng: fallback.lng,
        accuracy: "approximate",
        source: "fallback",
        hubLabel: pincode ? `${fallback.hubLabel} (${pincode})` : fallback.hubLabel,
        pincode,
      };
    }
  }

  return {
    lat: KOLKATA_FALLBACK.lat,
    lng: KOLKATA_FALLBACK.lng,
    accuracy: "approximate",
    source: "fallback",
    hubLabel: city.trim() || KOLKATA_FALLBACK.hubLabel,
    pincode,
  };
}

export async function geocodeAddress(
  address: string,
  city: string,
  options?: { allowNominatim?: boolean; skipCacheOnFallback?: boolean }
): Promise<GeocodeResult> {
  const safeAddress = (address ?? "").trim();
  const safeCity = (city ?? "").trim() || "Kolkata";
  const cacheKey = normalizeKey(safeAddress, safeCity);

  const cached = geocodeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pincode = extractPincode(`${safeAddress} ${safeCity}`);

  // Tier 1: Exact Kolkata & WB Dictionary (0ms)
  const dictHit = matchDictionary(safeAddress, safeCity, pincode);
  if (dictHit) {
    geocodeCache.set(cacheKey, dictHit);
    return dictHit;
  }

  // Tier 2: OpenStreetMap Nominatim API (throttled 1 req/sec)
  let nominatimAttempted = false;
  if (options?.allowNominatim !== false && safeAddress.length >= 4) {
    nominatimAttempted = true;
    const nominatimHit = await queryNominatim(safeAddress, safeCity, pincode);
    if (nominatimHit) {
      geocodeCache.set(cacheKey, nominatimHit);
      return { ...nominatimHit, nominatimAttempted: true };
    }
  }

  // Tier 3: City Center Fallback (never drop a vendor)
  const fallbackHit = cityFallback(safeAddress, safeCity, pincode);
  if (!options?.skipCacheOnFallback) {
    geocodeCache.set(cacheKey, fallbackHit);
  }
  return { ...fallbackHit, nominatimAttempted };
}

/**
 * Deterministic Co-location Jitter:
 * Offsets vendors sharing the exact same (lat, lng) in a tight ~95m spiral so every pin is clickable.
 */
export function applyColocationJitter<T extends { id: string; lat: number; lng: number }>(
  items: T[]
): T[] {
  const buckets = new Map<string, T[]>();

  for (const item of items) {
    const key = `${item.lat.toFixed(4)},${item.lng.toFixed(4)}`;
    const group = buckets.get(key) ?? [];
    group.push(item);
    buckets.set(key, group);
  }

  const offsets = new Map<string, { lat: number; lng: number }>();

  for (const group of buckets.values()) {
    if (group.length <= 1) continue;

    // Sort by id so positions remain 100% deterministic across syncs
    const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));
    const goldenAngle = 2.399963229728653; // ~137.5 deg for even visual dispersion

    sorted.forEach((item, index) => {
      if (index === 0) {
        offsets.set(item.id, { lat: item.lat, lng: item.lng });
        return;
      }

      // 85m to ~125m gentle spiral offset
      const ringMeters = 85 + Math.min(index - 1, 12) * 18;
      const angle = index * goldenAngle;
      const dLat = (ringMeters * Math.cos(angle)) / 111_320;
      const cosLat = Math.cos((item.lat * Math.PI) / 180) || 1;
      const dLng = (ringMeters * Math.sin(angle)) / (111_320 * cosLat);

      offsets.set(item.id, {
        lat: Number((item.lat + dLat).toFixed(6)),
        lng: Number((item.lng + dLng).toFixed(6)),
      });
    });
  }

  return items.map((item) => {
    const adjusted = offsets.get(item.id);
    if (!adjusted) return item;
    return {
      ...item,
      lat: adjusted.lat,
      lng: adjusted.lng,
    };
  });
}
