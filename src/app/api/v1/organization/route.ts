import { NextRequest } from "next/server";
import { apiOk, requireApiRole } from "@/lib/api";
import { demoMembers, findMember } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(["admin", "member"]);
  if (auth.response) return auth.response;
  const requestedId = request.nextUrl.searchParams.get("memberId") ?? undefined;
  const root = findMember(auth.account.role === "member" ? auth.account.memberId : requestedId);
  const descendants = demoMembers.filter((member) => {
    let current = member;
    for (let depth = 0; depth < 10 && current.sponsorId; depth += 1) {
      if (current.sponsorId === root.id) return true;
      current = demoMembers.find((candidate) => candidate.id === current.sponsorId) ?? current;
    }
    return false;
  });
  return apiOk({ root, descendants });
}
