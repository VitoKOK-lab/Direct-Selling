import type { Member, MemberStatus } from "@/types/domain";

export const DEFAULT_PLAN_RULES = {
  version: "PLAN-2026-08",
  reserveBps: 1000,
  performanceBps: 9000,
  referralOfPerformanceBps: 1000,
  generationOfPerformanceBps: 500,
  maxGenerations: 10,
  productCostBps: 3000,
  cycleThresholdTwd: 4000,
  cycleCashTwd: 2000,
  cyclePoints: 2000,
  annualDistributionBps: 200,
  settlementDelayDays: 30,
  incomeTaxBps: 1000,
  nhiBps: 211,
} as const;

export interface CompensationPlanVersion {
  version: string;
  reserveBps: number;
  performanceBps: number;
  referralOfPerformanceBps: number;
  generationOfPerformanceBps: number;
  maxGenerations: number;
  productCostBps: number;
  cycleThresholdTwd: number;
  cycleCashTwd: number;
  cyclePoints: number;
  annualDistributionBps: number;
  settlementDelayDays: number;
  incomeTaxBps: number;
  nhiBps: number;
}

export interface OrderAllocation {
  amountTwd: number;
  reserveTwd: number;
  performanceValue: number;
  referralBudgetTwd: number;
  generationBudgetTwd: number;
  productCostTwd: number;
  operatingMarginTwd: number;
  conserved: boolean;
}

export interface PerformanceEvent {
  idempotencyKey: string;
  memberId: string;
  amountTwd: number;
  type: "ORDER" | "RESALE";
  sourceId: string;
  settlementMonth: string;
  planVersion: string;
}

export interface BonusLedgerEntry {
  id: string;
  eventKey: string;
  memberId: string;
  sourceMemberId: string;
  amountTwd: number;
  bonusType: "REFERRAL" | "GENERATION";
  generation?: number;
  destination: "ACCUMULATION" | "HELD";
  statusAtCalculation: MemberStatus;
  planVersion: string;
}

export interface WaterPoolEntry {
  id: string;
  eventKey: string;
  sourceMemberId: string;
  expectedMemberId: string | null;
  amountTwd: number;
  category: "UNPAID_REFERRAL" | "MISSING_GENERATION" | "INELIGIBLE_GENERATION" | "LOCKED_GENERATION";
  generation?: number;
  planVersion: string;
}

export interface EventAllocation {
  orderAllocation: OrderAllocation;
  bonuses: BonusLedgerEntry[];
  waterPool: WaterPoolEntry[];
}

export interface CycleResult {
  memberId: string;
  cycleNo: number;
  consumedTwd: number;
  cashTwd: number;
  points: number;
  resaleEventKey: string;
}

export interface SettlementResult {
  processedEventKeys: string[];
  allocations: Array<{ eventKey: string; allocation: OrderAllocation }>;
  bonuses: BonusLedgerEntry[];
  waterPool: WaterPoolEntry[];
  cycles: CycleResult[];
  remainingAccumulations: Record<string, number>;
  cashCredits: Record<string, number>;
  pointCredits: Record<string, number>;
}

const byBasisPoints = (amount: number, basisPoints: number) => Math.floor((amount * basisPoints) / 10_000);

export function calculateCycleSplit(
  accumulationTwd: number,
  rules: CompensationPlanVersion = DEFAULT_PLAN_RULES,
) {
  if (!Number.isInteger(accumulationTwd) || accumulationTwd < 0) throw new Error("獎金累積必須是非負整數臺幣");
  const cycles = Math.floor(accumulationTwd / rules.cycleThresholdTwd);
  return {
    cycles,
    consumedTwd: cycles * rules.cycleThresholdTwd,
    cashTwd: cycles * rules.cycleCashTwd,
    points: cycles * rules.cyclePoints,
    remainderTwd: accumulationTwd % rules.cycleThresholdTwd,
  };
}

export function calculateOrderAllocation(
  amountTwd: number,
  rules: CompensationPlanVersion = DEFAULT_PLAN_RULES,
): OrderAllocation {
  if (!Number.isInteger(amountTwd) || amountTwd <= 0) throw new Error("訂單金額必須是正整數臺幣");

  const reserveTwd = byBasisPoints(amountTwd, rules.reserveBps);
  const performanceValue = byBasisPoints(amountTwd, rules.performanceBps);
  const referralBudgetTwd = byBasisPoints(performanceValue, rules.referralOfPerformanceBps);
  const generationBudgetTwd = byBasisPoints(
    performanceValue,
    rules.generationOfPerformanceBps * rules.maxGenerations,
  );
  const productCostTwd = byBasisPoints(amountTwd, rules.productCostBps);
  const operatingMarginTwd = amountTwd - reserveTwd - referralBudgetTwd - generationBudgetTwd - productCostTwd;

  return {
    amountTwd,
    reserveTwd,
    performanceValue,
    referralBudgetTwd,
    generationBudgetTwd,
    productCostTwd,
    operatingMarginTwd,
    conserved: reserveTwd + referralBudgetTwd + generationBudgetTwd + productCostTwd + operatingMarginTwd === amountTwd,
  };
}

