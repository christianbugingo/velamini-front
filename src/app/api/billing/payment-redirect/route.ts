import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/payment-redirect
 *
 * Flutterwave redirects here after the customer completes or cancels payment
 * on the hosted checkout page (used as the `redirect_url`).
 *
 * Query params appended by Flutterwave:
 *   status         – "successful" | "cancelled" | "failed"
 *   tx_ref         – the transaction reference we generated
 *   transaction_id – Flutterwave's internal transaction ID
 *
 * The actual plan upgrade is handled asynchronously by the webhook
 * (/api/billing/webhook). This endpoint just bounces the user back to the
 * org dashboard billing tab with a status indicator.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status        = searchParams.get("status")         ?? "unknown";
  const txRef         = searchParams.get("tx_ref")         ?? "";

  const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  // txRef format: "vela-<cuid>-<plan>-<timestamp>"
  // cuid has no hyphens, so split("-")[1] is the org id
  const parts = txRef.split("-");
  const orgId = parts.length >= 4 ? parts[1] : "";

  const dashboardBase = orgId
    ? `${appUrl}/Dashboard/organizations/${encodeURIComponent(orgId)}`
    : `${appUrl}/Dashboard/organizations`;

  const redirectUrl = `${dashboardBase}?tab=billing&payment=${encodeURIComponent(status)}&tx=${encodeURIComponent(txRef)}`;

  return NextResponse.redirect(redirectUrl);
}
