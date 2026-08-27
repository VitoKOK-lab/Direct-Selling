"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  Bell,
  BookOpenCheck,
  Boxes,
  Building2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileBarChart,
  FileClock,
  Gift,
  HandCoins,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Network,
  PackageCheck,
  PanelLeftClose,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tags,
  Truck,
  Users,
  WalletCards,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { FeedbackWidget } from "@/components/feedback-widget";
import { RoleView } from "@/components/role-views";
import { roleLabels } from "@/lib/format";
import type { DemoAccount, Role } from "@/types/domain";

interface NavItem { key: string; label: string; icon: LucideIcon; alert?: string }

const navByRole: Record<Role, NavItem[]> = {
  member: [
    { key: "overview", label: "會員總覽", icon: LayoutDashboard },
    { key: "shop", label: "會員商城", icon: Store },
    { key: "orders", label: "我的訂單", icon: ShoppingBag },
    { key: "organization", label: "推薦組織", icon: Network },
    { key: "wallet", label: "獎金錢包", icon: WalletCards },
    { key: "resale", label: "重銷中心", icon: Gift },
    { key: "withdraw", label: "提領申請", icon: HandCoins },
  ],
  vendor: [
    { key: "overview", label: "廠商總覽", icon: LayoutDashboard },
    { key: "products", label: "商品管理", icon: Boxes, alert: "2" },
    { key: "fulfillment", label: "訂單出貨", icon: Truck, alert: "7" },
    { key: "inventory", label: "庫存管理", icon: PackageCheck },
    { key: "returns", label: "退換貨", icon: ClipboardCheck },
    { key: "settlements", label: "結算資料", icon: FileClock },
  ],
  admin: [
    { key: "overview", label: "營運總覽", icon: LayoutDashboard },
    { key: "members", label: "會員管理", icon: Users },
    { key: "organization", label: "組織查詢", icon: Network },
    { key: "vendors", label: "廠商管理", icon: Building2 },
    { key: "products", label: "商品審核", icon: Tags, alert: "2" },
    { key: "orders", label: "訂單管理", icon: ShoppingBag },
    { key: "plan", label: "制度版本", icon: Settings2 },
    { key: "settlements", label: "月結批次", icon: BookOpenCheck },
    { key: "water-pool", label: "大水庫", icon: Waves },
    { key: "annual", label: "年度分配", icon: CircleDollarSign },
    { key: "reports", label: "營運報表", icon: FileBarChart },
    { key: "audit", label: "稽核紀錄", icon: ShieldCheck },
    { key: "logins", label: "登入紀錄", icon: KeyRound },
    { key: "feedback", label: "回饋標註", icon: MessageSquareText, alert: "1" },
  ],
  finance: [
    { key: "overview", label: "財務總覽", icon: LayoutDashboard },
    { key: "settlements", label: "月結批次", icon: BookOpenCheck, alert: "1" },
    { key: "withdrawals", label: "提領審核", icon: BadgeDollarSign, alert: "8" },
    { key: "ledger", label: "分類流水", icon: FileClock },
    { key: "withholding", label: "扣繳試算", icon: CircleDollarSign },
    { key: "water-pool", label: "大水庫帳務", icon: Waves },
    { key: "exports", label: "報表匯出", icon: FileBarChart },
  ],
};

