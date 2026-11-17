import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionCookieOptions,
  isAuthEnabled,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ ok: true, devMode: true });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  if (!password.trim()) {
    return NextResponse.json({ error: "Please enter the access password." }, { status: 400 });
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    ...getSessionCookieOptions(),
    value: token,
  });

  return response;
}
