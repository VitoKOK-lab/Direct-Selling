import { NextResponse, type NextRequest } from "next/server";

// 維護模式預設值："on" 關站、"off" 開放；環境變數 MAINTENANCE_MODE 可覆寫。
const MAINTENANCE_DEFAULT = "on";
const maintenanceActive = () => (process.env.MAINTENANCE_MODE ?? MAINTENANCE_DEFAULT) !== "off";

export function proxy(request: NextRequest) {
  if (!maintenanceActive()) return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (pathname === "/maintenance") return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "系統維護中，暫停對外服務。" }, { status: 503, headers: { "Retry-After": "3600" } });
  }
  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|products/).*)"],
};
