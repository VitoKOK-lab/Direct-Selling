import { apiOk, requireApiRole } from "@/lib/api";
import { getLoginRecords } from "@/lib/login-log";

export async function GET() {
  const auth = await requireApiRole(["admin"]);
  if (auth.response) return auth.response;
  return apiOk({ logins: getLoginRecords() });
}
