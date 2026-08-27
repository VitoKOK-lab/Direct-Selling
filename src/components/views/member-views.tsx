"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Gift,
  Info,
  Landmark,
  Link2,
  LockKeyhole,
  Network,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { DataTable, KpiCard, PageIntro, ProgressBar, SectionHeader, SegmentedBars, StatusBadge, buttonStyles } from "@/components/ui";
import { demoMembers, demoOrders, demoProducts, demoWallets, findMember, getMemberChildren } from "@/lib/demo-data";
import { calculateWithdrawal } from "@/lib/compensation";
import { formatNumber, formatTwd, memberStatusLabels, orderStatusLabels, shortDate } from "@/lib/format";
import type { DemoAccount, DemoOrder, Member, Product } from "@/types/domain";

const statusTone = (status: string) => status === "SETTLED" || status === "NORMAL" ? "normal" : status === "SHIPPED" || status === "DELIVERED" ? "info" : status === "CANCELLED" || status === "INVALID" ? "danger" : "warning";

export function MemberViews({ section, account }: { section: string; account: DemoAccount }) {
  const member = findMember(account.memberId);
  const wallet = demoWallets.find((item) => item.memberId === member.id) ?? demoWallets[0];
  const orders = demoOrders.filter((order) => order.memberId === member.id);
  if (section === "shop") return <MemberShop />;
  if (section === "orders") return <MemberOrders member={member} orders={orders} />;
  if (section === "organization") return <MemberOrganization member={member} />;
  if (section === "wallet") return <MemberWallet member={member} wallet={wallet} />;
  if (section === "resale") return <MemberResale member={member} accumulation={wallet.accumulationTwd} />;
  if (section === "withdraw") return <MemberWithdraw member={member} available={wallet.cashTwd} />;
  return <MemberOverview member={member} wallet={wallet} orders={orders} />;
}