export function PortalShell({ account, role, section }: { account: DemoAccount; role: Role; section: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const router = useRouter();
  const nav = navByRole[role];
  const current = useMemo(() => nav.find((item) => item.key === section) ?? nav[0], [nav, section]);

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <>
      <div className="flex h-[72px] items-center justify-between border-b border-white/8 px-4">
        <Link href={`/${role}`} className="flex min-h-11 items-center gap-3 rounded-lg px-1" aria-label="LUXKEY 首頁">
          <div className="grid size-9 place-items-center border border-[#d1ab57]/40 bg-[#d1ab57]/10 text-[#dfc579]"><Sparkles className="size-4" /></div>
          {!collapsed && <div><p className="text-[0.625rem] font-bold tracking-[.28em] text-[#d9b95f]">LUXKEY</p><p className="text-xs text-[#a89f93]">示範驗證系統</p></div>}
        </Link>
        <button onClick={() => setMobileOpen(false)} className="grid size-11 place-items-center rounded-lg text-[#cfc7ba] hover:bg-[#2a2521] lg:hidden" aria-label="關閉選單"><X className="size-5" /></button>
      </div>
      <div className="px-3 pt-4">
        {!collapsed && <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#d1ab57]/16 bg-[#d1ab57]/8 px-3 py-2 text-xs text-[#dfc579]"><span className="size-1.5 rounded-full bg-[#d9b95f]" />{roleLabels[role]}工作台</div>}
        <nav className="space-y-1" aria-label={`${roleLabels[role]}功能選單`}>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = section === item.key || (section === "overview" && item.key === "overview");
            return <Link key={item.key} href={item.key === "overview" ? `/${role}` : `/${role}/${item.key}`} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined} className={`group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition ${active ? "bg-[#c39636] text-[#17120c] shadow-[inset_3px_0_0_#f1d695]" : "text-[#cfc7ba] hover:bg-[#2a2521] hover:text-white"}`}>
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              {!collapsed && <><span className="flex-1">{item.label}</span>{item.alert && <span className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[0.625rem] font-bold ${active ? "bg-black/15" : "bg-[#332d26] text-[#e3c776]"}`}>{item.alert}</span>}</>}
            </Link>;
          })}
        </nav>
      </div>
      <div className="mt-auto border-t border-white/8 p-3">
        <button onClick={() => setCollapsed((value) => !value)} className="hidden min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#a89f93] hover:bg-[#2a2521] hover:text-white lg:flex" aria-label={collapsed ? "展開側邊欄" : "收合側邊欄"}><PanelLeftClose className={`size-[18px] transition ${collapsed ? "rotate-180" : ""}`} />{!collapsed && "收合選單"}</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f3f1ed]">
      <aside className={`fixed inset-y-0 left-0 z-50 hidden flex-col bg-[#171412] transition-[width] duration-200 lg:flex ${collapsed ? "w-[76px]" : "w-[244px]"}`}>{sidebar}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-black/45 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="flex h-full w-[286px] flex-col bg-[#171412] shadow-2xl" onClick={(event) => event.stopPropagation()}>{sidebar}</aside></div>}

      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[244px]"}`}>
        <div className="bg-[#2a241f] px-3 py-2 text-center text-[0.6875rem] font-semibold tracking-wide text-[#ead59e]">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-[#e0b959] align-middle" />示範資料／非正式交易 · 所有付款、發票、撥款與扣繳皆為模擬
        </div>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#ded9d2] bg-[#fffdfa]/95 px-3 backdrop-blur sm:px-5">
          <button onClick={() => setMobileOpen(true)} className="grid size-11 place-items-center rounded-lg text-stone-600 hover:bg-stone-100 lg:hidden" aria-label="開啟選單"><Menu className="size-5" /></button>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#292524]">{current.label}</p><p className="hidden text-[0.625rem] text-stone-400 sm:block">LUXKEY / {roleLabels[role]} / {current.label}</p></div>
          <button className="hidden min-h-10 w-full max-w-[280px] items-center gap-2 rounded-lg border border-[#ded9d2] bg-white px-3 text-left text-sm text-stone-400 hover:border-[#b8afa5] md:flex"><Search className="size-4" />搜尋會員、訂單或流水 <kbd className="ml-auto rounded border border-stone-200 px-1.5 py-0.5 text-[0.625rem]">⌘ K</kbd></button>
          <div className="relative">
            <button onClick={() => setNoticeOpen((value) => !value)} className="relative grid size-11 place-items-center rounded-lg text-stone-600 hover:bg-stone-100" aria-label="通知"><Bell className="size-5" /><span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-[#a16207]" /></button>
            {noticeOpen && <div className="absolute right-0 top-12 w-[310px] rounded-xl border border-[#ded9d2] bg-[#fffdfa] p-3 shadow-xl animate-enter"><p className="px-2 py-1 text-xs font-bold tracking-wide text-stone-500">最新通知</p>{["2026 年 8 月月結批次待確認", "2 項商品等待審核", "1 則頁面標註尚未處理"].map((text, index) => <div key={text} className="mt-1 flex gap-3 rounded-lg p-2.5 hover:bg-stone-50"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${index === 0 ? "bg-[#a16207]" : "bg-stone-300"}`} /><div><p className="text-sm text-stone-800">{text}</p><p className="mt-0.5 text-[0.625rem] text-stone-400">{index + 1} 小時前</p></div></div>)}</div>}
          </div>
          <div className="relative">
            <button onClick={() => setAccountOpen((value) => !value)} className="flex min-h-11 items-center gap-2 rounded-lg px-1.5 hover:bg-stone-100" aria-expanded={accountOpen}><span className="grid size-8 place-items-center rounded-full bg-[#2d2824] text-xs font-bold text-[#e2c77f]">{account.displayName.slice(-2)}</span><span className="hidden text-left xl:block"><span className="block text-xs font-semibold text-stone-800">{account.displayName}</span><span className="block text-[0.625rem] text-stone-400">{account.username}</span></span><ChevronDown className="hidden size-4 text-stone-400 sm:block" /></button>
            {accountOpen && <div className="absolute right-0 top-12 w-56 rounded-xl border border-[#ded9d2] bg-[#fffdfa] p-2 shadow-xl animate-enter"><div className="border-b border-stone-100 px-3 py-2"><p className="text-sm font-semibold">{account.displayName}</p><p className="text-xs text-stone-400">{roleLabels[role]}測試帳號</p></div><button onClick={logout} className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm text-red-700 hover:bg-red-50"><LogOut className="size-4" />登出測試帳號</button></div>}
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1540px] p-3 sm:p-5 lg:p-6">
          <RoleView role={role} section={section} account={account} />
        </main>
      </div>
      <FeedbackWidget route={`/${role}${section === "overview" ? "" : `/${section}`}`} author={account.displayName} />
    </div>
  );
}
