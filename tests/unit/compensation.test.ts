import { describe, expect, it } from "vitest";
import {
  allocatePerformanceEvent,
  calculateAnnualDistribution,
  calculateCycleSplit,
  calculateOrderAllocation,
  calculateWithdrawal,
  processSettlement,
  type PerformanceEvent,
} from "@/lib/compensation";
import { createDemoMembers, unlockedGenerations } from "@/lib/demo-data";

describe("訂單完整資金正推", () => {
  it.each([
    [2000, 200, 1800, 180, 900, 600, 120],
    [4000, 400, 3600, 360, 1800, 1200, 240],
    [12000, 1200, 10800, 1080, 5400, 3600, 720],
  ])("%i 元方案符合附件比例並守恆", (amount, reserve, pv, referral, generations, cost, margin) => {
    const result = calculateOrderAllocation(amount);
    expect(result).toMatchObject({ amountTwd: amount, reserveTwd: reserve, performanceValue: pv, referralBudgetTwd: referral, generationBudgetTwd: generations, productCostTwd: cost, operatingMarginTwd: margin, conserved: true });
  });
});

describe("動態代數", () => {
  it("依方案與有效直推開放代數，上限為 10", () => {
    expect(unlockedGenerations(2000, 0)).toBe(3);
    expect(unlockedGenerations(2000, 7)).toBe(10);
    expect(unlockedGenerations(4000, 0)).toBe(5);
    expect(unlockedGenerations(4000, 5)).toBe(10);
    expect(unlockedGenerations(12000, 0)).toBe(10);
  });
});

describe("十代獎金與大水庫", () => {
  const members = createDemoMembers();
  const source = members.find((member) => member.depth >= 3 && member.status === "NORMAL")!;
  const event: PerformanceEvent = { idempotencyKey: "test:order:1", memberId: source.id, amountTwd: 2000, type: "ORDER", sourceId: "order-1", settlementMonth: "2026-08", planVersion: "PLAN-2026-08" };

  it("有效推薦人可同時取得介紹獎金與第一代組織獎金", () => {
    const result = allocatePerformanceEvent(event, members);
    const sponsorId = source.sponsorId;
    expect(result.bonuses.some((entry) => entry.memberId === sponsorId && entry.bonusType === "REFERRAL" && entry.amountTwd === 180)).toBe(true);
    expect(result.bonuses.some((entry) => entry.memberId === sponsorId && entry.bonusType === "GENERATION" && entry.generation === 1 && entry.amountTwd === 90)).toBe(true);
  });

  it("不足十代的固定位置進大水庫且不遞補", () => {
    const shallow = members.find((member) => member.depth === 1 && member.status === "NORMAL")!;
    const result = allocatePerformanceEvent({ ...event, idempotencyKey: "test:order:2", memberId: shallow.id }, members);
    expect(result.waterPool.filter((entry) => entry.category === "MISSING_GENERATION").length).toBeGreaterThan(0);
    expect(result.bonuses.every((entry) => (entry.generation ?? 0) <= shallow.depth)).toBe(true);
  });

  it("重複事件鍵在同一批次只處理一次", () => {
    const result = processSettlement([event, event], members);
    expect(result.processedEventKeys.filter((key) => key === event.idempotencyKey)).toHaveLength(1);
  });
});

describe("4,000 元循環", () => {
  it.each([
    [3900, 0, 0, 0, 3900],
    [4000, 1, 2000, 2000, 0],
    [5300, 1, 2000, 2000, 1300],
    [8000, 2, 4000, 4000, 0],
    [9500, 2, 4000, 4000, 1500],
  ])("累積 %i 的切分正確", (amount, cycles, cash, points, remainder) => {
    expect(calculateCycleSplit(amount)).toEqual({ cycles, consumedTwd: cycles * 4000, cashTwd: cash, points, remainderTwd: remainder });
  });
});

describe("扣繳與年度分配", () => {
  it("依會員旗標分列總額、扣款與實付", () => {
    expect(calculateWithdrawal(30000, { incomeTaxApplicable: true, nhiApplicable: true })).toEqual({ grossTwd: 30000, incomeTaxTwd: 3000, nhiTwd: 633, netTwd: 26367 });
  });

  it("年度盈餘 1,000 萬、提撥 2%、100 人時每人 2,000", () => {
    const result = calculateAnnualDistribution(10_000_000, Array.from({ length: 100 }, (_, index) => `m${index}`));
    expect(result.poolTwd).toBe(200_000);
    expect(result.perMemberTwd).toBe(2_000);
    expect(result.remainderTwd).toBe(0);
  });
});