function memberLookup(members: Member[]) {
  return new Map(members.map((member) => [member.id, member]));
}

function directSponsor(member: Member | undefined, lookup: Map<string, Member>) {
  return member?.sponsorId ? lookup.get(member.sponsorId) : undefined;
}

function eligibleDestination(status: MemberStatus): "ACCUMULATION" | "HELD" | null {
  if (status === "NORMAL") return "ACCUMULATION";
  if (status === "FROZEN" || status === "SUSPENDED") return "HELD";
  return null;
}

export function allocatePerformanceEvent(
  event: PerformanceEvent,
  members: Member[],
  rules: CompensationPlanVersion = DEFAULT_PLAN_RULES,
): EventAllocation {
  const lookup = memberLookup(members);
  const sourceMember = lookup.get(event.memberId);
  if (!sourceMember) throw new Error(`找不到業績會員：${event.memberId}`);

  const orderAllocation = calculateOrderAllocation(event.amountTwd, rules);
  const generationAmount = byBasisPoints(orderAllocation.performanceValue, rules.generationOfPerformanceBps);
  const bonuses: BonusLedgerEntry[] = [];
  const waterPool: WaterPoolEntry[] = [];
  const sponsor = directSponsor(sourceMember, lookup);
  const sponsorDestination = sponsor ? eligibleDestination(sponsor.status) : null;

  if (sponsor && sponsorDestination) {
    bonuses.push({
      id: `${event.idempotencyKey}:referral`,
      eventKey: event.idempotencyKey,
      memberId: sponsor.id,
      sourceMemberId: sourceMember.id,
      amountTwd: orderAllocation.referralBudgetTwd,
      bonusType: "REFERRAL",
      destination: sponsorDestination,
      statusAtCalculation: sponsor.status,
      planVersion: event.planVersion,
    });
  } else {
    waterPool.push({
      id: `${event.idempotencyKey}:pool:referral`,
      eventKey: event.idempotencyKey,
      sourceMemberId: sourceMember.id,
      expectedMemberId: sponsor?.id ?? null,
      amountTwd: orderAllocation.referralBudgetTwd,
      category: "UNPAID_REFERRAL",
      planVersion: event.planVersion,
    });
  }

  let ancestor = sponsor;
  for (let generation = 1; generation <= rules.maxGenerations; generation += 1) {
    if (!ancestor) {
      waterPool.push({
        id: `${event.idempotencyKey}:pool:g${generation}`,
        eventKey: event.idempotencyKey,
        sourceMemberId: sourceMember.id,
        expectedMemberId: null,
        amountTwd: generationAmount,
        category: "MISSING_GENERATION",
        generation,
        planVersion: event.planVersion,
      });
      continue;
    }

    const destination = eligibleDestination(ancestor.status);
    if (!destination) {
      waterPool.push({
        id: `${event.idempotencyKey}:pool:g${generation}`,
        eventKey: event.idempotencyKey,
        sourceMemberId: sourceMember.id,
        expectedMemberId: ancestor.id,
        amountTwd: generationAmount,
        category: "INELIGIBLE_GENERATION",
        generation,
        planVersion: event.planVersion,
      });
    } else if (ancestor.unlockedGenerations < generation) {
      waterPool.push({
        id: `${event.idempotencyKey}:pool:g${generation}`,
        eventKey: event.idempotencyKey,
        sourceMemberId: sourceMember.id,
        expectedMemberId: ancestor.id,
        amountTwd: generationAmount,
        category: "LOCKED_GENERATION",
        generation,
        planVersion: event.planVersion,
      });
    } else {
      bonuses.push({
        id: `${event.idempotencyKey}:generation:${generation}`,
        eventKey: event.idempotencyKey,
        memberId: ancestor.id,
        sourceMemberId: sourceMember.id,
        amountTwd: generationAmount,
        bonusType: "GENERATION",
        generation,
        destination,
        statusAtCalculation: ancestor.status,
        planVersion: event.planVersion,
      });
    }

    ancestor = directSponsor(ancestor, lookup);
  }

  return { orderAllocation, bonuses, waterPool };
}

