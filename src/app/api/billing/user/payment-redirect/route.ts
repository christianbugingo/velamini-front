import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/user/payment-redirect
 *
 * Flutterwave redirects here after checkout completes for personal user plans.
 * Bounces the user back to their dashboard billing tab with a status indicator.
 * Plan upgrade is handled server-side by the webhook.
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const status = searchParams.get("status") ?? "unknown";
  const txRef  = searchParams.get("tx_ref") ?? "";

  const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? origin;
  const redirectUrl = `${appUrl}/Dashboard?tab=billing&payment=${encodeURIComponent(status)}&tx=${encodeURIComponent(txRef)}`;

  return NextResponse.redirect(redirectUrl);
}
