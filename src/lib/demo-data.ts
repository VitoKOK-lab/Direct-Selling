import type {
  AuditEvent,
  DemoAccount,
  DemoOrder,
  FeedbackAnnotation,
  Member,
  MemberStatus,
  PlanAmount,
  Product,
  WalletSnapshot,
} from "@/types/domain";

const surnames = ["林", "陳", "張", "李", "王", "吳", "劉", "蔡", "楊", "黃", "許", "鄭", "謝", "洪", "郭", "邱", "曾", "廖", "賴", "徐"];
const givenNames = ["子晴", "承恩", "雅婷", "柏翰", "宥辰", "心妍", "家豪", "品妤", "宇軒", "佳穎", "冠廷", "思涵", "彥廷", "語彤", "哲宇", "怡君", "俊傑", "雨潔", "秉謙", "書妤"];
const capacityPattern = [7, 5, 3, 6, 2, 4, 1, 0];

export function unlockedGenerations(planAmount: PlanAmount, directCount: number): number {
  if (planAmount === 12000) return 10;
  const initial = planAmount === 4000 ? 5 : 3;
  return Math.min(10, initial + directCount);
}

function memberStatus(index: number): MemberStatus {
  if (index !== 0 && index % 53 === 0) return "INVALID";
  if (index !== 0 && index % 47 === 0) return "EXITED";
  if (index !== 0 && index % 41 === 0) return "SUSPENDED";
  if (index !== 0 && index % 37 === 0) return "FROZEN";
  return "NORMAL";
}

export function createDemoMembers(count = 200): Member[] {
  const sponsorIndexes: Array<number | null> = [null];
  const children = Array.from({ length: count }, () => 0);
  let parent = 0;

  for (let index = 1; index < count; index += 1) {
    while (children[parent] >= capacityPattern[parent % capacityPattern.length]) parent += 1;
    sponsorIndexes[index] = parent;
    children[parent] += 1;
  }

  const depths = Array.from({ length: count }, () => 0);
  for (let index = 1; index < count; index += 1) {
    const sponsor = sponsorIndexes[index] ?? 0;
    depths[index] = depths[sponsor] + 1;
  }

  return Array.from({ length: count }, (_, index) => {
    const planAmount: PlanAmount = index % 10 === 0 ? 12000 : index % 3 === 0 ? 4000 : 2000;
    return {
      id: `m${String(index + 1).padStart(3, "0")}`,
      memberNo: `LK${String(index + 1).padStart(6, "0")}`,
      name: `${surnames[index % surnames.length]}${givenNames[(index * 7) % givenNames.length]}`,
      planAmount,
      sponsorId: sponsorIndexes[index] === null ? null : `m${String((sponsorIndexes[index] ?? 0) + 1).padStart(3, "0")}`,
      status: memberStatus(index),
      joinedAt: new Date(Date.UTC(2025 + Math.floor(index / 150), index % 12, (index % 26) + 1)).toISOString(),
      directCount: children[index],
      unlockedGenerations: unlockedGenerations(planAmount, children[index]),
      depth: depths[index],
      incomeTaxApplicable: index % 3 !== 0,
      nhiApplicable: index % 4 === 0,
    };
  });
}

export const demoMembers = createDemoMembers();

export const demoAccounts: DemoAccount[] = (["member", "vendor", "admin", "finance"] as const).flatMap((role) =>
  Array.from({ length: 10 }, (_, index) => ({
    username: `${role}${String(index + 1).padStart(2, "0")}`,
    displayName: role === "member" ? demoMembers[index * 11].name : `${role === "vendor" ? "合作廠商" : role === "admin" ? "營運管理" : "財務專員"} ${String(index + 1).padStart(2, "0")}`,
    role,
    index: index + 1,
    memberId: role === "member" ? demoMembers[index * 11].id : undefined,
    vendorId: role === "vendor" ? `v${String(index + 1).padStart(2, "0")}` : undefined,
  })),
);

const productNames = [
  ["曜金煥采精華", "高效保濕與光澤管理", "保養"],
  ["植萃舒活飲", "每日活力補給配方", "營養"],
  ["極淨胺基酸潔顏", "溫和潔淨不緊繃", "保養"],
  ["御藏靈芝複方", "日常機能營養補充", "營養"],
  ["黑曜修護面膜", "集中潤澤修護", "保養"],
  ["金萃葉黃素", "晶亮舒適營養配方", "營養"],
  ["森氧香氛禮盒", "木質調居家香氣", "生活"],
  ["晶透防護乳", "輕盈日間防護", "保養"],
  ["衡暢益生菌", "調整體質每日補給", "營養"],
  ["曜石保溫瓶", "會員限定霧黑瓶身", "生活"],
  ["金緻護手霜", "絲滑吸收不黏膩", "保養"],
  ["元氣堅果組", "低溫烘焙綜合堅果", "食品"],
] as const;

