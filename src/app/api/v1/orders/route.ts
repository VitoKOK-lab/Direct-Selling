import { NextRequest } from "next/server";
import { z } from "zod";
import { apiOk, requireApiRole } from "@/lib/api";
import { demoOrders, demoProducts, findMember } from "@/lib/demo-data";

const orderSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20), paymentResult: z.enum(["success", "failure"]).default("success") });

export async function GET() {
  const auth = await requireApiRole(["member", "vendor", "admin", "finance"]);
  if (auth.response) return auth.response;
  const orders = auth.account.role === "member" ? demoOrders.filter((order) => order.memberId === auth.account.memberId) : auth.account.role === "vendor" ? demoOrders.filter((order) => order.vendorId === auth.account.vendorId) : demoOrders;
  return apiOk(orders);
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(["member"]);
  if (auth.response) return auth.response;
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiOk({ issues: parsed.error.issues }, { status: 400 });
  const product = demoProducts.find((item) => item.id === parsed.data.productId);
  if (!product) return apiOk({ message: "找不到商品。" }, { status: 404 });
  const member = findMember(auth.account.memberId);
  return apiOk({ id: `preview-order-${Date.now()}`, orderNo: `LKO-DEMO-${Date.now()}`, memberId: member.id, vendorId: product.vendorId, amountTwd: product.priceTwd * parsed.data.quantity, status: parsed.data.paymentResult === "success" ? "MOCK_PAID" : "DRAFT", demoPayment: true }, { status: 201 });
}
