import { NextResponse } from "next/server";
import { getDemoSession } from "@/lib/auth";

export async function GET() {
  const account = await getDemoSession();
  return NextResponse.json({ account }, { status: account ? 200 : 401 });
}
