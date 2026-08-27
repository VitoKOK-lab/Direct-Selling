import "server-only";
import type { Role } from "@/types/domain";

export interface LoginRecord {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  at: string;
  ip: string;
  device: string;
  userAgent: string;
}

const MAX_RECORDS = 200;

/** 從 User-Agent 摘要出好讀的裝置描述（示範版簡易判斷）。 */
export function summarizeUserAgent(userAgent: string): string {
  if (!userAgent) return "未知裝置";
  const os = /iPhone|iPad/.test(userAgent) ? "iOS"
    : /Android/.test(userAgent) ? "Android"
    : /Macintosh/.test(userAgent) ? "macOS"
    : /Windows/.test(userAgent) ? "Windows"
    : /Linux/.test(userAgent) ? "Linux"
    : "其他";
  const browser = /Edg\//.test(userAgent) ? "Edge"
    : /OPR\//.test(userAgent) ? "Opera"
    : /Chrome\//.test(userAgent) ? "Chrome"
    : /Safari\//.test(userAgent) ? "Safari"
    : /Firefox\//.test(userAgent) ? "Firefox"
    : /curl|axios|node/i.test(userAgent) ? "API 用戶端"
    : "其他瀏覽器";
  return `${os} · ${browser}`;
}

const seedEntries: Omit<LoginRecord, "id">[] = [
  { username: "admin01", displayName: "營運管理 01", role: "admin", at: "2026-08-26T09:12:00+08:00", ip: "203.0.113.10", device: "macOS · Chrome", userAgent: "seed" },
  { username: "member01", displayName: "林子晴", role: "member", at: "2026-08-26T10:47:00+08:00", ip: "198.51.100.24", device: "iOS · Safari", userAgent: "seed" },
  { username: "finance01", displayName: "財務專員 01", role: "finance", at: "2026-08-26T14:03:00+08:00", ip: "203.0.113.77", device: "Windows · Edge", userAgent: "seed" },
  { username: "vendor01", displayName: "合作廠商 01", role: "vendor", at: "2026-08-26T16:31:00+08:00", ip: "198.51.100.9", device: "Android · Chrome", userAgent: "seed" },
];
const seedRecords: LoginRecord[] = seedEntries.map((entry, index) => ({ ...entry, id: `seed-${index + 1}` }));

// 保存在模組層記憶體（掛在 globalThis 以耐開發模式熱更新）。
// 示範版限制：serverless 執行個體回收或重新部署後會重置；正式營運應寫入資料庫。
const store = globalThis as typeof globalThis & { __luxkeyLoginLog?: LoginRecord[] };
const records = (store.__luxkeyLoginLog ??= [...seedRecords]);

export function recordLogin(input: { username: string; displayName: string; role: Role; ip: string; userAgent: string }) {
  records.unshift({
    id: `login-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: input.username,
    displayName: input.displayName,
    role: input.role,
    at: new Date().toISOString(),
    ip: input.ip,
    device: summarizeUserAgent(input.userAgent),
    userAgent: input.userAgent.slice(0, 300),
  });
  if (records.length > MAX_RECORDS) records.length = MAX_RECORDS;
}

export function getLoginRecords(): LoginRecord[] {
  return [...records];
}
