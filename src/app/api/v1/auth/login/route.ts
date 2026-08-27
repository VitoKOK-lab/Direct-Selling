import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, sessionCookie, verifyDemoCredentials } from "@/lib/auth";
import { recordLogin } from "@/lib/login-log";

const loginSchema = z.object({
  username: z.string().trim().min(3).max(40),
  password: z.string().min(8).max(100),
});

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const existing = attempts.get(ip);
  if (existing && existing.resetAt > now && existing.count >= 12) {
    return NextResponse.json({ message: "登入嘗試過多，請稍後再試。" }, { status: 429 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "請輸入有效的測試帳號與密碼。" }, { status: 400 });

  const account = await verifyDemoCredentials(parsed.data.username, parsed.data.password);
  if (!account) {
    attempts.set(ip, { count: (existing?.count ?? 0) + 1, resetAt: now + 60_000 });
    return NextResponse.json({ message: "帳號或密碼不正確。" }, { status: 401 });
  }

  attempts.delete(ip);
  recordLogin({ username: account.username, displayName: account.displayName, role: account.role, ip, userAgent: request.headers.get("user-agent") ?? "" });
  const response = NextResponse.json({ account: { username: account.username, role: account.role, displayName: account.displayName } });
  response.cookies.set(sessionCookie.name, createSessionToken(account), sessionCookie.options);
  return response;
}
