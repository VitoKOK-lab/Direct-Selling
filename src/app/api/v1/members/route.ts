import { NextRequest } from "next/server";
import { apiOk, requireApiRole } from "@/lib/api";
import { demoMembers, findMember } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(["admin", "finance", "member"]);
  if (auth.response) return auth.response;
  if (auth.account.role === "member") return apiOk(findMember(auth.account.memberId));
  const status = request.nextUrl.searchParams.get("status");
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 50), 200);
  const members = demoMembers.filter((member) => !status || member.status === status).slice(0, limit);
  return apiOk({ members, total: demoMembers.length });
}
