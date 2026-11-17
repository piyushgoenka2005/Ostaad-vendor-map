import { NextResponse } from "next/server";
import { getAuthStatus } from "@/lib/auth";
import { getLiveOrDemoVendors } from "@/lib/d1";
import type { VendorsApiResponse } from "@/types/vendor";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function GET() {
  const auth = await getAuthStatus();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getLiveOrDemoVendors();
    const payload: VendorsApiResponse = {
      vendors: result.vendors,
      mode: result.mode,
      syncedAt: new Date().toISOString(),
      warning: result.warning,
      stats: result.stats,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load vendors from D1";
    return NextResponse.json(
      { error: message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
