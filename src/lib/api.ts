import { NextResponse } from "next/server";
import { getDemoSession } from "@/lib/auth";
import type { Role } from "@/types/domain";

export async function requireApiRole(roles: Role[]) {
  const account = await getDemoSession();
  if (!account) return { account: null, response: NextResponse.json({ message: "尚未登入。" }, { status: 401 }) };
  if (!roles.includes(account.role)) return { account: null, response: NextResponse.json({ message: "此角色沒有操作權限。" }, { status: 403 }) };
  return { account, response: null };
}

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data, demo: true }, init);
}
