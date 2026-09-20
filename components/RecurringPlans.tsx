"use client";

import { FormEvent, useState } from "react";
import {
  getNextOccurrence,
  getPreviousOccurrences,
  type NewRecurringPlan,
  type RecurringPlan,
  type RecurringPlanCompletion,
  type RecurrenceType,
} from "@/lib/recurring-plans";
import PrimaryActionCard, {
  type AccentTone,
} from "@/components/PrimaryActionCard";
import ActionButton from "@/components/ActionButton";

type Lang = "zh" | "en" | "es";
type Props = {
  plans: RecurringPlan[];
  completions: RecurringPlanCompletion[];
  language: Lang;
  today: string;
  dark: boolean;
  accentTone: AccentTone;
  onCreate: (plan: NewRecurringPlan) => Promise<boolean>;
  onUpdate: (id: string, plan: NewRecurringPlan) => Promise<boolean>;
  onToggleActive: (plan: RecurringPlan) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const C = {
  zh: {
    title: "周期计划",
    create: "新建周期计划",
    empty: "还没有周期计划",
    edit: "编辑",
    pause: "暂停",
    resume: "恢复",
    del: "删除",
    next: "下一次",
    history: "最近记录",
    name: "名称",
    description: "描述（可选）",
    start: "开始日期",
    repeat: "重复类型",
    daily: "每天",
    interval_days: "每 X 天",
    weekly: "每周",
    interval_weeks: "每 X 周",
    monthly: "每月",
    every: "每",
    days: "天",
    weeks: "周",
    on: "重复日",
    day: "每月日期",
    end: "结束",
    never: "永不",
    onDate: "指定日期",
    category: "分类",
    save: "保存",
    cancel: "取消",
    deleteConfirm: "确定删除这个周期计划吗？",
    noHistory: "还没有已排期记录",
    study: "学习",
    work: "工作",
    project: "项目",
    health: "健康",
    life: "生活",
    paused: "已暂停",
  },
  en: {
    title: "Recurring Plans",
    create: "New Recurring Plan",
    empty: "No recurring plans yet",
    edit: "Edit",
    pause: "Pause",
    resume: "Resume",
    del: "Delete",
    next: "Next",
    history: "Recent history",
    name: "Name",
    description: "Description (optional)",
    start: "Start date",
    repeat: "Repeat type",
    daily: "Every day",
    interval_days: "Every X days",
    weekly: "Weekly",
    interval_weeks: "Every X weeks",
    monthly: "Monthly",
    every: "Every",
    days: "days",
    weeks: "weeks",
    on: "Repeat on",
    day: "Day of month",
    end: "End",
    never: "Never",
    onDate: "On date",
    category: "Category",
    save: "Save",
    cancel: "Cancel",
    deleteConfirm: "Delete this recurring plan?",
    noHistory: "No scheduled history yet",
    study: "Study",
    work: "Work",
    project: "Project",
    health: "Health",
    life: "Life",
    paused: "Paused",
  },
  es: {
    title: "Planes recurrentes",
    create: "Nuevo plan recurrente",
    empty: "Aún no hay planes recurrentes",
    edit: "Editar",
    pause: "Pausar",
    resume: "Reanudar",
    del: "Eliminar",
    next: "Próxima",
    history: "Historial reciente",
    name: "Nombre",
    description: "Descripción (opcional)",
    start: "Fecha de inicio",
    repeat: "Tipo de repetición",
    daily: "Cada día",
    interval_days: "Cada X días",
    weekly: "Semanal",
    interval_weeks: "Cada X semanas",
    monthly: "Mensual",
    every: "Cada",
    days: "días",
    weeks: "semanas",
    on: "Repetir el",
    day: "Día del mes",
    end: "Fin",
    never: "Nunca",
    onDate: "En fecha",
    category: "Categoría",
    save: "Guardar",
    cancel: "Cancelar",
    deleteConfirm: "¿Eliminar este plan recurrente?",
    noHistory: "Aún no hay historial programado",
    study: "Estudio",
    work: "Trabajo",
    project: "Proyecto",
    health: "Salud",
    life: "Vida",
    paused: "Pausado",
  },
} as const;
const weekdays = [1, 2, 3, 4, 5, 6, 0];
const weekdayNames = {
  zh: ["日", "一", "二", "三", "四", "五", "六"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};

export function describeRecurrence(plan: RecurringPlan, language: Lang) {
  const c = C[language],
    names = weekdayNames[language];
  if (plan.recurrenceType === "daily") return c.daily;
  if (plan.recurrenceType === "interval_days")
    return `${c.every} ${plan.intervalValue} ${c.days}`;
  if (plan.recurrenceType === "monthly")
    return language === "zh"
      ? `每月 ${plan.dayOfMonth} 日`
      : `${c.day} ${plan.dayOfMonth}`;
  const selected = weekdays
    .filter((day) => plan.weekdays.includes(day))
    .map((day) => names[day])
    .join(language === "zh" ? "、" : ", ");
  return plan.recurrenceType === "weekly"
    ? `${c.weekly} · ${selected}`
    : `${c.every} ${plan.intervalValue} ${c.weeks} · ${selected}`;
}

export function RecurringTodayCard({
  plans,
  completions,
  language,
  today,
  dark,
  accentTone,
  onToggle,
  onOpen,
}: {
  plans: RecurringPlan[];
  completions: RecurringPlanCompletion[];
  language: Lang;
  today: string;
  dark: boolean;
  accentTone: AccentTone;
  onToggle: (plan: RecurringPlan, date: string) => Promise<void>;
  onOpen: () => void;
}) {
  const c = C[language],
    done = new Set(
      completions
        .filter((x) => x.occurrenceDate === today)
        .map((x) => x.planId),
    );
  return (
    <section
      className={`rounded-[28px] p-5 shadow-sm md:p-6 ${dark ? "bg-slate-900" : "bg-white"}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {language === "zh"
            ? "今日周期计划"
            : language === "es"
              ? "Planes recurrentes de hoy"
              : "Today’s recurring plans"}
        </h3>
        <ActionButton
          label={c.title}
          icon="↻"
          onClick={onOpen}
          tone={accentTone}
          dark={dark}
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-400">
        {plans.filter((p) => done.has(p.id)).length} / {plans.length}
      </p>
      <div className="mt-4 space-y-2">
        {plans.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">{c.empty}</p>
        )}
        {plans.map((plan) => (
          <label
            key={plan.id}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl px-3 py-3 ${dark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}
          >
            <input
              className="mt-1 h-4 w-4 accent-slate-900"
              type="checkbox"
              checked={done.has(plan.id)}
              onChange={() => void onToggle(plan, today)}
            />
            <span className="min-w-0 flex-1">
              <span
                className={
                  done.has(plan.id) ? "text-slate-400 line-through" : ""
                }
              >
                {plan.title}
              </span>
              <span className="ml-2 text-xs text-slate-400">
                {describeRecurrence(plan, language)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default function RecurringPlansPage(props: Props) {
  const { plans, completions, language, today, dark } = props,
    c = C[language];
  const [editing, setEditing] = useState<RecurringPlan | null | undefined>(
    undefined,
  );
  const [history, setHistory] = useState<RecurringPlan | null>(null);
  const locale =
    language === "zh" ? "zh-CN" : language === "es" ? "es-ES" : "en-US";
  const subtitle =
    language === "zh"
      ? "让 MemoFlow 自动安排重复发生的事情。"
      : language === "es"
        ? "Deja que MemoFlow organice las cosas que se repiten."
        : "Let MemoFlow schedule the things that repeat.";
  const actionTitle =
    language === "zh"
      ? "创建新的周期计划"
      : language === "es"
        ? "Crear un nuevo plan recurrente"
        : "Create a recurring plan";
  const actionDescription =
    language === "zh"
      ? "每天、每几天、每周或每月自动重复"
      : language === "es"
        ? "Repite cada día, varios días, semana o mes"
        : "Repeat daily, every few days, weekly, or monthly";
  return (
    <>
      <header className="mb-6">
        <h2 className="text-3xl font-bold md:text-4xl">{c.title}</h2>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </header>
      <div className="mb-8">
        <PrimaryActionCard
          icon="＋"
          title={actionTitle}
          description={actionDescription}
          onClick={() => setEditing(null)}
          tone={props.accentTone}
          dark={dark}
        />
      </div>
      <div className="space-y-4">
        {plans.length === 0 && (
          <div
            className={`rounded-[28px] p-10 text-center text-slate-400 ${dark ? "bg-slate-900" : "bg-white"}`}
          >
            <h3
              className={`font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}
            >
              {c.empty}
            </h3>
            <p className="mt-3 text-sm leading-7">
              {language === "zh"
                ? "例如：每周一敷面膜 · 每两天去健身房 · 每天吃维生素"
                : language === "es"
                  ? "Por ejemplo: mascarilla semanal · gimnasio cada dos días · vitaminas diarias"
                  : "For example: a weekly mask · gym every two days · daily vitamins"}
            </p>
          </div>
        )}
        {plans.map((plan) => {
          const next = plan.active ? getNextOccurrence(plan, today) : null;
          return (
            <article
              key={plan.id}
              className={`rounded-[28px] p-5 shadow-sm md:p-6 ${dark ? "bg-slate-900" : "bg-white"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{plan.title}</h3>
                    {!plan.active && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                        {c.paused}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="mt-1 text-sm text-slate-400">
                      {plan.description}
                    </p>
                  )}
                  <p className="mt-3 text-sm font-medium">
                    {describeRecurrence(plan, language)}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {c.next}:{" "}
                    {next
                      ? new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                        }).format(new Date(`${next}T12:00:00`))
                      : "—"}{" "}
                    · {c[plan.category]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    label={c.history}
                    onClick={() => setHistory(plan)}
                    tone={props.accentTone}
                    dark={dark}
                    variant="subtle"
                  />
                  <ActionButton
                    label={c.edit}
                    onClick={() => setEditing(plan)}
                    tone={props.accentTone}
                    dark={dark}
                    variant="subtle"
                    chevron={false}
                  />
                  <ActionButton
                    label={plan.active ? c.pause : c.resume}
                    onClick={() => void props.onToggleActive(plan)}
                    tone={props.accentTone}
                    dark={dark}
                    variant="subtle"
                    chevron={false}
                  />
                  <button
                    onClick={() => {
                      if (window.confirm(c.deleteConfirm))
                        void props.onDelete(plan.id);
                    }}
                    className="min-h-11 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 active:scale-[0.98]"
                  >
                    {c.del}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {editing !== undefined && (
        <Editor
          initial={editing}
          language={language}
          dark={dark}
          today={today}
          close={() => setEditing(undefined)}
          submit={(value) =>
            editing ? props.onUpdate(editing.id, value) : props.onCreate(value)
          }
        />
      )}
      {history && (
        <Modal title={history.title} dark={dark} close={() => setHistory(null)}>
          <h4 className="mb-4 font-semibold">{c.history}</h4>
          {getPreviousOccurrences(history, today, 12).length === 0 ? (
            <p className="text-sm text-slate-400">{c.noHistory}</p>
          ) : (
            <div className="space-y-2">
              {getPreviousOccurrences(history, today, 12).map((date) => (
                <div
                  key={date}
                  className={`flex justify-between rounded-xl px-3 py-2 ${dark ? "bg-slate-800" : "bg-slate-50"}`}
                >
                  <span>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                    }).format(new Date(`${date}T12:00:00`))}
                  </span>
                  <span>
                    {completions.some(
                      (x) =>
                        x.planId === history.id && x.occurrenceDate === date,
                    )
                      ? "✓"
                      : "×"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

function Editor({
  initial,
  language,
  dark,
  today,
  close,
  submit,
}: {
  initial: RecurringPlan | null;
  language: Lang;
  dark: boolean;
  today: string;
  close: () => void;
  submit: (plan: NewRecurringPlan) => Promise<boolean>;
}) {
  const c = C[language],
    [title, setTitle] = useState(initial?.title ?? ""),
    [description, setDescription] = useState(initial?.description ?? ""),
    [startDate, setStartDate] = useState(initial?.startDate ?? today),
    [type, setType] = useState<RecurrenceType>(
      initial?.recurrenceType ?? "daily",
    ),
    [interval, setInterval] = useState(initial?.intervalValue ?? 2),
    [days, setDays] = useState<number[]>(initial?.weekdays ?? [1]),
    [monthDay, setMonthDay] = useState(initial?.dayOfMonth ?? 1),
    [endDate, setEndDate] = useState(initial?.endDate ?? ""),
    [category, setCategory] = useState<NewRecurringPlan["category"]>(
      initial?.category ?? "life",
    ),
    [saving, setSaving] = useState(false);
  const input = `mt-2 w-full rounded-2xl border px-4 py-3 outline-none ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`;
  const handle = async (event: FormEvent) => {
    event.preventDefault();
    if ((type === "weekly" || type === "interval_weeks") && !days.length)
      return;
    setSaving(true);
    const ok = await submit({
      title: title.trim(),
      description: description.trim(),
      category,
      startDate,
      recurrenceType: type,
      intervalValue:
        type === "interval_days" || type === "interval_weeks"
          ? Math.max(1, interval)
          : 1,
      weekdays: type === "weekly" || type === "interval_weeks" ? days : [],
      dayOfMonth:
        type === "monthly" ? Math.min(31, Math.max(1, monthDay)) : null,
      endDate: endDate || null,
      active: initial?.active ?? true,
    });
    setSaving(false);
    if (ok) close();
  };
  return (
    <Modal title={initial ? c.edit : c.create} dark={dark} close={close}>
      <form onSubmit={(e) => void handle(e)} className="space-y-4">
        <Field label={c.name}>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={input}
          />
        </Field>
        <Field label={c.description}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${input} min-h-24`}
          />
        </Field>
        <Field label={c.start}>
          <input
            required
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={input}
          />
        </Field>
        <Field label={c.repeat}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as RecurrenceType)}
            className={input}
          >
            {(
              [
                "daily",
                "interval_days",
                "weekly",
                "interval_weeks",
                "monthly",
              ] as const
            ).map((x) => (
              <option key={x} value={x}>
                {c[x]}
              </option>
            ))}
          </select>
        </Field>
        {(type === "interval_days" || type === "interval_weeks") && (
          <Field label={c.every}>
            <div className="flex items-center gap-3">
              <input
                min="1"
                required
                type="number"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className={input}
              />
              <span className="pt-2">
                {type === "interval_days" ? c.days : c.weeks}
              </span>
            </div>
          </Field>
        )}
        {(type === "weekly" || type === "interval_weeks") && (
          <Field label={c.on}>
            <div className="mt-2 flex flex-wrap gap-2">
              {weekdays.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() =>
                    setDays((current) =>
                      current.includes(day)
                        ? current.filter((x) => x !== day)
                        : [...current, day],
                    )
                  }
                  className={`rounded-xl px-3 py-2 text-sm ${days.includes(day) ? "bg-slate-900 text-white" : dark ? "bg-slate-800" : "bg-slate-100"}`}
                >
                  {weekdayNames[language][day]}
                </button>
              ))}
            </div>
          </Field>
        )}
        {type === "monthly" && (
          <Field label={c.day}>
            <input
              min="1"
              max="31"
              required
              type="number"
              value={monthDay}
              onChange={(e) => setMonthDay(Number(e.target.value))}
              className={input}
            />
          </Field>
        )}
        <Field label={c.end}>
          <div className="mt-2 flex gap-4 text-sm">
            <label>
              <input
                type="radio"
                checked={!endDate}
                onChange={() => setEndDate("")}
              />{" "}
              {c.never}
            </label>
            <label>
              <input
                type="radio"
                checked={!!endDate}
                onChange={() => setEndDate(startDate)}
              />{" "}
              {c.onDate}
            </label>
          </div>
          {endDate && (
            <input
              min={startDate}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={input}
            />
          )}
        </Field>
        <Field label={c.category}>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as NewRecurringPlan["category"])
            }
            className={input}
          >
            {(["study", "work", "project", "health", "life"] as const).map(
              (x) => (
                <option key={x} value={x}>
                  {c[x]}
                </option>
              ),
            )}
          </select>
        </Field>
        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm text-slate-400"
          >
            {c.cancel}
          </button>
          <button
            disabled={saving || !title.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {c.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Modal({
  title,
  dark,
  close,
  children,
}: {
  title: string;
  dark: boolean;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={close}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`max-h-[94dvh] w-full overflow-y-auto rounded-t-[30px] p-6 shadow-2xl sm:max-w-lg sm:rounded-[30px] ${dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">{title}</h3>
          <button
            onClick={close}
            className={`h-9 w-9 rounded-full ${dark ? "bg-slate-800" : "bg-slate-100"}`}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}
