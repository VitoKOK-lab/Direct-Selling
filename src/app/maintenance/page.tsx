import type { Metadata } from "next";
import { Sparkles, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "測試網頁維護中｜LUXKEY",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#151210] p-6 text-white">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-8 flex items-center justify-center gap-3">
          <div className="grid size-12 place-items-center border border-[#c59a43]/55 bg-[#c59a43]/10 text-[#e2c680]">
            <Sparkles className="size-5" aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold tracking-[.34em] text-[#d6b86e]">LUXKEY</p>
            <p className="mt-0.5 text-sm text-[#a89f93]">示範驗證系統</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#c59a43]/30 bg-[#c59a43]/10 px-4 py-2 text-sm font-semibold text-[#e2c680]">
          <Wrench className="size-4" aria-hidden="true" />
          系統維護
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-.02em] text-[#efe9dd]">測試網頁維護中</h1>
        <p className="mt-4 text-base leading-7 text-[#cfc7ba]">
          本測試系統目前暫停開放使用，
          <br />
          維護完成後再行公告，造成不便敬請見諒。
        </p>
        <div className="mx-auto mt-10 h-px max-w-xs bg-gradient-to-r from-transparent via-[#c59a43]/40 to-transparent" />
        <p className="mt-6 text-xs text-[#8a8178]">LUXKEY 會員商城暨分潤系統・示範驗證環境</p>
      </div>
    </main>
  );
}
