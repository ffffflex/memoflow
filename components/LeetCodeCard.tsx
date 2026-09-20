"use client";

import { useMemo, useState } from "react";
import {
  parseLeetCodePlan,
  resolvePlanDates,
  type ParsedLeetCodePlan,
} from "@/lib/leetcode-plan-parser";
import PrimaryActionCard, {
  type AccentTone,
} from "@/components/PrimaryActionCard";
import ActionButton from "@/components/ActionButton";

export type LeetCodeProblem = {
  id: string;
  problemNumber: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  plannedDate: string;
  completed: boolean;
  completedAt: string | null;
};
export type NewLeetCodeProblem = Omit<
  LeetCodeProblem,
  "id" | "completed" | "completedAt"
>;
type Labels = {
  todaysLeetCode: string;
  addProblem: string;
  viewProgress: string;
  problemNumber: string;
  title: string;
  difficulty: string;
  topic: string;
  plannedDate: string;
  easy: string;
  medium: string;
  hard: string;
  cancel: string;
  save: string;
  todayCompleted: string;
  weekCompleted: string;
  totalCompleted: string;
  streak: string;
  days: string;
  topicBreakdown: string;
  noProblemsToday: string;
  edit: string;
  delete: string;
};
type DraftProblem = NewLeetCodeProblem & {
  key: string;
  duplicate: boolean;
  skip: boolean;
};

const COPY = {
  zh: {
    importPlan: "导入计划",
    importPrimary: "导入刷题计划",
    importAnother: "导入新的刷题计划",
    importDescription: "粘贴文本或上传完整计划",
    importMoreDescription: "从文本或文件继续添加计划",
    emptyTitle: "还没有刷题计划",
    emptyDescription:
      "导入你的刷题计划，MemoFlow 会自动识别每天需要完成的 LeetCode 题目。",
    manualAdd: "手动添加一道题",
    viewPlan: "查看计划",
    pasteText: "粘贴文本",
    uploadFile: "上传文件",
    importHint: "粘贴学习计划，或上传 .txt、.md、.csv 文件。",
    parse: "解析计划",
    startDate: "计划开始日期",
    perDay: "每天题目数",
    continuePreview: "生成预览",
    preview: "导入预览",
    found: "识别到",
    problems: "道题",
    weeks: "周",
    duplicate: "重复",
    skipDuplicate: "跳过重复项",
    confirmImport: "确认导入",
    importing: "正在导入…",
    remove: "移除",
    emptyPlan: "没有识别到有效题号，请检查格式。",
    fileError: "无法读取该文件。",
    pdfError: "此 PDF 无法可靠提取文字，请转换为 .txt、.md 或 .csv 后重试。",
    plan: "刷题计划",
    noPlan: "还没有计划题目",
    editProblem: "编辑题目",
    imported: "计划导入成功。",
  },
  en: {
    importPlan: "Import Plan",
    importPrimary: "Import study plan",
    importAnother: "Import another study plan",
    importDescription: "Paste text or upload a complete plan",
    importMoreDescription: "Continue adding from text or a file",
    emptyTitle: "No study plan yet",
    emptyDescription:
      "Import a plan and MemoFlow will identify the LeetCode problems to complete each day.",
    manualAdd: "Manually add a problem",
    viewPlan: "View Plan",
    pasteText: "Paste Text",
    uploadFile: "Upload File",
    importHint: "Paste a study plan or upload a .txt, .md, or .csv file.",
    parse: "Parse Plan",
    startDate: "Plan start date",
    perDay: "Problems per day",
    continuePreview: "Build Preview",
    preview: "Import Preview",
    found: "Found",
    problems: "problems",
    weeks: "weeks",
    duplicate: "Duplicate",
    skipDuplicate: "Skip duplicates",
    confirmImport: "Confirm Import",
    importing: "Importing…",
    remove: "Remove",
    emptyPlan: "No valid problem numbers were found. Check the format.",
    fileError: "The file could not be read.",
    pdfError:
      "This PDF cannot be extracted reliably. Convert it to .txt, .md, or .csv and try again.",
    plan: "LeetCode Plan",
    noPlan: "No planned problems yet",
    editProblem: "Edit Problem",
    imported: "Plan imported successfully.",
  },
  es: {
    importPlan: "Importar plan",
    importPrimary: "Importar plan de estudio",
    importAnother: "Importar otro plan",
    importDescription: "Pega texto o sube un plan completo",
    importMoreDescription: "Añade más desde texto o archivo",
    emptyTitle: "Aún no hay plan de estudio",
    emptyDescription:
      "Importa un plan y MemoFlow identificará los problemas de LeetCode para cada día.",
    manualAdd: "Añadir un problema manualmente",
    viewPlan: "Ver plan",
    pasteText: "Pegar texto",
    uploadFile: "Subir archivo",
    importHint: "Pega un plan o sube un archivo .txt, .md o .csv.",
    parse: "Analizar plan",
    startDate: "Fecha de inicio",
    perDay: "Problemas por día",
    continuePreview: "Crear vista previa",
    preview: "Vista previa",
    found: "Se encontraron",
    problems: "problemas",
    weeks: "semanas",
    duplicate: "Duplicado",
    skipDuplicate: "Omitir duplicados",
    confirmImport: "Confirmar importación",
    importing: "Importando…",
    remove: "Quitar",
    emptyPlan: "No se encontraron números de problema válidos.",
    fileError: "No se pudo leer el archivo.",
    pdfError:
      "No se puede extraer este PDF de forma fiable. Conviértelo a .txt, .md o .csv.",
    plan: "Plan de LeetCode",
    noPlan: "Todavía no hay problemas planificados",
    editProblem: "Editar problema",
    imported: "Plan importado correctamente.",
  },
} as const;

