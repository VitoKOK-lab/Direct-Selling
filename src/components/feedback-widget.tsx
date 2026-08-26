"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, MessageSquarePlus, Send, X } from "lucide-react";
import { buttonStyles } from "@/components/ui";

export function FeedbackWidget({ route, author }: { route: string; author: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [content, setContent] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setContent(""); }, 1400);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-5 right-4 z-40 flex min-h-11 items-center gap-2 rounded-full bg-[#1c1917] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(28,25,23,.24)] transition hover:-translate-y-0.5 hover:bg-[#342e2a] sm:right-6" aria-label="新增頁面標註">
        <MessageSquarePlus className="size-4" /> <span className="hidden sm:inline">頁面標註</span>
      </button>
      {open && <div className="fixed inset-0 z-50 bg-black/35 p-3 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="新增頁面標註"><div className="ml-auto flex h-full w-full max-w-md flex-col bg-[#fffdfa] shadow-2xl animate-enter sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-[#ded9d2] p-5"><div><p className="text-[11px] font-bold tracking-[.14em] text-[#8a6107]">集中回饋</p><h2 className="mt-1 text-xl font-semibold">新增頁面標註</h2></div><button onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-lg text-stone-500 hover:bg-stone-100" aria-label="關閉"><X className="size-5" /></button></div>
        {sent ? <div className="grid flex-1 place-items-center p-8 text-center"><div><CheckCircle2 className="mx-auto size-12 text-emerald-600" /><h3 className="mt-4 text-lg font-semibold">標註已送出</h3><p className="mt-1 text-sm text-stone-500">已加入集中回饋清單。</p></div></div> : <form onSubmit={submit} className="flex flex-1 flex-col p-5">
          <div className="rounded-lg border border-[#e5ded3] bg-[#faf8f3] p-3 text-xs text-stone-600"><p className="flex items-center gap-1.5 font-semibold text-stone-800"><MapPin className="size-3.5 text-[#8a6107]" />目前頁面</p><p className="font-data mt-1 break-all">{route}</p><p className="mt-2">提出者：{author}</p></div>
          <label className="mt-5 block"><span className="mb-1.5 block text-sm font-semibold">標註位置</span><input defaultValue="目前查看區塊" className="h-11 w-full rounded-lg border border-[#cfc8bf] bg-white px-3 focus:border-[#a16207] focus:outline-none" /></label>
          <label className="mt-4 flex flex-1 flex-col"><span className="mb-1.5 block text-sm font-semibold">內容</span><textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-40 flex-1 resize-none rounded-lg border border-[#cfc8bf] bg-white p-3 focus:border-[#a16207] focus:outline-none" placeholder="請描述要確認或調整的地方…" required /></label>
          <button className={`${buttonStyles.gold} mt-5 w-full`}><Send className="size-4" />送出標註</button>
        </form>}
      </div></div>}
    </>
  );
}
