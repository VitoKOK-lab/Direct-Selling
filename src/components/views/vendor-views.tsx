"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Boxes, ClipboardCheck, Download, FileClock, PackageCheck, Pencil, Plus, Search, Send, ShoppingBag, Truck } from "lucide-react";
import { DataTable, KpiCard, PageIntro, ProgressBar, SectionHeader, SegmentedBars, StatusBadge, buttonStyles } from "@/components/ui";
import { demoMembers, demoOrders, demoProducts } from "@/lib/demo-data";
import { formatNumber, formatTwd, orderStatusLabels, productStatusLabels, shortDate } from "@/lib/format";
import type { DemoAccount, ProductStatus } from "@/types/domain";

const productTone = (status: ProductStatus) => status === "PUBLISHED" || status === "APPROVED" ? "normal" : status === "RETURNED" ? "danger" : status === "PENDING" ? "warning" : "neutral";

export function VendorViews({ section, account }: { section: string; account: DemoAccount }) {
  const vendorId = account.vendorId ?? "v01";
  if (section === "products") return <VendorProducts vendorId={vendorId} />;
  if (section === "fulfillment") return <VendorFulfillment vendorId={vendorId} />;
  if (section === "inventory") return <VendorInventory vendorId={vendorId} />;
  if (section === "returns") return <VendorReturns vendorId={vendorId} />;
  if (section === "settlements") return <VendorSettlements vendorId={vendorId} />;
  return <VendorOverview vendorId={vendorId} />;
}

function vendorProducts(vendorId: string) {
  const own = demoProducts.filter((product) => product.vendorId === vendorId);
  return own.length >= 4 ? own : demoProducts.slice(0, 8).map((product) => ({ ...product, vendorId }));
}

function vendorOrders(vendorId: string) {
  const own = demoOrders.filter((order) => order.vendorId === vendorId);
  return own.length >= 5 ? own : demoOrders.slice(0, 12).map((order) => ({ ...order, vendorId }));
}

function VendorOverview({ vendorId }: { vendorId: string }) {
  const products = vendorProducts(vendorId);
  const orders = vendorOrders(vendorId);
  const actionItems = [
    { label: "待確認新訂單", value: "4 筆", icon: ShoppingBag, tone: "gold" as const },
    { label: "待填物流單號", value: "7 筆", icon: Truck, tone: "warning" as const },
    { label: "低庫存商品", value: "2 項", icon: AlertTriangle, tone: "danger" as const },
    { label: "待回覆退換貨", value: "1 筆", icon: ClipboardCheck, tone: "info" as const },
  ];
  return <div className="animate-enter"><PageIntro title="廠商營運總覽" description={`廠商編號 ${vendorId.toUpperCase()} · 平台訂單履約與商品資料中心`} actions={<Link href="/vendor/products" className={buttonStyles.gold}><Plus className="size-4" />新增商品</Link>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="本月平台訂單" value="128" helper="較上月增加 14 筆" trend={{ value: "+12.3%", direction: "up" }} icon={ShoppingBag} /><KpiCard label="待出貨" value="7" helper="其中 2 筆即將逾時" icon={Truck} tone="gold" /><KpiCard label="在售商品" value={String(products.filter((p) => p.status === "PUBLISHED").length)} helper="2 項等待平台審核" icon={Boxes} tone="blue" /><KpiCard label="預估結算" value={formatTwd(186400)} helper="2026 年 8 月" trend={{ value: "+8.7%", direction: "up" }} icon={FileClock} tone="green" /></div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]"><section className="surface rounded-xl p-5"><SectionHeader eyebrow="FULFILLMENT" title="出貨效率" description="近 14 日平台訂單" /><SegmentedBars values={[8, 12, 10, 16, 11, 18, 14, 20, 17, 12, 22, 19, 24, 21]} labels={["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26"]} active={13} /><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg bg-stone-50 p-3"><p className="font-data text-xl font-semibold">93.8%</p><p className="text-[10px] text-stone-500">24h 出貨率</p></div><div className="rounded-lg bg-stone-50 p-3"><p className="font-data text-xl font-semibold">1.4 天</p><p className="text-[10px] text-stone-500">平均出貨</p></div><div className="rounded-lg bg-stone-50 p-3"><p className="font-data text-xl font-semibold">0.8%</p><p className="text-[10px] text-stone-500">退貨率</p></div></div></section><section className="surface rounded-xl p-5"><SectionHeader eyebrow="ACTION REQUIRED" title="今日待辦" /><div className="space-y-2">{actionItems.map((item) => { const Icon = item.icon; return <Link href="/vendor/fulfillment" key={item.label} className="flex min-h-14 items-center gap-3 rounded-lg border border-stone-200 p-3 hover:bg-stone-50"><span className="grid size-9 place-items-center rounded-lg bg-stone-100"><Icon className="size-4" /></span><span className="flex-1 text-sm font-medium">{item.label}</span><StatusBadge tone={item.tone}>{item.value}</StatusBadge></Link>; })}</div></section></div>
    <section className="surface mt-4 overflow-hidden rounded-xl"><div className="p-5 pb-2"><SectionHeader eyebrow="RECENT ORDERS" title="近期平台訂單" action={<Link href="/vendor/fulfillment" className={buttonStyles.ghost}>查看全部</Link>} /></div><OrderRows orders={orders.slice(0, 6)} /></section>
  </div>;
}

