"use client";

import type { AccentTone } from "@/components/PrimaryActionCard";

const toneStyles: Record<AccentTone, { light: string; dark: string }> = {
  slate: {
    light:
      "border-slate-300 bg-slate-50/70 text-slate-700 hover:border-slate-400 hover:bg-slate-100",
    dark: "border-slate-700 bg-slate-800/60 text-slate-200 hover:border-slate-500 hover:bg-slate-800",
  },
  amber: {
    light:
      "border-amber-300 bg-amber-50/70 text-amber-800 hover:border-amber-400 hover:bg-amber-100",
    dark: "border-amber-900 bg-amber-950/30 text-amber-300 hover:border-amber-700 hover:bg-amber-950/50",
  },
  blue: {
    light:
      "border-blue-300 bg-blue-50/70 text-blue-700 hover:border-blue-400 hover:bg-blue-100",
    dark: "border-blue-900 bg-blue-950/30 text-blue-300 hover:border-blue-700 hover:bg-blue-950/50",
  },
  violet: {
    light:
      "border-violet-300 bg-violet-50/70 text-violet-700 hover:border-violet-400 hover:bg-violet-100",
    dark: "border-violet-900 bg-violet-950/30 text-violet-300 hover:border-violet-700 hover:bg-violet-950/50",
  },
};

export default function ActionButton({
  label,
  onClick,
  tone = "slate",
  dark = false,
  icon,
  chevron = true,
  fullOnMobile = false,
  variant = "secondary",
}: {
  label: string;
  onClick: () => void;
  tone?: AccentTone;
  dark?: boolean;
  icon?: React.ReactNode;
  chevron?: boolean;
  fullOnMobile?: boolean;
  variant?: "primary" | "secondary" | "subtle";
}) {
  const colors = toneStyles[tone];
  const variantClass =
    variant === "primary"
      ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-700"
      : variant === "subtle"
        ? dark
          ? "border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
          : "border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50"
        : dark
          ? colors.dark
          : colors.light;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] active:opacity-90 ${fullOnMobile ? "w-full sm:w-auto" : ""} ${variantClass}`}
    >
      {icon && (
        <span aria-hidden="true" className="text-base">
          {icon}
        </span>
      )}
      <span>{label}</span>
      {chevron && (
        <span
          aria-hidden="true"
          className="ml-auto text-lg leading-none transition-transform duration-200 group-hover:translate-x-0.5"
        >
          ›
        </span>
      )}
    </button>
  );
}
