import { NextRequest } from "next/server";
import { z } from "zod";
import { apiOk, requireApiRole } from "@/lib/api";
import { demoMembers, findMember } from "@/lib/demo-data";
import { calculateWithdrawal } from "@/lib/compensation";

const requestSchema = z.object({ amountTwd: z.number().int().positive().max(100_000) });

export async function GET() {
  const auth = await requireApiRole(["member", "finance"]);
  if (auth.response) return auth.response;
  const members = auth.account.role === "member" ? [findMember(auth.account.memberId)] : demoMembers.slice(0, 18);
  return apiOk(members.map((member, index) => ({ id: `WD-202608-${String(index + 1).padStart(4, "0")}`, memberId: member.id, ...calculateWithdrawal([4000, 6000, 8000][index % 3], member), status: index < 8 ? "PENDING" : "PAID" })));
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(["member"]);
  if (auth.response) return auth.response;
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiOk({ issues: parsed.error.issues }, { status: 400 });
  const member = findMember(auth.account.memberId);
  return apiOk({ id: `WD-DEMO-${Date.now()}`, memberId: member.id, ...calculateWithdrawal(parsed.data.amountTwd, member), status: "PENDING" }, { status: 201 });
}