export default function LeetCodeCard({
  problems,
  labels,
  language,
  today,
  dark,
  accentTone,
  onCreate,
  onBulkImport,
  onUpdate,
  onDelete,
  onToggle,
}: {
  problems: LeetCodeProblem[];
  labels: Labels;
  language: "zh" | "en" | "es";
  today: string;
  dark: boolean;
  accentTone: AccentTone;
  onCreate: (problem: NewLeetCodeProblem) => Promise<boolean>;
  onBulkImport: (problems: NewLeetCodeProblem[]) => Promise<boolean>;
  onUpdate: (id: string, problem: NewLeetCodeProblem) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (problem: LeetCodeProblem) => Promise<void>;
}) {
  const copy = COPY[language];
  const [showEditor, setShowEditor] = useState(false),
    [showProgress, setShowProgress] = useState(false),
    [showPlan, setShowPlan] = useState(false),
    [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<LeetCodeProblem | null>(null);
  const [saving, setSaving] = useState(false),
    [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState(""),
    [importError, setImportError] = useState("");
  const [parsedPlan, setParsedPlan] = useState<ParsedLeetCodePlan | null>(null),
    [startDate, setStartDate] = useState("");
  const [problemsPerDay, setProblemsPerDay] = useState(5),
    [drafts, setDrafts] = useState<DraftProblem[]>([]);
  const todaysProblems = problems.filter(
    (problem) => problem.plannedDate === today,
  );
  const completedToday = todaysProblems.filter(
    (problem) => problem.completed,
  ).length;
  const percentage = todaysProblems.length
    ? Math.round((completedToday / todaysProblems.length) * 100)
    : 0;

  const stats = useMemo(() => {
    const completed = problems.filter(
      (problem) => problem.completed && problem.completedAt,
    );
    const todayStart = new Date(`${today}T00:00:00`),
      weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - ((todayStart.getDay() + 6) % 7));
    const week = completed.filter(
      (problem) => new Date(problem.completedAt!) >= weekStart,
    ).length;
    const topics = completed.reduce<Record<string, number>>(
      (result, problem) => {
        const key = problem.topic.trim() || "—";
        result[key] = (result[key] ?? 0) + 1;
        return result;
      },
      {},
    );
    const completedDays = new Set(
      completed.map((problem) => localDateKey(new Date(problem.completedAt!))),
    );
    let streak = 0;
    const cursor = new Date(todayStart);
    while (completedDays.has(localDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return {
      total: completed.length,
      week,
      streak,
      topics: Object.entries(topics).sort((a, b) => b[1] - a[1]),
    };
  }, [problems, today]);

  const groupedPlan = useMemo(
    () =>
      [...problems]
        .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
        .reduce<Record<string, LeetCodeProblem[]>>((groups, problem) => {
          (groups[problem.plannedDate] ??= []).push(problem);
          return groups;
        }, {}),
    [problems],
  );
  const resetImport = () => {
    setShowImport(false);
    setImportText("");
    setImportError("");
    setParsedPlan(null);
    setStartDate("");
    setProblemsPerDay(5);
    setDrafts([]);
  };
  const buildDrafts = (plan: ParsedLeetCodePlan, resolved = plan.problems) => {
    const seen = new Set(
      problems.map(
        (problem) => `${problem.problemNumber}|${problem.plannedDate}`,
      ),
    );
    setDrafts(
      resolved.map((problem, index) => {
        const plannedDate = problem.plannedDate ?? "",
          signature = `${problem.problemNumber}|${plannedDate}`,
          duplicate = seen.has(signature);
        seen.add(signature);
        return {
          key: `${problem.order}-${index}`,
          problemNumber: problem.problemNumber,
          title: problem.title ?? `Problem ${problem.problemNumber}`,
          difficulty: "easy",
          topic: problem.topic ?? "",
          plannedDate,
          duplicate,
          skip: duplicate,
        };
      }),
    );
  };
  const parseImport = () => {
    const plan = parseLeetCodePlan(importText);
    if (!plan.problems.length) {
      setImportError(copy.emptyPlan);
      return;
    }
    setImportError("");
    setParsedPlan(plan);
    if (!plan.needsStartDate) buildDrafts(plan);
  };
  const resolveDates = () => {
    if (parsedPlan && startDate)
      buildDrafts(
        parsedPlan,
        resolvePlanDates(parsedPlan.problems, startDate, problemsPerDay),
      );
  };
  const readFile = async (file: File) => {
    setImportError("");
    if (
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf"
    ) {
      setImportError(copy.pdfError);
      return;
    }
    try {
      setImportText(await file.text());
    } catch {
      setImportError(copy.fileError);
    }
  };
  const confirmImport = async () => {
    const rows = drafts
      .filter((draft) => !draft.skip)
      .map((draft) => ({
        problemNumber: draft.problemNumber,
        title: draft.title,
        difficulty: draft.difficulty,
        topic: draft.topic,
        plannedDate: draft.plannedDate,
      }));
    if (!rows.length) return;
    setImporting(true);
    const saved = await onBulkImport(rows);
    setImporting(false);
    if (saved) {
      resetImport();
      window.alert(copy.imported);
    }
  };
  const updateDraft = (key: string, changes: Partial<DraftProblem>) =>
    setDrafts((current) =>
      current.map((draft) => {
        if (draft.key !== key) return draft;
        const next = { ...draft, ...changes };
        const signature = `${next.problemNumber}|${next.plannedDate}`;
        const duplicate =
          problems.some(
            (problem) =>
              `${problem.problemNumber}|${problem.plannedDate}` === signature,
          ) ||
          current.some(
            (other) =>
              other.key !== key &&
              `${other.problemNumber}|${other.plannedDate}` === signature,
          );
        return {
          ...next,
          duplicate,
          skip: duplicate ? (draft.duplicate ? next.skip : true) : false,
        };
      }),
    );

  return (
    <>
      <section
        className={`rounded-[28px] p-5 shadow-sm md:p-6 ${dark ? "bg-slate-900" : "bg-white"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">{labels.todaysLeetCode}</h3>
          <ActionButton
            label={labels.viewProgress}
            icon="◔"
            onClick={() => setShowProgress(true)}
            tone={accentTone}
            dark={dark}
          />
        </div>
        {problems.length === 0 ? (
          <div className="py-5 text-center">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${dark ? "bg-slate-800" : "bg-slate-100"}`}
            >
              ⌁
            </div>
            <h4 className="mt-4 font-bold">{copy.emptyTitle}</h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center justify-between text-sm font-semibold">
              <span>
                {completedToday} / {todaysProblems.length}
              </span>
              <span>{percentage}%</span>
            </div>
            <div
              className={`mt-2 h-2.5 overflow-hidden rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"}`}
            >
              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="mt-5 space-y-2">
              {todaysProblems.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-400">
                  {labels.noProblemsToday}
                </p>
              )}
              {todaysProblems.map((problem) => (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  dark={dark}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </>
        )}
        <div className="mt-5">
          <PrimaryActionCard
            icon="↑"
            title={problems.length ? copy.importAnother : copy.importPrimary}
            description={
              problems.length
                ? copy.importMoreDescription
                : copy.importDescription
            }
            onClick={() => setShowImport(true)}
            tone={accentTone}
            dark={dark}
          />
        </div>
        <div
          className={`mt-4 flex flex-col gap-2 sm:flex-row ${problems.length ? "" : "justify-center"}`}
        >
          {problems.length > 0 && (
            <ActionButton
              label={copy.viewPlan}
              onClick={() => setShowPlan(true)}
              tone={accentTone}
              dark={dark}
              fullOnMobile
            />
          )}
          <ActionButton
            label={problems.length ? labels.addProblem : copy.manualAdd}
            icon="＋"
            onClick={() => {
              setEditing(null);
              setShowEditor(true);
            }}
            tone={accentTone}
            dark={dark}
            fullOnMobile
            variant={problems.length ? "secondary" : "subtle"}
          />
        </div>
      </section>

      {showEditor && (
        <ProblemEditor
          labels={labels}
          dark={dark}
          initial={editing ?? undefined}
          today={today}
          saving={saving}
          title={editing ? copy.editProblem : labels.addProblem}
          close={() => {
            setShowEditor(false);
            setEditing(null);
          }}
          submit={async (problem) => {
            setSaving(true);
            const saved = editing
              ? await onUpdate(editing.id, problem)
              : await onCreate(problem);
            setSaving(false);
            if (saved) {
              setShowEditor(false);
              setEditing(null);
            }
          }}
        />
      )}

      {showImport && (
        <Modal
          dark={dark}
          title={drafts.length ? copy.preview : copy.importPlan}
          close={resetImport}
          wide
        >
          {!parsedPlan && (
            <div>
              <p className="mb-3 text-sm text-slate-400">{copy.importHint}</p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className={`${inputClass(dark)} min-h-64 resize-y font-mono text-sm`}
                placeholder={copy.pasteText}
              />
              <label
                className={`mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-sm ${dark ? "border-slate-700" : "border-slate-300"}`}
              >
                {copy.uploadFile}
                <input
                  type="file"
                  accept=".txt,.md,.csv,.pdf,text/plain,text/markdown,text/csv,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void readFile(file);
                  }}
                />
              </label>
              {importError && (
                <p className="mt-3 text-sm text-red-500">{importError}</p>
              )}
              <div className="mt-5 flex justify-end">
                <button
                  disabled={!importText.trim()}
                  onClick={parseImport}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {copy.parse}
                </button>
              </div>
            </div>
          )}
          {parsedPlan && !drafts.length && (
            <div>
              <p className="mb-5 text-sm text-slate-400">
                {copy.found}{" "}
                {parsedPlan.weekCount
                  ? `${parsedPlan.weekCount} ${copy.weeks} · `
                  : ""}
                {parsedPlan.problems.length} {copy.problems}
              </p>
              <Field label={copy.startDate}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass(dark)}
                />
              </Field>
              {parsedPlan.needsDistribution && (
                <Field label={copy.perDay}>
                  <input
                    min="1"
                    type="number"
                    value={problemsPerDay}
                    onChange={(e) =>
                      setProblemsPerDay(Math.max(1, Number(e.target.value)))
                    }
                    className={inputClass(dark)}
                  />
                </Field>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  disabled={!startDate}
                  onClick={resolveDates}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {copy.continuePreview}
                </button>
              </div>
            </div>
          )}
          {drafts.length > 0 && (
            <div>
              <p className="mb-4 text-sm text-slate-400">
                {copy.found} {drafts.length} {copy.problems}
              </p>
              <div className="max-h-[58dvh] space-y-3 overflow-y-auto pr-1">
                {drafts.map((draft) => (
                  <div
                    key={draft.key}
                    className={`rounded-2xl border p-3 ${draft.duplicate ? "border-amber-300" : dark ? "border-slate-700" : "border-slate-200"}`}
                  >
                    <div className="grid gap-2 sm:grid-cols-[90px_1fr_150px]">
                      <input
                        aria-label={labels.problemNumber}
                        min="1"
                        type="number"
                        value={draft.problemNumber}
                        onChange={(e) =>
                          updateDraft(draft.key, {
                            problemNumber: Number(e.target.value),
                          })
                        }
                        className={compactInput(dark)}
                      />
                      <input
                        aria-label={labels.title}
                        value={draft.title}
                        onChange={(e) =>
                          updateDraft(draft.key, { title: e.target.value })
                        }
                        className={compactInput(dark)}
                      />
                      <input
                        aria-label={labels.plannedDate}
                        type="date"
                        value={draft.plannedDate}
                        onChange={(e) =>
                          updateDraft(draft.key, {
                            plannedDate: e.target.value,
                          })
                        }
                        className={compactInput(dark)}
                      />
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_130px_auto]">
                      <input
                        aria-label={labels.topic}
                        value={draft.topic}
                        onChange={(e) =>
                          updateDraft(draft.key, { topic: e.target.value })
                        }
                        className={compactInput(dark)}
                      />
                      <select
                        value={draft.difficulty}
                        onChange={(e) =>
                          updateDraft(draft.key, {
                            difficulty: e.target
                              .value as LeetCodeProblem["difficulty"],
                          })
                        }
                        className={compactInput(dark)}
                      >
                        <option value="easy">{labels.easy}</option>
                        <option value="medium">{labels.medium}</option>
                        <option value="hard">{labels.hard}</option>
                      </select>
                      <button
                        onClick={() =>
                          setDrafts((current) =>
                            current.filter((item) => item.key !== draft.key),
                          )
                        }
                        className="px-2 text-xs text-red-500"
                      >
                        {copy.remove}
                      </button>
                    </div>
                    {draft.duplicate && (
                      <label className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                        <input
                          type="checkbox"
                          checked={draft.skip}
                          onChange={(e) =>
                            updateDraft(draft.key, { skip: e.target.checked })
                          }
                        />
                        {copy.duplicate} · {copy.skipDuplicate}
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={resetImport}
                  className="rounded-xl px-4 py-2 text-sm text-slate-400"
                >
                  {labels.cancel}
                </button>
                <button
                  disabled={importing || !drafts.some((draft) => !draft.skip)}
                  onClick={confirmImport}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {importing ? copy.importing : copy.confirmImport}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {showPlan && (
        <Modal
          dark={dark}
          title={copy.plan}
          close={() => setShowPlan(false)}
          wide
        >
          {Object.keys(groupedPlan).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {copy.noPlan}
            </p>
          ) : (
            <div className="max-h-[70dvh] space-y-6 overflow-y-auto pr-1">
              {Object.entries(groupedPlan).map(([date, items]) => (
                <section key={date}>
                  <h4 className="mb-2 font-bold">
                    {new Intl.DateTimeFormat(
                      language === "zh"
                        ? "zh-CN"
                        : language === "es"
                          ? "es-ES"
                          : "en-US",
                      { dateStyle: "long" },
                    ).format(new Date(`${date}T12:00:00`))}
                  </h4>
                  <div className="space-y-2">
                    {items.map((problem) => (
                      <div
                        key={problem.id}
                        className={`flex items-start gap-2 rounded-2xl p-3 ${dark ? "bg-slate-800" : "bg-slate-50"}`}
                      >
                        <input
                          type="checkbox"
                          checked={problem.completed}
                          onChange={() => onToggle(problem)}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={
                              problem.completed
                                ? "text-slate-400 line-through"
                                : ""
                            }
                          >
                            {problem.problemNumber}. {problem.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {problem.difficulty}
                            {problem.topic ? ` · ${problem.topic}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setShowPlan(false);
                            setEditing(problem);
                            setShowEditor(true);
                          }}
                          className="text-xs text-slate-400"
                        >
                          {labels.edit}
                        </button>
                        <button
                          onClick={() => onDelete(problem.id)}
                          className="text-xs text-red-400"
                        >
                          {labels.delete}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </Modal>
      )}

      {showProgress && (
        <Modal
          dark={dark}
          title={labels.viewProgress}
          close={() => setShowProgress(false)}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              [
                labels.todayCompleted,
                `${completedToday} / ${todaysProblems.length}`,
              ],
              [labels.weekCompleted, stats.week],
              [labels.totalCompleted, stats.total],
              [labels.streak, `${stats.streak} ${labels.days}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className={`rounded-2xl p-4 ${dark ? "bg-slate-800" : "bg-slate-50"}`}
              >
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <h4 className="mt-6 font-semibold">{labels.topicBreakdown}</h4>
          <div className="mt-3 space-y-2">
            {stats.topics.map(([name, count]) => (
              <div key={name} className="flex justify-between text-sm">
                <span>{name}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

function ProblemRow({
  problem,
  dark,
  onToggle,
}: {
  problem: LeetCodeProblem;
  dark: boolean;
  onToggle: (problem: LeetCodeProblem) => Promise<void>;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl px-3 py-2.5 ${dark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}
    >
      <input
        type="checkbox"
        checked={problem.completed}
        onChange={() => onToggle(problem)}
        className="mt-1 h-4 w-4 accent-slate-900"
      />
      <span className="min-w-0 flex-1">
        <span
          className={problem.completed ? "text-slate-400 line-through" : ""}
        >
          {problem.problemNumber}. {problem.title}
        </span>
        <span className="ml-2 text-xs capitalize text-slate-400">
          {problem.difficulty}
          {problem.topic ? ` · ${problem.topic}` : ""}
        </span>
      </span>
    </label>
  );
}

function ProblemEditor({
  labels,
  dark,
  initial,
  today,
  saving,
  title,
  close,
  submit,
}: {
  labels: Labels;
  dark: boolean;
  initial?: LeetCodeProblem;
  today: string;
  saving: boolean;
  title: string;
  close: () => void;
  submit: (problem: NewLeetCodeProblem) => Promise<void>;
}) {
  const [number, setNumber] = useState(String(initial?.problemNumber ?? "")),
    [problemTitle, setProblemTitle] = useState(initial?.title ?? ""),
    [difficulty, setDifficulty] = useState<LeetCodeProblem["difficulty"]>(
      initial?.difficulty ?? "easy",
    ),
    [topic, setTopic] = useState(initial?.topic ?? ""),
    [plannedDate, setPlannedDate] = useState(initial?.plannedDate ?? today);
  return (
    <Modal dark={dark} title={title} close={close}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit({
            problemNumber: Number(number),
            title: problemTitle.trim(),
            difficulty,
            topic: topic.trim(),
            plannedDate,
          });
        }}
        className="space-y-4"
      >
        <Field label={labels.problemNumber}>
          <input
            required
            min="1"
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={inputClass(dark)}
          />
        </Field>
        <Field label={labels.title}>
          <input
            required
            value={problemTitle}
            onChange={(e) => setProblemTitle(e.target.value)}
            className={inputClass(dark)}
          />
        </Field>
        <Field label={labels.difficulty}>
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as LeetCodeProblem["difficulty"])
            }
            className={inputClass(dark)}
          >
            <option value="easy">{labels.easy}</option>
            <option value="medium">{labels.medium}</option>
            <option value="hard">{labels.hard}</option>
          </select>
        </Field>
        <Field label={labels.topic}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={inputClass(dark)}
          />
        </Field>
        <Field label={labels.plannedDate}>
          <input
            required
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            className={inputClass(dark)}
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={close}
            className="rounded-xl px-4 py-2 text-sm text-slate-400"
          >
            {labels.cancel}
          </button>
          <button
            disabled={saving}
            className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {labels.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Modal({
  dark,
  title,
  close,
  children,
  wide = false,
}: {
  dark: boolean;
  title: string;
  close: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={close}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`max-h-[94dvh] w-full overflow-y-auto rounded-t-[30px] p-6 shadow-2xl sm:rounded-[30px] ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"} ${dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">{title}</h3>
          <button
            onClick={close}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${dark ? "bg-slate-800" : "bg-slate-100"}`}
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
    <label className="mt-4 block text-sm font-semibold first:mt-0">
      {label}
      {children}
    </label>
  );
}
function inputClass(dark: boolean) {
  return `mt-2 w-full rounded-2xl border px-4 py-3 outline-none focus:border-slate-400 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`;
}
function compactInput(dark: boolean) {
  return `min-w-0 rounded-xl border px-3 py-2 text-sm outline-none ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`;
}
function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
