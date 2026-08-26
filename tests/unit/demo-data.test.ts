import { describe, expect, it } from "vitest";
import { createDemoMembers, demoAccounts, demoMembers } from "@/lib/demo-data";

describe("固定驗收資料", () => {
  it("每次產生相同的 200 人組織", () => {
    expect(createDemoMembers()).toEqual(createDemoMembers());
    expect(demoMembers).toHaveLength(200);
    expect(new Set(demoMembers.map((member) => member.memberNo)).size).toBe(200);
  });

  it("四角色各有 10 組測試帳號", () => {
    expect(demoAccounts).toHaveLength(40);
    for (const role of ["member", "vendor", "admin", "finance"]) {
      expect(demoAccounts.filter((account) => account.role === role)).toHaveLength(10);
    }
  });

  it("涵蓋所有方案、直推數與會員狀態", () => {
    expect(new Set(demoMembers.map((member) => member.planAmount))).toEqual(new Set([2000, 4000, 12000]));
    expect(Math.max(...demoMembers.map((member) => member.directCount))).toBe(7);
    expect(Math.min(...demoMembers.map((member) => member.directCount))).toBe(0);
    expect(new Set(demoMembers.map((member) => member.status))).toEqual(new Set(["NORMAL", "FROZEN", "SUSPENDED", "EXITED", "INVALID"]));
  });

  it("推薦關係固定且不會形成循環", () => {
    const byId = new Map(demoMembers.map((member) => [member.id, member]));
    for (const member of demoMembers) {
      const visited = new Set<string>();
      let current = member;
      while (current.sponsorId) {
        expect(visited.has(current.id)).toBe(false);
        visited.add(current.id);
        current = byId.get(current.sponsorId)!;
      }
    }
  });
});
