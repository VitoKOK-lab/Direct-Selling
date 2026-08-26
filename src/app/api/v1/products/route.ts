import { NextRequest } from "next/server";
import { z } from "zod";
import { apiOk, requireApiRole } from "@/lib/api";
import { demoProducts } from "@/lib/demo-data";

const productSchema = z.object({ name: z.string().min(2).max(80), priceTwd: z.number().int().positive(), costTwd: z.number().int().nonnegative(), stock: z.number().int().nonnegative() });

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(["member", "vendor", "admin", "finance"]);
  if (auth.response) return auth.response;
  const status = request.nextUrl.searchParams.get("status");
  const products = demoProducts.filter((product) => !status || product.status === status);
  return apiOk(products);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(["vendor", "admin"]);
  if (auth.response) return auth.response;
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiOk({ issues: parsed.error.issues }, { status: 400 });
  return apiOk({ id: `preview-product-${Date.now()}`, vendorId: auth.account.vendorId, status: "DRAFT", ...parsed.data }, { status: 201 });
}