export const demoProducts: Product[] = productNames.map(([name, subtitle, category], index) => ({
  id: `p${String(index + 1).padStart(3, "0")}`,
  sku: `LX-${category.slice(0, 1)}-${String(index + 1).padStart(3, "0")}`,
  vendorId: `v${String((index % 10) + 1).padStart(2, "0")}`,
  name,
  subtitle,
  category,
  priceTwd: [1000, 2000, 2000, 4000, 1000, 2000][index % 6],
  costTwd: [300, 600, 600, 1200, 300, 600][index % 6],
  stock: 18 + ((index * 17) % 90),
  status: index === 3 ? "PENDING" : index === 8 ? "RETURNED" : index === 11 ? "UNLISTED" : "PUBLISHED",
  pointsAllowed: index % 4 !== 3,
  accent: ["#B8892D", "#81663A", "#68625B", "#9B7628"][index % 4],
}));

const orderStatuses = ["SETTLED", "SETTLEMENT_ELIGIBLE", "SHIPPED", "PROCESSING", "DELIVERED", "MOCK_PAID"] as const;

export const demoOrders: DemoOrder[] = Array.from({ length: 36 }, (_, index) => {
  const member = demoMembers[(index * 13) % demoMembers.length];
  const product = demoProducts[index % demoProducts.length];
  const status = orderStatuses[index % orderStatuses.length];
  return {
    id: `o${String(index + 1).padStart(4, "0")}`,
    orderNo: `LKO-202608-${String(index + 1).padStart(4, "0")}`,
    memberId: member.id,
    vendorId: product.vendorId,
    productId: product.id,
    amountTwd: member.planAmount,
    status,
    placedAt: new Date(Date.UTC(2026, 7, 24 - (index % 18), 2 + (index % 8))).toISOString(),
    trackingNo: status === "SHIPPED" || status === "DELIVERED" || status === "SETTLED" ? `SF${92841000 + index}` : undefined,
  };
});

export const demoWallets: WalletSnapshot[] = demoMembers.map((member, index) => ({
  memberId: member.id,
  pendingBonusTwd: (index * 190) % 6200,
  accumulationTwd: [3900, 0, 1300, 1500, 2200][index % 5],
  cashTwd: 2000 + ((index * 1000) % 18000),
  shoppingPoints: (index % 7) * 2000,
  heldBonusTwd: member.status === "FROZEN" || member.status === "SUSPENDED" ? 2700 + index * 10 : 0,
}));

export const feedbackAnnotations: FeedbackAnnotation[] = [
  { id: "fb01", route: "/admin/settlements", targetLabel: "月結確認按鈕", author: "營運管理 03", content: "確認前增加本批次總筆數與總額提示。", status: "OPEN", createdAt: "2026-08-26T02:20:00.000Z" },
  { id: "fb02", route: "/member/wallet", targetLabel: "購物點數卡片", author: "會員測試 07", content: "點數希望能直接連到可兌換商品。", status: "REPLIED", createdAt: "2026-08-25T08:12:00.000Z" },
  { id: "fb03", route: "/vendor/products", targetLabel: "庫存欄位", author: "合作廠商 02", content: "低庫存應顯示不同狀態。", status: "DONE", createdAt: "2026-08-24T05:45:00.000Z" },
];

export const auditEvents: AuditEvent[] = [
  { id: "a01", actor: "財務專員 01", action: "完成提領付款", target: "WD-202608-0018", createdAt: "2026-08-26T07:42:00.000Z", result: "SUCCESS" },
  { id: "a02", actor: "營運管理 02", action: "建立下月制度版本", target: "PLAN-2026-09", createdAt: "2026-08-26T06:31:00.000Z", result: "SUCCESS" },
  { id: "a03", actor: "合作廠商 08", action: "嘗試存取會員資料", target: "LK000071", createdAt: "2026-08-26T04:18:00.000Z", result: "BLOCKED" },
  { id: "a04", actor: "營運管理 01", action: "審核商品", target: "LX-營-004", createdAt: "2026-08-25T09:05:00.000Z", result: "SUCCESS" },
];

export function findMember(id?: string) {
  return demoMembers.find((member) => member.id === id) ?? demoMembers[0];
}

export function getMemberChildren(memberId: string) {
  return demoMembers.filter((member) => member.sponsorId === memberId);
}
