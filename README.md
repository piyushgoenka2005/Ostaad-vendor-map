# Ostaad Vendor Coverage Map

Standalone **Next.js (App Router) + TypeScript + Tailwind CSS + Leaflet** internal operations dashboard that connects live (read-only) to Ostaad's **Cloudflare D1** database (`ostaad-db`) via the Cloudflare D1 HTTP REST API, automatically geocodes vendor addresses, and plots all Kolkata & West Bengal vendors on an interactive coverage map.

Designed for 1-click deployment on **Vercel** with zero map API keys required.

---

## Key Features

- **Live Read-Only Cloudflare D1 Sync:** Queries `vendors` joined with active `products` (`isDeleted = 0`) over HTTPS with `cache: "no-store"` and `force-dynamic` so newly registered vendors appear immediately.
- **Demo / Fallback Mode:** Runs out-of-the-box with sample Kolkata vendors if `CF_API_TOKEN` is not configured yet, with a clear banner prompting setup.
- **3-Tier Automatic Geocoder (`src/lib/geocode.ts`):**
  1. **Tier 1 (0ms):** Built-in Kolkata & West Bengal commercial hub & pincode dictionary (Ezra Street, Ultadanga, Rajdanga/Kasba, Anandapur/Ruby, New Town AA-I/II/IIB/III, Salt Lake Sector V, Howrah, Behala, Garia/Baruipur, Dum Dum/Barasat, Hooghly, Durgapur, Siliguri, and more).
  2. **Tier 2 (Polite Fallback):** OpenStreetMap Nominatim API (`1 req/sec` throttled, cached in-memory across warm serverless invocations).
  3. **Tier 3 (Guaranteed Plot):** City-center fallback flagged as `Approximate` so no vendor is ever dropped.
  4. **Deterministic Co-location Jitter:** Vendors sharing identical coordinates are gently offset (~85–125m spiral) so every pin stays clickable.
- **Coverage Gap Analysis:** Toggle `5 km` / `10 km` / `15 km` delivery coverage radius rings around visible vendor pins to spot underserved Kolkata zones.
- **Internal Access Gate:** Password-protected dashboard & `/api/vendors` route using `MAP_ACCESS_PASSWORD` and HMAC-SHA256 signed `HttpOnly` session cookies (Web Crypto API).
- **Excel & Google My Maps Export:** One-click UTF-8 CSV export with `Latitude`, `Longitude`, GSTIN, phone, categories, and hub metadata.

---

## 1. Create a Read-Only Cloudflare API Token

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Copy your **Account ID** from **Workers & Pages → Overview** (right sidebar).
3. Go to **My Profile → API Tokens → Create Token → Create Custom Token**.
4. Configure the token:
   - **Token Name:** `Ostaad Vendor Map (D1 Read-Only)`
   - **Permissions:**
     - `Account` → `D1` → **`Read`**
   - **Account Resources:** Include → Your Ostaad Cloudflare account
5. Click **Continue to summary → Create Token** and copy the generated token immediately.

> **Security Note:** This token only needs **D1 Read** permission. The app never writes to or alters your production D1 schema.

---

## 2. Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):
- Without `CF_API_TOKEN` set, the app automatically opens in **Demo Mode** with sample Kolkata vendors.
- Without `MAP_ACCESS_PASSWORD` set, the password gate is bypassed locally with a subtle `Dev Mode` badge.
- Fill in `CF_ACCOUNT_ID`, `CF_D1_DATABASE_ID` (defaults to `8363bc75-2f49-4b66-95c3-8b5968c9936b`), and `CF_API_TOKEN` in `.env.local` to connect live to `ostaad-db`.

---

## 3. Deploy to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket (or run `npx vercel` from this folder).
2. In Vercel, click **Add New → Project** and import the repository.
3. Under **Environment Variables**, add the following for **Production** (and Preview if desired):

| Variable | Value | Required |
| --- | --- | --- |
| `CF_ACCOUNT_ID` | Your Cloudflare Account ID | Yes (for live data) |
| `CF_D1_DATABASE_ID` | `8363bc75-2f49-4b66-95c3-8b5968c9936b` | Yes (defaults to `ostaad-db`) |
| `CF_API_TOKEN` | Your read-only Cloudflare D1 API token | Yes (for live data) |
| `MAP_ACCESS_PASSWORD` | Strong shared ops password for your team | Recommended in production |

4. Click **Deploy**.
5. Once live, open your Vercel URL, sign in with `MAP_ACCESS_PASSWORD`, and use **Auto 60s** or **Sync Live Now** to monitor incoming vendor registrations in real time.

---

## Verification Commands

```bash
npx tsc --noEmit
npm run build
```