function MemberOverview({ member, wallet, orders }: { member: Member; wallet: (typeof demoWallets)[number]; orders: DemoOrder[] }) {
  const children = getMemberChildren(member.id);
  const cycleProgress = wallet.accumulationTwd;
  return <div className="animate-enter">
    <PageIntro title={`${member.name}，您好`} description={`會員編號 ${member.memberNo} · ${formatNumber(member.planAmount)} 元方案 · 本月可領 ${member.unlockedGenerations} 代`} actions={<><Link className={buttonStyles.secondary} href="/member/organization"><Network className="size-4" />查看組織</Link><Link className={buttonStyles.gold} href="/member/shop"><ShoppingBag className="size-4" />前往商城</Link></>} />
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="待結算獎金" value={formatTwd(wallet.pendingBonusTwd)} helper="退換貨期或月結確認中" trend={{ value: "+12.4%", direction: "up" }} icon={Clock3} tone="stone" />
      <KpiCard label="獎金累積" value={formatTwd(wallet.accumulationTwd)} helper={`距下次循環還差 ${formatTwd(Math.max(0, 4000 - wallet.accumulationTwd))}`} icon={TrendingUp} tone="gold" />
      <KpiCard label="可提領現金" value={formatTwd(wallet.cashTwd)} helper="已形成完整循環的現金部分" trend={{ value: "+2,000", direction: "up" }} icon={WalletCards} tone="green" />
      <KpiCard label="購物點數" value={`${formatNumber(wallet.shoppingPoints)} 點`} helper="1 點折抵新臺幣 1 元" icon={Gift} tone="blue" />
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.18fr_.82fr]">
      <section className="surface rounded-xl p-4 sm:p-5">
        <SectionHeader eyebrow="MONTHLY BONUS" title="本月獎金趨勢" description="正式結算與待結算分開顯示" action={<Link href="/member/wallet" className={buttonStyles.ghost}>查看全部<ChevronRight className="size-4" /></Link>} />
        <div className="grid gap-5 md:grid-cols-[1fr_190px]">
          <SegmentedBars values={[980, 1250, 880, 1620, 1480, 2210, 1950, 2680, 3140, 2460, 3280, 3740]} labels={["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23"]} active={11} />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
            <div className="rounded-lg bg-[#f8f6f2] p-3"><p className="text-[11px] text-stone-500">本月已結算</p><p className="font-data mt-1 text-lg font-semibold">{formatTwd(14820)}</p></div>
            <div className="rounded-lg bg-[#f8efd9] p-3"><p className="text-[11px] text-[#795307]">較上月</p><p className="font-data mt-1 text-lg font-semibold text-[#795307]">+18.6%</p></div>
          </div>
        </div>
      </section>
      <section className="surface rounded-xl p-4 sm:p-5">
        <SectionHeader eyebrow="4,000 CYCLE" title="下一次獎金循環" description="達標後自動切分現金與點數" />
        <div className="rounded-xl bg-[#201c19] p-5 text-white">
          <div className="flex items-start justify-between"><div><p className="text-xs text-white/50">目前累積</p><p className="font-data mt-1 text-3xl font-semibold text-[#e0c47d]">{formatTwd(cycleProgress)}</p></div><Sparkles className="size-6 text-[#d8b961]" /></div>
          <div className="mt-5"><ProgressBar value={cycleProgress} max={4000} label={`${formatNumber(cycleProgress)} / 4,000`} /></div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-white/6 p-3"><p className="text-white/45">達標轉現金</p><p className="font-data mt-1 font-semibold">$2,000</p></div><div className="rounded-lg bg-white/6 p-3"><p className="text-white/45">達標轉點數</p><p className="font-data mt-1 font-semibold">2,000 點</p></div></div>
        </div>
      </section>
    </div>

    <div className="mt-4 grid gap-4 xl:grid-cols-[.82fr_1.18fr]">
      <section className="surface rounded-xl p-4 sm:p-5">
        <SectionHeader eyebrow="ORGANIZATION" title="我的推薦組織" action={<Link className={buttonStyles.ghost} href="/member/organization">展開組織<ChevronRight className="size-4" /></Link>} />
        <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-stone-50 p-3"><p className="font-data text-xl font-semibold">{member.directCount}</p><p className="text-[11px] text-stone-500">有效直推</p></div><div className="rounded-lg bg-stone-50 p-3"><p className="font-data text-xl font-semibold">{member.unlockedGenerations}</p><p className="text-[11px] text-stone-500">可領代數</p></div><div className="rounded-lg bg-stone-50 p-3"><p className="font-data text-xl font-semibold">{children.length * 9 + 12}</p><p className="text-[11px] text-stone-500">組織人數</p></div></div>
        <button className={`${buttonStyles.secondary} mt-4 w-full`} onClick={() => navigator.clipboard?.writeText(`https://demo.luxkey.tw/join/${member.memberNo}`)}><Copy className="size-4" />複製我的推薦連結</button>
      </section>
      <section className="surface overflow-hidden rounded-xl">
        <div className="p-4 pb-2 sm:p-5 sm:pb-2"><SectionHeader eyebrow="ORDERS" title="近期訂單" action={<Link className={buttonStyles.ghost} href="/member/orders">全部訂單<ChevronRight className="size-4" /></Link>} /></div>
        <DataTable headers={["訂單編號", "日期", "金額", "狀態"]} minWidth={520}><>{(orders.length ? orders : demoOrders.slice(0, 3)).slice(0, 4).map((order) => <tr key={order.id} className="hover:bg-[#fbfaf8]"><td className="px-3 py-3 font-data text-xs font-semibold">{order.orderNo}</td><td className="px-3 py-3 text-xs text-stone-500">{shortDate(order.placedAt)}</td><td className="font-data px-3 py-3 text-sm">{formatTwd(order.amountTwd)}</td><td className="px-3 py-3"><StatusBadge tone={statusTone(order.status)}>{orderStatusLabels[order.status]}</StatusBadge></td></tr>)}</></DataTable>
      </section>
    </div>
  </div>;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return <article className="group overflow-hidden rounded-xl border border-[#ded9d2] bg-[#fffdfa] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(28,25,23,.1)]">
    <div className="relative aspect-[4/3] overflow-hidden" style={{ background: `linear-gradient(145deg, ${product.accent}26, #ebe7df)` }}><Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" /><span className="absolute left-3 top-3 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold text-stone-600 backdrop-blur">{product.category}</span>{product.pointsAllowed && <span className="absolute bottom-3 right-3 rounded-full bg-[#241f1b] px-2 py-1 text-[10px] font-semibold text-[#e0c47d]">點數可用</span>}</div>
    <div className="p-4"><h3 className="font-semibold tracking-[-.01em]">{product.name}</h3><p className="mt-1 text-xs text-stone-500">{product.subtitle}</p><div className="mt-4 flex items-end justify-between gap-3"><div><p className="font-data text-lg font-semibold">{formatTwd(product.priceTwd)}</p><p className="text-[10px] text-stone-400">庫存 {product.stock}</p></div><button onClick={onAdd} className="grid size-11 place-items-center rounded-lg bg-[#1c1917] text-white transition hover:bg-[#8a6107]" aria-label={`加入購物車：${product.name}`}><Plus className="size-5" /></button></div></div>
  </article>;
}

