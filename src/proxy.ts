import { NextResponse, type NextRequest } from "next/server";

// 維護模式：預設開啟；設定環境變數 MAINTENANCE_MODE=off 才恢復對外服務。
const maintenanceActive = () => process.env.MAINTENANCE_MODE !== "off";

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
