"use client";

export type AccentTone = "slate" | "amber" | "blue" | "violet";

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
  void tone;
  return (
    <button
      type="button"
      onClick={onClick}
      className="accent-soft group flex min-h-20 w-full cursor-pointer items-center gap-4 rounded-[24px] border p-4 text-left transition duration-200 hover:-translate-y-px active:scale-[0.985] active:opacity-90 sm:p-5"
    >
      <span className="accent-bg flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm">
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
        className="accent-text shrink-0 text-2xl transition-transform duration-200 group-hover:translate-x-0.5"
      >
        ›
      </span>
    </button>
  );
}