function MemberShop() {
  const [cart, setCart] = useState(0);
  const [category, setCategory] = useState("全部");
  const products = demoProducts.filter((product) => product.status === "PUBLISHED" && (category === "全部" || product.category === category));
  return <div className="animate-enter"><PageIntro title="會員商城" description="平台承接會員交易；合作廠商依平台訂單履約出貨。" actions={<button className={buttonStyles.gold}><ShoppingBag className="size-4" />購物車 <span className="rounded-full bg-white/18 px-1.5 text-xs">{cart}</span></button>} />
    <div className="surface mb-4 flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center"><div className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-[#ded9d2] bg-white px-3"><Search className="size-4 text-stone-400" /><input aria-label="搜尋商品" placeholder="搜尋商品或類別" className="w-full bg-transparent text-sm outline-none" /></div><div className="scrollbar-thin flex gap-1 overflow-x-auto">{["全部", "保養", "營養", "生活", "食品"].map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-10 whitespace-nowrap rounded-lg px-3 text-sm font-medium ${category === item ? "bg-[#1c1917] text-white" : "hover:bg-stone-100"}`}>{item}</button>)}</div></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={() => setCart((value) => value + 1)} />)}</div>
  </div>;
}

function MemberOrders({ member, orders }: { member: Member; orders: DemoOrder[] }) {
  const shown = orders.length >= 4 ? orders : demoOrders.slice(0, 12).map((order, index) => ({ ...order, memberId: member.id, orderNo: `${order.orderNo.slice(0, -2)}${String(index + 1).padStart(2, "0")}` }));
  return <div className="animate-enter"><PageIntro title="我的訂單" description="查看付款、廠商出貨、退換貨期與正式結算狀態。" actions={<Link className={buttonStyles.gold} href="/member/shop"><Store className="size-4" />繼續購物</Link>} /><section className="surface overflow-hidden rounded-xl"><DataTable headers={["訂單編號", "下單日期", "商品", "付款金額", "物流", "狀態", "操作"]} minWidth={920}>{shown.map((order) => { const product = demoProducts.find((item) => item.id === order.productId) ?? demoProducts[0]; return <tr key={order.id} className="hover:bg-[#fbfaf8]"><td className="px-3 py-3 font-data text-xs font-semibold">{order.orderNo}</td><td className="px-3 py-3 text-xs text-stone-500">{shortDate(order.placedAt)}</td><td className="px-3 py-3"><p className="text-sm font-medium">{product.name}</p><p className="text-[10px] text-stone-400">{product.sku}</p></td><td className="font-data px-3 py-3 text-sm">{formatTwd(order.amountTwd)}</td><td className="px-3 py-3 text-xs text-stone-500">{order.trackingNo ?? "—"}</td><td className="px-3 py-3"><StatusBadge tone={statusTone(order.status)}>{orderStatusLabels[order.status]}</StatusBadge></td><td className="px-3 py-3"><button className="min-h-10 rounded-lg px-3 text-xs font-semibold text-[#8a6107] hover:bg-[#f8efd9]">查看明細</button></td></tr>;})}</DataTable></section></div>;
}

function MemberOrganization({ member }: { member: Member }) {
  const directs = getMemberChildren(member.id);
  const preview = directs.flatMap((direct) => [direct, ...getMemberChildren(direct.id).slice(0, 2)]).slice(0, 12);
  return <div className="animate-enter"><PageIntro title="推薦組織" description="組織固定位置、不跳代、不遞補；獎金由下單會員向上追溯最多 10 代。" actions={<button className={buttonStyles.secondary}><Link2 className="size-4" />複製推薦連結</button>} />
    <div className="grid gap-4 xl:grid-cols-[340px_1fr]"><div className="space-y-4"><section className="surface rounded-xl p-5"><p className="text-xs font-bold tracking-[.13em] text-[#8a6107]">我的資格</p><div className="mt-4 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-full bg-[#1c1917] text-sm font-bold text-[#e0c47d]">{member.name.slice(-2)}</div><div><h2 className="font-semibold">{member.name}</h2><p className="text-xs text-stone-500">{formatNumber(member.planAmount)} 元方案</p></div></div><div className="mt-5"><ProgressBar value={member.unlockedGenerations} max={10} label={`已開放 ${member.unlockedGenerations} / 10 代`} /></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg bg-stone-50 p-3"><p className="font-data text-xl font-semibold">{member.directCount}</p><p className="text-[11px] text-stone-500">有效直推</p></div><div className="rounded-lg bg-stone-50 p-3"><p className="font-data text-xl font-semibold">{preview.length + 12}</p><p className="text-[11px] text-stone-500">可見組織</p></div></div></section><section className="rounded-xl border border-[#ead59e] bg-[#fbf4e4] p-4"><p className="flex items-center gap-2 text-sm font-semibold text-[#6f4d0b]"><Info className="size-4" />代數升級規則</p><p className="mt-2 text-xs leading-5 text-[#795f2c]">目前方案初始開放 {member.planAmount === 4000 ? 5 : member.planAmount === 12000 ? 10 : 3} 代，每增加一位有效直推增加一代，最高 10 代。</p></section></div>
    <section className="surface min-h-[580px] overflow-hidden rounded-xl"><div className="flex items-center justify-between border-b border-[#ded9d2] p-4"><div><h2 className="font-semibold">向下組織圖</h2><p className="text-xs text-stone-500">點選節點可查看會員快照</p></div><div className="flex gap-1"><button className="grid size-10 place-items-center rounded-lg border border-stone-200 bg-white"><Plus className="size-4" /></button><button className="grid size-10 place-items-center rounded-lg border border-stone-200 bg-white"><span className="text-xl leading-none">−</span></button></div></div><div className="overflow-auto p-6"><div className="mx-auto w-fit min-w-[720px]"><div className="mx-auto w-52 rounded-xl border-2 border-[#a16207] bg-[#fbf4e4] p-3 text-center shadow-md"><p className="font-semibold">{member.name}</p><p className="text-[10px] text-stone-500">第 0 代 · {member.memberNo}</p></div><div className="mx-auto h-8 w-px bg-[#c9b98f]" /><div className="mx-auto h-px w-[78%] bg-[#c9b98f]" /><div className="grid grid-cols-4 gap-4">{(directs.length ? directs : demoMembers.slice(1, 5)).slice(0, 4).map((direct) => <div key={direct.id} className="relative pt-8"><div className="absolute left-1/2 top-0 h-8 w-px bg-[#c9b98f]" /><div className="rounded-xl border border-[#ded9d2] bg-white p-3 text-center shadow-sm"><div className="mx-auto grid size-9 place-items-center rounded-full bg-stone-100 text-xs font-bold">{direct.name.slice(-2)}</div><p className="mt-2 text-sm font-semibold">{direct.name}</p><p className="text-[10px] text-stone-400">第 1 代 · {direct.directCount} 直推</p><StatusBadge tone={direct.status === "NORMAL" ? "normal" : "warning"}>{memberStatusLabels[direct.status]}</StatusBadge></div><div className="mx-auto h-6 w-px bg-[#d8d1c7]" /><div className="space-y-2">{getMemberChildren(direct.id).slice(0, 2).map((child) => <div key={child.id} className="rounded-lg border border-[#e7e2dc] bg-[#faf9f7] p-2 text-center"><p className="text-xs font-semibold">{child.name}</p><p className="text-[9px] text-stone-400">第 2 代</p></div>)}</div></div>)}</div></div></div></section></div>
  </div>;
}

function MemberWallet({ member, wallet }: { member: Member; wallet: (typeof demoWallets)[number] }) {
  const ledger = [
    ["08/26", "十代組織獎金", "LKO-202608-0026 · 第 3 代", 90, "已結算"],
    ["08/25", "直接推薦獎金", "LKO-202608-0022", 180, "已結算"],
    ["08/24", "4,000 元循環", "第 7 次循環 · 現金", 2000, "已入帳"],
    ["08/24", "重銷購物點數", "第 7 次循環 · 點數", 2000, "已入帳"],
    ["08/23", "十代組織獎金", "LKO-202608-0019 · 第 1 代", 180, "待結算"],
  ] as const;
  return <div className="animate-enter"><PageIntro title="獎金錢包" description="每筆金額皆可追溯來源訂單、制度版本、代數、扣繳與循環結果。" actions={<Link href="/member/withdraw" className={buttonStyles.gold}><Landmark className="size-4" />申請提領</Link>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><KpiCard label="待結算獎金" value={formatTwd(wallet.pendingBonusTwd)} helper="尚未完成月結" icon={Clock3} tone="stone" /><KpiCard label="獎金累積" value={formatTwd(wallet.accumulationTwd)} helper="4,000 元循環餘額" icon={TrendingUp} /><KpiCard label="現金獎金" value={formatTwd(wallet.cashTwd)} helper="可申請提領" icon={WalletCards} tone="green" /><KpiCard label="購物點數" value={`${formatNumber(wallet.shoppingPoints)} 點`} helper="商城與重銷可用" icon={Gift} tone="blue" /><KpiCard label="暫存獎金" value={formatTwd(wallet.heldBonusTwd)} helper="凍結／調查期間保留" icon={LockKeyhole} tone="stone" /></div>
    <section className="surface mt-4 overflow-hidden rounded-xl"><div className="p-4 pb-2 sm:p-5 sm:pb-2"><SectionHeader eyebrow="TRACEABLE LEDGER" title="分類流水" description={`會員 ${member.memberNo} · PLAN-2026-08`} action={<button className={buttonStyles.secondary}><ReceiptText className="size-4" />匯出明細</button>} /></div><DataTable headers={["日期", "類型", "來源與追溯", "金額／點數", "狀態", "明細"]} minWidth={820}>{ledger.map(([date, type, source, amount, state], index) => <tr key={`${type}-${index}`} className="hover:bg-[#fbfaf8]"><td className="px-3 py-3 text-xs text-stone-500">{date}</td><td className="px-3 py-3 text-sm font-medium">{type}</td><td className="px-3 py-3"><p className="font-data text-xs">{source}</p><p className="text-[10px] text-stone-400">PLAN-2026-08 · 2026-08 月結</p></td><td className="font-data px-3 py-3 text-sm font-semibold text-emerald-700">+{formatNumber(amount)}{type.includes("點數") ? " 點" : " 元"}</td><td className="px-3 py-3"><StatusBadge tone={state === "待結算" ? "warning" : "normal"}>{state}</StatusBadge></td><td className="px-3 py-3"><button className="min-h-10 rounded-lg px-3 text-xs font-semibold text-[#8a6107] hover:bg-[#f8efd9]">逐筆追溯</button></td></tr>)}</DataTable></section>
  </div>;
}

function MemberResale({ member, accumulation }: { member: Member; accumulation: number }) {
  const [mode, setMode] = useState<"PRESELECT" | "HOLD" | "ACCUMULATE">("HOLD");
  const examples = [[3900, "未達門檻", 3900], [4000, "執行 1 次", 0], [5300, "執行 1 次", 1300], [8000, "執行 2 次", 0], [9500, "執行 2 次", 1500]] as const;
  return <div className="animate-enter"><PageIntro title="4,000 元循環與重銷" description="循環成立即產生 2,000 元重銷業績；日後使用同批點數不會重複發獎。" />
    <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]"><section className="overflow-hidden rounded-xl bg-[#1b1815] text-white shadow-lg"><div className="border-b border-white/8 p-5"><p className="text-[11px] font-bold tracking-[.16em] text-[#d8b961]">CURRENT PROGRESS</p><div className="mt-3 flex items-end justify-between"><div><p className="text-sm text-white/50">獎金累積</p><p className="font-data mt-1 text-4xl font-semibold text-[#e2c77f]">{formatTwd(accumulation)}</p></div><div className="text-right"><p className="text-xs text-white/40">距下次循環</p><p className="font-data mt-1 text-lg font-semibold">{formatTwd(Math.max(0, 4000 - accumulation))}</p></div></div><div className="mt-5"><ProgressBar value={accumulation} max={4000} label={`${formatNumber(accumulation)} / 4,000`} /></div></div><div className="grid grid-cols-2 gap-px bg-white/8"><div className="bg-[#1b1815] p-5"><CreditCard className="size-5 text-[#d8b961]" /><p className="mt-3 text-xs text-white/45">現金獎金</p><p className="font-data mt-1 text-2xl font-semibold">$2,000</p></div><div className="bg-[#1b1815] p-5"><Gift className="size-5 text-[#d8b961]" /><p className="mt-3 text-xs text-white/45">重銷點數</p><p className="font-data mt-1 text-2xl font-semibold">2,000</p></div></div><div className="p-5 text-xs leading-5 text-white/45"><Info className="mr-1 inline size-3.5" />重銷事件使用唯一鍵 resale:{member.id}:2026-08:n，確保重試不重複發獎。</div></section>
    <section className="surface rounded-xl p-5"><SectionHeader eyebrow="FULFILLMENT" title="商品處理方式" description="選擇下次循環成立後的處理偏好" /><div className="space-y-2">{([{ key: "PRESELECT", title: "預先選擇", description: "事先指定 2,000 元商品，循環成立後安排寄送。", icon: PackageCheck }, { key: "HOLD", title: "暫時保留", description: "先保留點數；逾期由系統依公司設定選品。", icon: Clock3 }, { key: "ACCUMULATE", title: "累積後使用", description: "累積至目標商品金額，可搭配現金補差額。", icon: Gift }] as const).map((item) => { const Icon = item.icon; const active = mode === item.key; return <button key={item.key} onClick={() => setMode(item.key)} className={`flex min-h-[76px] w-full items-center gap-3 rounded-xl border p-3 text-left transition ${active ? "border-[#a16207] bg-[#fbf4e4]" : "border-[#ded9d2] hover:bg-stone-50"}`}><span className={`grid size-10 shrink-0 place-items-center rounded-lg ${active ? "bg-[#8a6107] text-white" : "bg-stone-100 text-stone-600"}`}><Icon className="size-5" /></span><span><span className="block text-sm font-semibold">{item.title}</span><span className="mt-0.5 block text-xs text-stone-500">{item.description}</span></span>{active && <CheckCircle2 className="ml-auto size-5 text-[#8a6107]" />}</button>;})}</div><button className={`${buttonStyles.gold} mt-4 w-full`}>儲存重銷偏好</button></section></div>
    <section className="surface mt-4 overflow-hidden rounded-xl"><div className="p-5 pb-2"><SectionHeader eyebrow="VERIFICATION CASES" title="循環驗算範例" /></div><DataTable headers={["累積獎金", "處理", "現金", "點數", "剩餘累積"]} minWidth={620}>{examples.map(([amount, action, remainder]) => <tr key={amount}><td className="font-data px-3 py-3 font-semibold">{formatTwd(amount)}</td><td className="px-3 py-3 text-sm">{action}</td><td className="font-data px-3 py-3 text-sm">{action.includes("1") ? "$2,000" : action.includes("2") ? "$4,000" : "—"}</td><td className="font-data px-3 py-3 text-sm">{action.includes("1") ? "2,000" : action.includes("2") ? "4,000" : "—"}</td><td className="font-data px-3 py-3 text-sm">{formatTwd(remainder)}</td></tr>)}</DataTable></section>
  </div>;
}

function MemberWithdraw({ member, available }: { member: Member; available: number }) {
  const [amount, setAmount] = useState(Math.min(available, 6000));
  const calculation = useMemo(() => amount > 0 ? calculateWithdrawal(amount, member) : { grossTwd: 0, incomeTaxTwd: 0, nhiTwd: 0, netTwd: 0 }, [amount, member]);
  const [submitted, setSubmitted] = useState(false);
  return <div className="animate-enter"><PageIntro title="提領申請" description="示範版由財務人工審核與模擬匯款；扣繳結果依會員測試旗標試算。" />
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]"><section className="surface rounded-xl p-5"><SectionHeader eyebrow="WITHDRAWAL" title="申請資料" /><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-sm font-semibold">提領金額</span><div className="relative"><span className="absolute left-3 top-3 text-sm text-stone-400">NT$</span><input type="number" min={1} max={available} value={amount} onChange={(event) => setAmount(Math.max(0, Number(event.target.value)))} className="h-12 w-full rounded-lg border border-[#cfc8bf] bg-white pl-12 pr-3 font-data focus:border-[#a16207] focus:outline-none" /></div><p className="mt-1.5 text-xs text-stone-500">可提領餘額：{formatTwd(available)}</p></label><label><span className="mb-1.5 block text-sm font-semibold">收款帳戶</span><select className="h-12 w-full rounded-lg border border-[#cfc8bf] bg-white px-3 focus:border-[#a16207] focus:outline-none"><option>國泰世華（末五碼 7148）</option><option>新增測試帳戶</option></select><p className="mt-1.5 text-xs text-stone-500">此為合成測試帳號，不會實際匯款。</p></label></div>
      <div className="mt-5 rounded-xl border border-[#ded9d2] bg-[#faf9f7] p-4"><p className="text-sm font-semibold">會員扣繳旗標</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="flex items-center justify-between rounded-lg bg-white p-3 text-sm"><span>所得稅預扣 10%</span><StatusBadge tone={member.incomeTaxApplicable ? "warning" : "neutral"}>{member.incomeTaxApplicable ? "適用" : "不適用"}</StatusBadge></div><div className="flex items-center justify-between rounded-lg bg-white p-3 text-sm"><span>補充保費 2.11%</span><StatusBadge tone={member.nhiApplicable ? "warning" : "neutral"}>{member.nhiApplicable ? "適用" : "不適用"}</StatusBadge></div></div><p className="mt-3 text-xs leading-5 text-stone-500">旗標僅供制度驗證，不代表系統已完成法定門檻判定。</p></div>
      {submitted ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"><CheckCircle2 className="mx-auto size-9 text-emerald-600" /><p className="mt-2 font-semibold text-emerald-900">提領申請已建立</p><p className="mt-1 text-xs text-emerald-700">財務中心將顯示此筆模擬待審核資料。</p></div> : <button onClick={() => setSubmitted(true)} disabled={amount <= 0 || amount > available} className={`${buttonStyles.gold} mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50`}><Landmark className="size-4" />送出提領申請</button>}
    </section><aside className="rounded-xl bg-[#1c1917] p-5 text-white"><p className="text-[11px] font-bold tracking-[.15em] text-[#d8b961]">NET PAYMENT PREVIEW</p><h2 className="mt-1 text-xl font-semibold">實付試算</h2><div className="mt-6 space-y-3 text-sm"><div className="flex justify-between text-white/65"><span>應得總額</span><span className="font-data text-white">{formatTwd(calculation.grossTwd)}</span></div><div className="flex justify-between text-white/65"><span>所得稅預扣</span><span className="font-data text-red-300">− {formatTwd(calculation.incomeTaxTwd)}</span></div><div className="flex justify-between text-white/65"><span>補充保費</span><span className="font-data text-red-300">− {formatTwd(calculation.nhiTwd)}</span></div></div><div className="my-5 h-px bg-white/12" /><div className="flex items-end justify-between"><span className="text-sm text-white/55">預計實付</span><span className="font-data text-3xl font-semibold text-[#e2c77f]">{formatTwd(calculation.netTwd)}</span></div><div className="mt-6 rounded-lg bg-white/6 p-3 text-xs leading-5 text-white/45"><Info className="mr-1 inline size-3.5" />送出後由財務審核，再以人工匯款模擬流程標記完成。</div></aside></div>
    <section className="surface mt-4 overflow-hidden rounded-xl"><div className="p-5 pb-2"><SectionHeader eyebrow="HISTORY" title="提領紀錄" /></div><DataTable headers={["申請編號", "日期", "總額", "扣繳", "實付", "狀態"]} minWidth={680}>{[["WD-202608-0018", "08/18", 6000, 727, 5273, "已付款"], ["WD-202607-0009", "07/22", 4000, 484, 3516, "已付款"]].map((row) => <tr key={String(row[0])}>{row.map((cell, index) => <td key={`${cell}-${index}`} className={`px-3 py-3 text-sm ${index === 0 || (index >= 2 && index <= 4) ? "font-data" : ""}`}>{index === 5 ? <StatusBadge tone="normal">{cell}</StatusBadge> : typeof cell === "number" ? formatTwd(cell) : cell}</td>)}</tr>)}</DataTable></section>
  </div>;
}