export function processSettlement(
  initialEvents: PerformanceEvent[],
  members: Member[],
  initialAccumulations: Record<string, number> = {},
  rules: CompensationPlanVersion = DEFAULT_PLAN_RULES,
): SettlementResult {
  const queue = [...initialEvents];
  const processed = new Set<string>();
  const accumulation = { ...initialAccumulations };
  const cashCredits: Record<string, number> = {};
  const pointCredits: Record<string, number> = {};
  const cycleCounts: Record<string, number> = {};
  const result: SettlementResult = {
    processedEventKeys: [],
    allocations: [],
    bonuses: [],
    waterPool: [],
    cycles: [],
    remainingAccumulations: accumulation,
    cashCredits,
    pointCredits,
  };

  while (queue.length > 0) {
    if (processed.size > 10_000) throw new Error("重銷事件超過安全上限，請檢查制度參數");
    const event = queue.shift();
    if (!event || processed.has(event.idempotencyKey)) continue;
    processed.add(event.idempotencyKey);

    const allocated = allocatePerformanceEvent(event, members, rules);
    result.processedEventKeys.push(event.idempotencyKey);
    result.allocations.push({ eventKey: event.idempotencyKey, allocation: allocated.orderAllocation });
    result.bonuses.push(...allocated.bonuses);
    result.waterPool.push(...allocated.waterPool);

    for (const bonus of allocated.bonuses) {
      if (bonus.destination !== "ACCUMULATION") continue;
      accumulation[bonus.memberId] = (accumulation[bonus.memberId] ?? 0) + bonus.amountTwd;

      while (accumulation[bonus.memberId] >= rules.cycleThresholdTwd) {
        accumulation[bonus.memberId] -= rules.cycleThresholdTwd;
        const cycleNo = (cycleCounts[bonus.memberId] ?? 0) + 1;
        cycleCounts[bonus.memberId] = cycleNo;
        cashCredits[bonus.memberId] = (cashCredits[bonus.memberId] ?? 0) + rules.cycleCashTwd;
        pointCredits[bonus.memberId] = (pointCredits[bonus.memberId] ?? 0) + rules.cyclePoints;
        const resaleEventKey = `resale:${bonus.memberId}:${event.settlementMonth}:${cycleNo}`;
        result.cycles.push({
          memberId: bonus.memberId,
          cycleNo,
          consumedTwd: rules.cycleThresholdTwd,
          cashTwd: rules.cycleCashTwd,
          points: rules.cyclePoints,
          resaleEventKey,
        });
        queue.push({
          idempotencyKey: resaleEventKey,
          memberId: bonus.memberId,
          amountTwd: rules.cyclePoints,
          type: "RESALE",
          sourceId: resaleEventKey,
          settlementMonth: event.settlementMonth,
          planVersion: event.planVersion,
        });
      }
    }
  }

  return result;
}

export function calculateWithdrawal(
  grossTwd: number,
  flags: { incomeTaxApplicable: boolean; nhiApplicable: boolean },
  rules: CompensationPlanVersion = DEFAULT_PLAN_RULES,
) {
  if (!Number.isInteger(grossTwd) || grossTwd <= 0) throw new Error("提領金額必須是正整數臺幣");
  const incomeTaxTwd = flags.incomeTaxApplicable ? byBasisPoints(grossTwd, rules.incomeTaxBps) : 0;
  const nhiTwd = flags.nhiApplicable ? byBasisPoints(grossTwd, rules.nhiBps) : 0;
  return { grossTwd, incomeTaxTwd, nhiTwd, netTwd: grossTwd - incomeTaxTwd - nhiTwd };
}

export function calculateAnnualDistribution(
  afterTaxDistributableProfitTwd: number,
  eligibleMemberIds: string[],
  rules: CompensationPlanVersion = DEFAULT_PLAN_RULES,
) {
  if (eligibleMemberIds.length === 0) return { poolTwd: 0, perMemberTwd: 0, remainderTwd: 0, entries: [] };
  const poolTwd = byBasisPoints(afterTaxDistributableProfitTwd, rules.annualDistributionBps);
  const perMemberTwd = Math.floor(poolTwd / eligibleMemberIds.length);
  const remainderTwd = poolTwd - perMemberTwd * eligibleMemberIds.length;
  return {
    poolTwd,
    perMemberTwd,
    remainderTwd,
    entries: eligibleMemberIds.map((memberId) => ({ memberId, amountTwd: perMemberTwd })),
  };
}
