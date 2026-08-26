import { apiOk, requireApiRole } from "@/lib/api";
import { demoMembers, demoOrders } from "@/lib/demo-data";
import { processSettlement, type PerformanceEvent } from "@/lib/compensation";

function preview() {
  const events: PerformanceEvent[] = demoOrders.slice(0, 18).map((order) => ({ idempotencyKey: `order:${order.id}:settlement`, memberId: order.memberId, amountTwd: order.amountTwd, type: "ORDER", sourceId: order.id, settlementMonth: "2026-08", planVersion: "PLAN-2026-08" }));
  return processSettlement(events, demoMembers, { m001: 3900, m002: 4000, m003: 5300, m004: 8000, m005: 9500 });
}

export async function GET() {
  const auth = await requireApiRole(["admin", "finance"]);
  if (auth.response) return auth.response;
  const result = preview();
  return apiOk({ batchId: "SET-2026-08-PREVIEW", status: "PREVIEWED", eventCount: result.processedEventKeys.length, bonusCount: result.bonuses.length, waterPoolCount: result.waterPool.length, cycleCount: result.cycles.length });
}

export async function POST() {
  const auth = await requireApiRole(["admin"]);
  if (auth.response) return auth.response;
  return apiOk({ batchId: "SET-2026-08-PREVIEW", previewOnly: true, result: preview() });
}
