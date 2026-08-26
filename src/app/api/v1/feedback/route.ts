import { NextRequest } from "next/server";
import { z } from "zod";
import { apiOk, requireApiRole } from "@/lib/api";
import { feedbackAnnotations } from "@/lib/demo-data";

const feedbackSchema = z.object({ route: z.string().startsWith("/").max(200), targetLabel: z.string().min(1).max(100), content: z.string().min(2).max(2000), xPercent: z.number().min(0).max(100).optional(), yPercent: z.number().min(0).max(100).optional() });

export async function GET() {
  const auth = await requireApiRole(["admin"]);
  if (auth.response) return auth.response;
  return apiOk(feedbackAnnotations);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(["member", "vendor", "admin", "finance"]);
  if (auth.response) return auth.response;
  const parsed = feedbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiOk({ issues: parsed.error.issues }, { status: 400 });
  return apiOk({ id: `fb-${Date.now()}`, author: auth.account.displayName, status: "OPEN", createdAt: new Date().toISOString(), ...parsed.data }, { status: 201 });
}
