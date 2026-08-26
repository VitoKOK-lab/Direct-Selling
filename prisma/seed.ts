import { PrismaClient, Role, WalletType } from "@prisma/client";
import argon2 from "argon2";
import { auditEvents, demoAccounts, demoMembers, demoOrders, demoProducts, demoWallets, feedbackAnnotations } from "../src/lib/demo-data";
import { DEFAULT_PLAN_RULES } from "../src/lib/compensation";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.auditEvent.deleteMany(),
    prisma.feedbackAnnotation.deleteMany(),
    prisma.annualDistributionEntry.deleteMany(),
    prisma.annualDistributionBatch.deleteMany(),
    prisma.withdrawal.deleteMany(),
    prisma.waterPoolEntry.deleteMany(),
    prisma.walletLedgerEntry.deleteMany(),
    prisma.walletAccount.deleteMany(),
    prisma.bonusLedgerEntry.deleteMany(),
    prisma.performanceEvent.deleteMany(),
    prisma.settlementBatch.deleteMany(),
    prisma.monthlyMemberSnapshot.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany(),
    prisma.member.deleteMany(),
    prisma.vendor.deleteMany(),
    prisma.compensationPlanVersion.deleteMany(),
  ]);

  await prisma.compensationPlanVersion.create({
    data: {
      id: DEFAULT_PLAN_RULES.version,
      effectiveMonth: "2026-08",
      status: "ACTIVE",
      reserveBps: DEFAULT_PLAN_RULES.reserveBps,
      performanceBps: DEFAULT_PLAN_RULES.performanceBps,
      referralOfPerformanceBps: DEFAULT_PLAN_RULES.referralOfPerformanceBps,
      generationOfPerformanceBps: DEFAULT_PLAN_RULES.generationOfPerformanceBps,
      maxGenerations: DEFAULT_PLAN_RULES.maxGenerations,
      productCostBps: DEFAULT_PLAN_RULES.productCostBps,
      cycleThresholdTwd: DEFAULT_PLAN_RULES.cycleThresholdTwd,
      cycleCashTwd: DEFAULT_PLAN_RULES.cycleCashTwd,
      cyclePoints: DEFAULT_PLAN_RULES.cyclePoints,
      annualDistributionBps: DEFAULT_PLAN_RULES.annualDistributionBps,
      settlementDelayDays: DEFAULT_PLAN_RULES.settlementDelayDays,
      incomeTaxBps: DEFAULT_PLAN_RULES.incomeTaxBps,
      nhiBps: DEFAULT_PLAN_RULES.nhiBps,
      lockedAt: new Date("2026-08-01T00:00:00.000Z"),
    },
  });

  for (let index = 0; index < 10; index += 1) {
    await prisma.vendor.create({ data: { id: `v${String(index + 1).padStart(2, "0")}`, vendorNo: `V${String(index + 1).padStart(5, "0")}`, companyName: `經典合作廠商 ${String(index + 1).padStart(2, "0")}`, taxId: `8${index}369392`, contactName: `聯絡窗口 ${index + 1}`, phone: `02-2700-${String(3100 + index).padStart(4, "0")}`, shippingAddress: `臺北市信義區示範路 ${index + 1} 號` } });
  }

  for (const member of demoMembers) {
    await prisma.member.create({ data: { id: member.id, memberNo: member.memberNo, name: member.name, planAmountTwd: member.planAmount, sponsorId: member.sponsorId, status: member.status, joinedAt: new Date(member.joinedAt), directCount: member.directCount, unlockedGenerations: member.unlockedGenerations, depth: member.depth, incomeTaxApplicable: member.incomeTaxApplicable, nhiApplicable: member.nhiApplicable } });
  }

  const passwordHash = await argon2.hash("Demo1234!", { type: argon2.argon2id });
  for (const account of demoAccounts) {
    await prisma.user.create({ data: { username: account.username, passwordHash, displayName: account.displayName, role: account.role.toUpperCase() as Role, memberId: account.memberId, vendorId: account.vendorId } });
  }

  for (const product of demoProducts) {
    await prisma.product.create({ data: product });
  }

  for (const order of demoOrders) {
    await prisma.order.create({ data: { ...order, placedAt: new Date(order.placedAt), settlementEligibleAt: new Date(new Date(order.placedAt).getTime() + DEFAULT_PLAN_RULES.settlementDelayDays * 86_400_000), items: { create: { productId: order.productId, quantity: 1, unitPriceTwd: order.amountTwd } } } });
  }

  for (const member of demoMembers) {
    await prisma.monthlyMemberSnapshot.create({ data: { month: "2026-08", memberId: member.id, planVersionId: DEFAULT_PLAN_RULES.version, planAmountTwd: member.planAmount, directCount: member.directCount, unlockedGenerations: member.unlockedGenerations, memberStatus: member.status, incomeTaxApplicable: member.incomeTaxApplicable, nhiApplicable: member.nhiApplicable } });
    const wallet = demoWallets.find((item) => item.memberId === member.id)!;
    const walletBalances: Array<[WalletType, number]> = [[WalletType.PENDING_BONUS, wallet.pendingBonusTwd], [WalletType.ACCUMULATION, wallet.accumulationTwd], [WalletType.CASH, wallet.cashTwd], [WalletType.SHOPPING_POINTS, wallet.shoppingPoints], [WalletType.HELD_BONUS, wallet.heldBonusTwd]];
    await prisma.walletAccount.createMany({ data: walletBalances.map(([type, balance]) => ({ memberId: member.id, type, balance })) });
  }

  await prisma.feedbackAnnotation.createMany({ data: feedbackAnnotations });
  await prisma.auditEvent.createMany({ data: auditEvents.map((event, index) => ({ ...event, role: [Role.FINANCE, Role.ADMIN, Role.VENDOR, Role.ADMIN][index] })) });
}

main()
  .then(() => console.log("LUXKEY deterministic demo seed completed: 200 members, 40 accounts."))
  .finally(() => prisma.$disconnect());