function VendorProducts({ vendorId }: { vendorId: string }) {
  const [filter, setFilter] = useState("ALL");
  const products = vendorProducts(vendorId);
  const shown = filter === "ALL" ? products : products.filter((product) => product.status === filter);
  return <div className="animate-enter"><PageIntro title="商品管理" description="商品須經平台審核通過後才能上架；修改關鍵內容會重新送審。" actions={<button className={buttonStyles.gold}><Plus className="size-4" />新增商品</button>} />
    <div className="surface mb-4 flex flex-col gap-3 rounded-xl p-3 sm:flex-row"><div className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3"><Search className="size-4 text-stone-400" /><input className="w-full bg-transparent text-sm outline-none" placeholder="搜尋商品、SKU" aria-label="搜尋商品" /></div><select value={filter} onChange={(event) => setFilter(event.target.value)} className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-sm"><option value="ALL">全部狀態</option><option value="PUBLISHED">已上架</option><option value="PENDING">待審核</option><option value="RETURNED">退回修改</option></select></div>
    <section className="surface overflow-hidden rounded-xl"><DataTable headers={["商品", "SKU", "售價／成本", "庫存", "點數", "狀態", "操作"]} minWidth={940}>{shown.map((product) => <tr key={product.id} className="hover:bg-[#fbfaf8]"><td className="px-3 py-3"><div className="flex items-center gap-3"><Image src={product.image} alt="" width={44} height={44} className="size-11 rounded-lg border border-stone-200 object-cover" /><div><p className="text-sm font-semibold">{product.name}</p><p className="text-[10px] text-stone-400">{product.category} · {product.subtitle}</p></div></div></td><td className="font-data px-3 py-3 text-xs">{product.sku}</td><td className="px-3 py-3"><p className="font-data text-sm">{formatTwd(product.priceTwd)}</p><p className="font-data text-[10px] text-stone-400">成本 {formatTwd(product.costTwd)}</p></td><td className="px-3 py-3"><p className={`font-data text-sm font-semibold ${product.stock < 25 ? "text-red-700" : ""}`}>{product.stock}</p></td><td className="px-3 py-3"><StatusBadge tone={product.pointsAllowed ? "info" : "neutral"}>{product.pointsAllowed ? "可使用" : "不可使用"}</StatusBadge></td><td className="px-3 py-3"><StatusBadge tone={productTone(product.status)}>{productStatusLabels[product.status]}</StatusBadge></td><td className="px-3 py-3"><div className="flex gap-1"><button className="grid size-10 place-items-center rounded-lg hover:bg-stone-100" aria-label={`編輯 ${product.name}`}><Pencil className="size-4" /></button>{product.status === "DRAFT" || product.status === "RETURNED" ? <button className="grid size-10 place-items-center rounded-lg text-[#8a6107] hover:bg-[#f8efd9]" aria-label={`送審 ${product.name}`}><Send className="size-4" /></button> : null}</div></td></tr>)}</DataTable></section>
  </div>;
}

