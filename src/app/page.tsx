import { getAuthStatus } from "@/lib/auth";
import { getLiveOrDemoVendors } from "@/lib/d1";
import { LoginGate } from "@/components/LoginGate";
import { OpsDashboard } from "@/components/OpsDashboard";
import type { VendorsApiResponse } from "@/types/vendor";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export default async function HomePage() {
  const auth = await getAuthStatus();

  if (!auth.authenticated) {
    return <LoginGate />;
  }

  let initialData: VendorsApiResponse | null = null;
  let initialError: string | null = null;

  try {
    const result = await getLiveOrDemoVendors();
    initialData = {
      vendors: result.vendors,
      mode: result.mode,
      syncedAt: new Date().toISOString(),
      warning: result.warning,
      stats: result.stats,
    };
  } catch (err) {
    initialError =
      err instanceof Error ? err.message : "Unable to load vendors from Cloudflare D1.";
  }

  return (
    <OpsDashboard
      initialData={initialData}
      initialError={initialError}
      devMode={auth.devMode}
    />
  );
}
