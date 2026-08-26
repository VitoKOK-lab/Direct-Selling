import type { MemberStatus, OrderStatus, ProductStatus, Role } from "@/types/domain";

export const formatTwd = (value: number) =>
  new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-TW").format(value);

export const roleLabels: Record<Role, string> = {
  member: "會員",
  vendor: "廠商",
  admin: "管理員",
  finance: "財務",
};

export const memberStatusLabels: Record<MemberStatus, string> = {
  NORMAL: "正常",
  FROZEN: "凍結",
  SUSPENDED: "停權",
  EXITED: "已退出",
  INVALID: "失效",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  DRAFT: "草稿",
  MOCK_PAID: "模擬已付款",
  PROCESSING: "處理中",
  SHIPPED: "已出貨",
  DELIVERED: "已送達",
  SETTLEMENT_ELIGIBLE: "可結算",
  SETTLED: "已結算",
  CANCELLED: "已取消",
  REFUNDED_BEFORE_SETTLEMENT: "結算前退款",
};

export const productStatusLabels: Record<ProductStatus, string> = {
  DRAFT: "草稿",
  PENDING: "待審核",
  RETURNED: "退回修改",
  APPROVED: "審核通過",
  PUBLISHED: "已上架",
  UNLISTED: "已下架",
};

export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("zh-TW", { month: "2-digit", day: "2-digit" }).format(new Date(iso));
