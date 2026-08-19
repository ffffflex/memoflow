"use client";

import type { Language } from "@/lib/translations";
import { getTranslations } from "@/lib/translations";
import type { Theme } from "@/lib/types";

type Props = {
  language: Language;
  theme: Theme;
  onLanguageChange: (language: Language) => void;
  onThemeChange: (theme: Theme) => void;
};

const themeOptions: {
  value: Theme;
  preview: string;
}[] = [
  {
    value: "default",
    preview: "bg-[#f6f7fb]",
  },
  {
    value: "white",
    preview: "bg-white",
  },
  {
    value: "warm",
    preview: "bg-[#f8f2e8]",
  },
  {
    value: "blue",
    preview: "bg-[#edf4ff]",
  },
  {
    value: "purple",
    preview: "bg-[#f3efff]",
  },
  {
    value: "dark",
    preview: "bg-slate-900",
  },
];

export default function SettingsPage({
  language,
  theme,
  onLanguageChange,
  onThemeChange,
}: Props) {
  const t = getTranslations(language);

  const getThemeName = (value: Theme) => {
    switch (value) {
      case "default":
        return t.defaultTheme;
      case "white":
        return t.whiteTheme;
      case "warm":
        return t.warmTheme;
      case "blue":
        return t.blueTheme;
      case "purple":
        return t.purpleTheme;
      case "dark":
        return t.darkTheme;
    }
  };

  return (
    <>
      <header className="mb-8">
        <p className="text-sm font-medium text-slate-400">
          Preferences
        </p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          {t.settings}
        </h2>
      </header>

      <div className="space-y-6">
        {/* LANGUAGE */}
        <section className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold">
              {t.language}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              中文 / English / Español
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <LanguageButton
              label="中文"
              active={language === "zh"}
              onClick={() => onLanguageChange("zh")}
            />

            <LanguageButton
              label="English"
              active={language === "en"}
              onClick={() => onLanguageChange("en")}
            />

            <LanguageButton
              label="Español"
              active={language === "es"}
              onClick={() => onLanguageChange("es")}
            />
          </div>
        </section>

        {/* APPEARANCE */}
        <section className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold">
              {t.appearance}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {t.background}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onThemeChange(option.value)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  theme === option.value
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`h-12 w-12 shrink-0 rounded-2xl border border-slate-200 ${option.preview}`}
                />

                <div>
                  <p className="font-medium">
                    {getThemeName(option.value)}
                  </p>

                  {theme === option.value && (
                    <p className="mt-1 text-xs text-slate-400">
                      ✓
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function LanguageButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-sm font-medium transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}