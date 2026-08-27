export type Role = "member" | "vendor" | "admin" | "finance";

export type MemberStatus = "NORMAL" | "FROZEN" | "SUSPENDED" | "EXITED" | "INVALID";
export type PlanAmount = 2000 | 4000 | 12000;

export interface DemoAccount {
  username: string;
  displayName: string;
  role: Role;
  index: number;
  memberId?: string;
  vendorId?: string;
}

export interface Member {
  id: string;
  memberNo: string;
  name: string;
  planAmount: PlanAmount;
  sponsorId: string | null;
  status: MemberStatus;
  joinedAt: string;
  directCount: number;
  unlockedGenerations: number;
  depth: number;
  incomeTaxApplicable: boolean;
  nhiApplicable: boolean;
}

export type ProductStatus = "DRAFT" | "PENDING" | "RETURNED" | "APPROVED" | "PUBLISHED" | "UNLISTED";

export interface Product {
  id: string;
  sku: string;
  vendorId: string;
  name: string;
  subtitle: string;
  priceTwd: number;
  costTwd: number;
  stock: number;
  status: ProductStatus;
  pointsAllowed: boolean;
  accent: string;
  category: string;
  image: string;
}

export type OrderStatus =
  | "DRAFT"
  | "MOCK_PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "SETTLEMENT_ELIGIBLE"
  | "SETTLED"
  | "CANCELLED"
  | "REFUNDED_BEFORE_SETTLEMENT";

export interface DemoOrder {
  id: string;
  orderNo: string;
  memberId: string;
  vendorId: string;
  productId: string;
  amountTwd: number;
  status: OrderStatus;
  placedAt: string;
  trackingNo?: string;
}

export interface WalletSnapshot {
  memberId: string;
  pendingBonusTwd: number;
  accumulationTwd: number;
  cashTwd: number;
  shoppingPoints: number;
  heldBonusTwd: number;
}

export interface FeedbackAnnotation {
  id: string;
  route: string;
  targetLabel: string;
  author: string;
  content: string;
  status: "OPEN" | "REPLIED" | "DONE";
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
  result: "SUCCESS" | "BLOCKED";
}