function OrderRows({ orders }: { orders: ReturnType<typeof vendorOrders> }) {
  return <DataTable headers={["平台訂單", "會員", "商品", "日期", "金額", "狀態", "物流"]} minWidth={880}>{orders.map((order) => { const member = demoMembers.find((item) => item.id === order.memberId) ?? demoMembers[0]; const product = demoProducts.find((item) => item.id === order.productId) ?? demoProducts[0]; return <tr key={order.id} className="hover:bg-[#fbfaf8]"><td className="font-data px-3 py-3 text-xs font-semibold">{order.orderNo}</td><td className="px-3 py-3 text-sm">{member.name}</td><td className="px-3 py-3 text-sm">{product.name}</td><td className="px-3 py-3 text-xs text-stone-500">{shortDate(order.placedAt)}</td><td className="font-data px-3 py-3 text-sm">{formatTwd(order.amountTwd)}</td><td className="px-3 py-3"><StatusBadge tone={order.status === "SETTLED" ? "normal" : order.status === "SHIPPED" ? "info" : "warning"}>{orderStatusLabels[order.status]}</StatusBadge></td><td className="font-data px-3 py-3 text-xs text-stone-500">{order.trackingNo ?? "待填寫"}</td></tr>;})}</DataTable>;
}

function VendorFulfillment({ vendorId }: { vendorId: string }) {
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const orders = vendorOrders(vendorId);
  return <div className="animate-enter"><PageIntro title="訂單出貨" description="平台收到會員模擬付款後通知廠商；請回覆庫存、物流與出貨日期。" /><section className="surface overflow-hidden rounded-xl"><DataTable headers={["訂單", "商品／會員", "下單時間", "金額", "狀態", "物流單號", "操作"]} minWidth={980}>{orders.map((order) => { const member = demoMembers.find((item) => item.id === order.memberId) ?? demoMembers[0]; const product = demoProducts.find((item) => item.id === order.productId) ?? demoProducts[0]; const done = confirmed.includes(order.id) || Boolean(order.trackingNo); return <tr key={order.id} className="hover:bg-[#fbfaf8]"><td className="font-data px-3 py-3 text-xs font-semibold">{order.orderNo}</td><td className="px-3 py-3"><p className="text-sm font-semibold">{product.name}</p><p className="text-[10px] text-stone-400">{member.name} · {member.memberNo}</p></td><td className="px-3 py-3 text-xs text-stone-500">{shortDate(order.placedAt)}</td><td className="font-data px-3 py-3 text-sm">{formatTwd(order.amountTwd)}</td><td className="px-3 py-3"><StatusBadge tone={done ? "info" : "warning"}>{done ? "已填物流" : orderStatusLabels[order.status]}</StatusBadge></td><td className="px-3 py-3"><input defaultValue={order.trackingNo} placeholder="輸入單號" className="h-10 w-36 rounded-lg border border-stone-200 px-2 font-data text-xs" /></td><td className="px-3 py-3"><button onClick={() => setConfirmed((value) => [...value, order.id])} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${done ? "bg-emerald-50 text-emerald-700" : "bg-[#1c1917] text-white"}`}>{done ? "已更新" : "確認出貨"}</button></td></tr>;})}</DataTable></section></div>;
}

function VendorInventory({ vendorId }: { vendorId: string }) {
  const products = vendorProducts(vendorId);
  return <div className="animate-enter"><PageIntro title="庫存管理" description="低庫存商品會醒目提示；示範版由廠商手動更新平台可售數量。" actions={<button className={buttonStyles.secondary}><Download className="size-4" />匯出庫存</button>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="總庫存" value={formatNumber(products.reduce((sum, item) => sum + item.stock, 0))} helper="全部測試 SKU" icon={Boxes} /><KpiCard label="低庫存" value={String(products.filter((item) => item.stock < 30).length)} helper="庫存低於 30" icon={AlertTriangle} tone="gold" /><KpiCard label="缺貨" value="0" helper="目前無缺貨商品" icon={PackageCheck} tone="green" /><KpiCard label="本週出庫" value="86" helper="含 12 筆重銷選品" icon={Truck} tone="blue" /></div><section className="surface mt-4 overflow-hidden rounded-xl"><DataTable headers={["商品", "SKU", "目前庫存", "安全庫存", "庫存狀態", "補貨進度"]} minWidth={720}>{products.map((product) => <tr key={product.id}><td className="px-3 py-3 text-sm font-semibold">{product.name}</td><td className="font-data px-3 py-3 text-xs">{product.sku}</td><td className="font-data px-3 py-3 font-semibold">{product.stock}</td><td className="font-data px-3 py-3 text-sm">30</td><td className="px-3 py-3"><StatusBadge tone={product.stock < 30 ? "danger" : "normal"}>{product.stock < 30 ? "低庫存" : "充足"}</StatusBadge></td><td className="px-3 py-3"><div className="w-44"><ProgressBar value={product.stock} max={100} /></div></td></tr>)}</DataTable></section></div>;
}

function VendorReturns({ vendorId }: { vendorId: string }) {
  return <div className="animate-enter"><PageIntro title="退換貨處理" description={`${vendorId.toUpperCase()} · 示範版只允許訂單結算前退款；已結算訂單會鎖定並提示正式版沖銷流程。`} /><section className="surface overflow-hidden rounded-xl"><DataTable headers={["案件編號", "平台訂單", "申請原因", "申請日", "訂單狀態", "案件狀態", "操作"]} minWidth={860}>{[["RT-202608-003", "LKO-202608-0017", "商品外盒受損", "08/25", "已送達", "待回覆"], ["RT-202608-002", "LKO-202608-0011", "尺寸規格不符", "08/22", "處理中", "換貨中"], ["RT-202608-001", "LKO-202608-0004", "會員取消", "08/18", "已結算", "已鎖定"]].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell} className={`px-3 py-3 text-sm ${index < 2 ? "font-data" : ""}`}>{index === 5 ? <StatusBadge tone={cell === "已鎖定" ? "danger" : cell === "待回覆" ? "warning" : "info"}>{cell}</StatusBadge> : index === 6 ? <button className="min-h-10 rounded-lg px-3 text-xs font-semibold text-[#8a6107] hover:bg-[#f8efd9]">查看案件</button> : cell}</td>)}</tr>)}</DataTable></section></div>;
}

function VendorSettlements({ vendorId }: { vendorId: string }) {
  return <div className="animate-enter"><PageIntro title="廠商結算資料" description={`${vendorId.toUpperCase()} · 示範版保留人工／半人工結算；自動對帳與撥款屬企業升級範圍。`} actions={<button className={buttonStyles.secondary}><Download className="size-4" />匯出 CSV</button>} /><div className="grid gap-3 sm:grid-cols-3"><KpiCard label="本期銷售" value={formatTwd(242000)} helper="2026-08 已完成訂單" icon={ShoppingBag} /><KpiCard label="退換貨調整" value={formatTwd(-4000)} helper="結算前退款 1 筆" icon={ClipboardCheck} tone="gold" /><KpiCard label="預估應付" value={formatTwd(71400)} helper="商品成本與人工調整後" icon={FileClock} tone="green" /></div><section className="surface mt-4 overflow-hidden rounded-xl"><DataTable headers={["結算月份", "完成訂單", "銷售金額", "商品成本", "調整", "應付金額", "狀態"]} minWidth={800}>{[["2026-08", 121, 242000, 72600, -1200, 71400, "待平台確認"], ["2026-07", 106, 212000, 63600, 0, 63600, "已確認"], ["2026-06", 98, 196000, 58800, -600, 58200, "已確認"]].map((row) => <tr key={String(row[0])}>{row.map((cell, index) => <td key={`${cell}-${index}`} className={`px-3 py-3 text-sm ${index >= 1 && index <= 5 ? "font-data" : ""}`}>{index >= 2 && index <= 5 ? formatTwd(cell as number) : index === 6 ? <StatusBadge tone={cell === "已確認" ? "normal" : "warning"}>{cell}</StatusBadge> : cell}</td>)}</tr>)}</DataTable></section></div>;
}
