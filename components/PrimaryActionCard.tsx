"use client";

export type AccentTone = "slate" | "amber" | "blue" | "violet";

const tones: Record<
  AccentTone,
  { light: string; dark: string; icon: string; chevron: string }
> = {
  slate: {
    light:
      "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100/80",
    dark: "border-slate-700 bg-slate-800/70 hover:border-slate-600 hover:bg-slate-800",
    icon: "bg-slate-900 text-white",
    chevron: "text-slate-500",
  },
  amber: {
    light:
      "border-amber-200 bg-amber-50/80 hover:border-amber-300 hover:bg-amber-100/70",
    dark: "border-amber-900/70 bg-amber-950/35 hover:border-amber-800",
    icon: "bg-amber-500 text-white",
    chevron: "text-amber-600",
  },
  blue: {
    light:
      "border-blue-200 bg-blue-50/80 hover:border-blue-300 hover:bg-blue-100/70",
    dark: "border-blue-900/70 bg-blue-950/35 hover:border-blue-800",
    icon: "bg-blue-600 text-white",
    chevron: "text-blue-600",
  },
  violet: {
    light:
      "border-violet-200 bg-violet-50/80 hover:border-violet-300 hover:bg-violet-100/70",
    dark: "border-violet-900/70 bg-violet-950/35 hover:border-violet-800",
    icon: "bg-violet-600 text-white",
    chevron: "text-violet-600",
  },
};

export default function PrimaryActionCard({
  icon,
  title,
  description,
  onClick,
  tone = "slate",
  dark = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  tone?: AccentTone;
  dark?: boolean;
}) {
  const style = tones[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-20 w-full cursor-pointer items-center gap-4 rounded-[24px] border p-4 text-left transition duration-200 hover:-translate-y-px active:scale-[0.985] active:opacity-90 sm:p-5 ${dark ? style.dark : style.light}`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm ${dark && tone === "slate" ? "bg-slate-100 text-slate-900" : style.icon}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{title}</span>
        <span
          className={`mt-1 block text-sm leading-5 ${dark ? "text-slate-400" : "text-slate-500"}`}
        >
          {description}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`shrink-0 text-2xl transition-transform duration-200 group-hover:translate-x-0.5 ${style.chevron}`}
      >
        ›
      </span>
    </button>
  );
}
