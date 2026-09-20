"use client";

import type { AccentTone } from "@/components/PrimaryActionCard";

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
  void tone;
  void dark;
  const variantClass =
    variant === "primary"
      ? "accent-bg accent-border"
      : variant === "subtle"
        ? "accent-border accent-text accent-hover bg-transparent"
        : "accent-soft";
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
