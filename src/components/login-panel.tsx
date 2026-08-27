"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeDollarSign, Building2, Check, LockKeyhole, ShieldCheck, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import type { Role } from "@/types/domain";

const roleOptions: Array<{ role: Role; label: string; account: string; icon: typeof UserRound; description: string }> = [
  { role: "member", label: "會員中心", account: "member01", icon: UserRound, description: "商城、組織與獎金錢包" },
  { role: "vendor", label: "廠商中心", account: "vendor01", icon: Building2, description: "商品、庫存與出貨履約" },
  { role: "admin", label: "營運管理", account: "admin01", icon: ShieldCheck, description: "制度、組織與全域稽核" },
  { role: "finance", label: "財務中心", account: "finance01", icon: BadgeDollarSign, description: "月結、提領與帳務確認" },
];

export function LoginPanel() {
  const router = useRouter();
  const [username, setUsername] = useState("member01");
  const [password, setPassword] = useState("Demo1234!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedUsername = String(formData.get("username") ?? "");
    const submittedPassword = String(formData.get("password") ?? "");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: submittedUsername, password: submittedPassword }),
      });
      const payload = (await response.json()) as { account?: { role: Role }; message?: string };
      if (!response.ok || !payload.account) throw new Error(payload.message ?? "登入失敗");
      router.push(`/${payload.account.role}`);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "登入失敗，請稍後再試。");
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#eeece8] p-3 sm:p-6 lg:p-10">
      <section className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[28px] border border-black/10 bg-[#fffdfa] shadow-[0_30px_100px_rgba(28,25,23,.16)] sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-[#151210] px-6 py-7 text-white sm:px-10 sm:py-10 lg:min-h-0 lg:px-14 lg:py-12">
          <div className="absolute inset-0 opacity-60" aria-hidden="true" style={{ background: "radial-gradient(circle at 80% 20%, rgba(189,140,45,.28), transparent 32%), linear-gradient(135deg, transparent 30%, rgba(255,255,255,.025) 30% 31%, transparent 31% 70%, rgba(189,140,45,.08) 70%)" }} />
          <div className="relative">
            <div className="mb-14 flex items-center gap-3">
              <div className="grid size-11 place-items-center border border-[#c59a43]/55 bg-[#c59a43]/10 text-[#e2c680]">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[0.6875rem] font-semibold tracking-[.34em] text-[#d6b86e]">LUXKEY</p>
                <p className="mt-0.5 text-sm text-white/60">會員商城暨分潤系統</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c59a43]/30 bg-[#c59a43]/10 px-3 py-1.5 text-xs font-semibold text-[#e2c680]">
              <span className="size-1.5 rounded-full bg-[#d9b65d]" />
              示範驗證環境
            </span>
            <h1 className="mt-8 text-2xl font-semibold tracking-[-.02em] text-[#efe9dd]">系統登入</h1>
            <dl className="mt-6 max-w-md divide-y divide-white/10 border-y border-white/10 text-sm">
              {[["系統代號", "LUXKEY-DEMO"], ["環境", "示範驗證（非正式營運）"], ["資料情境", "200 名合成會員・固定推薦組織"], ["權限模組", "會員／廠商／營運管理／財務"]].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-6 py-3">
                  <dt className="shrink-0 text-[#a89f93]">{label}</dt>
                  <dd className="font-data text-right text-[#e6ddcd]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex items-center justify-center p-5 sm:p-10 lg:p-14">
          <div className="w-full max-w-[520px]">
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[.16em] text-[#8a6107]">
                <LockKeyhole className="size-4" aria-hidden="true" /> 安全測試登入
              </div>
              <h2 className="text-3xl font-semibold tracking-[-.035em] text-[#171412]">選擇角色開始驗證</h2>
              <p className="mt-2 text-sm leading-6 text-[#78716c]">四種角色各有 10 組帳號；下方快速選擇會自動帶入第一組。</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5" aria-label="測試角色">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const active = username.startsWith(option.role);
                return (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() => setUsername(option.account)}
                    className={`min-h-24 rounded-xl border p-3.5 text-left transition duration-200 ${active ? "border-[#a16207] bg-[#fbf4e4] shadow-[inset_0_0_0_1px_rgba(161,98,7,.08)]" : "border-[#ded9d2] bg-white hover:border-[#b8afa5] hover:bg-[#faf9f7]"}`}
                    aria-pressed={active}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Icon className={`size-5 ${active ? "text-[#8a6107]" : "text-[#57534e]"}`} aria-hidden="true" />
                      {active && <span className="grid size-5 place-items-center rounded-full bg-[#8a6107] text-white"><Check className="size-3" /></span>}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#1c1917]">{option.label}</p>
                    <p className="mt-0.5 hidden text-[0.6875rem] text-[#78716c] sm:block">{option.description}</p>
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#292524]">測試帳號</span>
                <input name="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="h-12 w-full rounded-lg border border-[#cfc8bf] bg-white px-4 text-[#1c1917] transition focus:border-[#a16207] focus:outline-none" />
                <span className="mt-1.5 block text-xs text-[#78716c]">可使用 member01–10、vendor01–10、admin01–10、finance01–10</span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#292524]">測試密碼</span>
                <input name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="h-12 w-full rounded-lg border border-[#cfc8bf] bg-white px-4 text-[#1c1917] transition focus:border-[#a16207] focus:outline-none" />
              </label>
              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
              <button disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1c1917] px-4 font-semibold text-white transition duration-200 hover:bg-[#342e2a] disabled:cursor-wait disabled:opacity-60">
                {loading ? "正在建立安全工作階段…" : "進入示範系統"}<ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e5ded3] bg-[#faf8f3] p-4 text-xs leading-5 text-[#625d57]">
              <ShoppingBag className="mt-0.5 size-4 shrink-0 text-[#8a6107]" aria-hidden="true" />
              本環境僅使用合成資料與模擬交易，不會產生真實付款、發票、撥款或法定扣繳。
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
