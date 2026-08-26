import { apiOk, requireApiRole } from "@/lib/api";
import { demoMembers, demoOrders } from "@/lib/demo-data";

export async function GET() {
  const auth = await requireApiRole(["admin", "finance"]);
  if (auth.response) return auth.response;
  return apiOk({ generatedAt: new Date().toISOString(), syntheticOnly: true, members: demoMembers.length, activeMembers: demoMembers.filter((member) => member.status === "NORMAL").length, orders: demoOrders.length, orderAmountTwd: demoOrders.reduce((sum, order) => sum + order.amountTwd, 0), planMix: { p2000: demoMembers.filter((member) => member.planAmount === 2000).length, p4000: demoMembers.filter((member) => member.planAmount === 4000).length, p12000: demoMembers.filter((member) => member.planAmount === 12000).length } });
}
