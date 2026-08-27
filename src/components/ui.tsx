import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  helper,
  trend,
  icon: Icon,
  tone = "gold",
}: {
  label: string;
  value: string;
  helper: string;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  icon: LucideIcon;
  tone?: "gold" | "green" | "blue" | "stone";
}) {
  const tones = {
    gold: "bg-[#f8efd9] text-[#8a6107]",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    stone: "bg-stone-100 text-stone-700",
  };
  const TrendIcon = trend?.direction === "up" ? ArrowUpRight : trend?.direction === "down" ? ArrowDownRight : Minus;
  return (
    <article className="surface min-w-0 rounded-xl p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(28,25,23,.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className={clsx("grid size-9 shrink-0 place-items-center rounded-lg", tones[tone])}><Icon className="size-[18px]" aria-hidden="true" /></div>
        {trend && <span className={clsx("inline-flex items-center gap-0.5 text-xs font-semibold", trend.direction === "up" ? "text-emerald-700" : trend.direction === "down" ? "text-red-700" : "text-stone-500")}><TrendIcon className="size-3.5" />{trend.value}</span>}
      </div>
      <p className="mt-4 truncate text-xs font-medium text-[#78716c]">{label}</p>
      <p className="font-data mt-1 truncate text-[1.5625rem] font-semibold leading-tight tracking-[-.04em] text-[#1c1917]">{value}</p>
      <p className="mt-2 truncate text-[0.6875rem] text-[#918a82]">{helper}</p>
    </article>
  );
}

const badgeTone: Record<string, string> = {
  normal: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-800 ring-red-200",
  info: "bg-blue-50 text-blue-800 ring-blue-200",
  neutral: "bg-stone-100 text-stone-700 ring-stone-200",
  gold: "bg-[#f8efd9] text-[#795307] ring-[#e4ca8a]",
};

export function StatusBadge({ children, tone = "neutral", dot = true }: { children: ReactNode; tone?: keyof typeof badgeTone; dot?: boolean }) {
  return <span className={clsx("inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[0.6875rem] font-semibold ring-1 ring-inset", badgeTone[tone])}>{dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}{children}</span>;
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-[0.6875rem] font-bold tracking-[.15em] text-[#8a6107]">{eyebrow}</p>}
        <h2 className="text-xl font-semibold tracking-[-.025em] text-[#1c1917]">{title}</h2>
        {description && <p className="mt-1 text-sm text-[#78716c]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, max = 100, label, tone = "gold" }: { value: number; max?: number; label?: string; tone?: "gold" | "green" | "blue" }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const colors = { gold: "bg-[#a16207]", green: "bg-emerald-600", blue: "bg-blue-600" };
  return (
    <div>
      {label && <div className="mb-1.5 flex items-center justify-between text-[0.6875rem] text-[#78716c]"><span>{label}</span><span className="font-data">{Math.round(percent)}%</span></div>}
      <div className="h-1.5 overflow-hidden rounded-full bg-[#ebe7e1]" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div className={clsx("h-full rounded-full transition-all duration-300", colors[tone])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function SegmentedBars({ values, labels, active = -1 }: { values: number[]; labels?: string[]; active?: number }) {
  const max = Math.max(...values, 1);
  return (
    <div className="grid h-28 auto-cols-fr grid-flow-col items-end gap-1 sm:gap-2" aria-label="趨勢圖">
      {values.map((value, index) => (
        <div key={`${index}-${value}`} className="flex min-w-0 flex-col items-center justify-end gap-1.5">
          <div className={clsx("w-full rounded-t-sm transition duration-200 hover:opacity-80", index === active ? "bg-[#a16207]" : "bg-[#d8c59c]")} style={{ height: `${Math.max(8, (value / max) * 88)}px` }} title={`${labels?.[index] ?? index + 1}: ${value}`} />
          {labels && <span className="truncate text-[0.625rem] text-[#918a82]">{labels[index]}</span>}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-[#cfc8bf] bg-[#fffdfa] p-8 text-center"><div><div className="mx-auto grid size-11 place-items-center rounded-full bg-stone-100 text-stone-500"><Icon className="size-5" /></div><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 max-w-sm text-sm text-[#78716c]">{description}</p></div></div>;
}

export function DataTable({ headers, children, minWidth = 760 }: { headers: string[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        <thead><tr className="border-b border-[#ded9d2] bg-[#f8f6f2]">{headers.map((header) => <th key={header} className="px-3 py-2.5 text-[0.6875rem] font-semibold tracking-wide text-[#706a64]">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#ebe7e1]">{children}</tbody>
      </table>
    </div>
  );
}

export function PageIntro({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-2xl font-semibold tracking-[-.035em] text-[#1c1917] sm:text-[1.75rem]">{title}</h1><p className="mt-1 max-w-3xl text-sm text-[#78716c]">{description}</p></div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}

export const buttonStyles = {
  primary: "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#1c1917] px-3.5 text-sm font-semibold text-white transition hover:bg-[#342e2a]",
  gold: "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#8a6107] px-3.5 text-sm font-semibold text-white transition hover:bg-[#704d06]",
  secondary: "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#cfc8bf] bg-white px-3.5 text-sm font-semibold text-[#292524] transition hover:bg-[#f7f5f2]",
  ghost: "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-[#57534e] transition hover:bg-stone-100 hover:text-[#1c1917]",
};
